"""Claude-powered claim extraction and evidence-grounded verdicts."""
import base64
import json
from functools import lru_cache

import anthropic

import config


@lru_cache(maxsize=1)
def _client():
    # Reads ANTHROPIC_API_KEY (or an `ant auth login` profile) from the env.
    return anthropic.Anthropic()


def _first_text(resp):
    return next(b.text for b in resp.content if getattr(b, "type", None) == "text")


def _loads(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return json.loads(text)


def _structured(system, user, schema, max_tokens=3000):
    """Call Claude and return parsed JSON matching `schema`.

    Uses structured outputs when available; falls back to prompt-only JSON so
    the app still works on older SDK versions.
    """
    client = _client()
    try:
        resp = client.messages.create(
            model=config.CLAUDE_MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
            output_config={"format": {"type": "json_schema", "schema": schema}},
        )
        return _loads(_first_text(resp))
    except Exception:
        resp = client.messages.create(
            model=config.CLAUDE_MODEL,
            max_tokens=max_tokens,
            system=system + "\n\nRespond ONLY with valid JSON. No prose, no code fences.",
            messages=[{"role": "user", "content": user}],
        )
        return _loads(_first_text(resp))


# --- OCR (screenshot -> text via Claude vision) -----------------------------

OCR_SYSTEM = (
    "You transcribe text from an image, usually a social-media screenshot. "
    "Output ONLY the readable text you see, as plain prose — include caption, "
    "overlay, and on-image text; preserve sentences and reading order. Do not "
    "describe the image, add commentary, or invent text. If there is no legible "
    "text, output nothing."
)

# Media types Claude accepts for image input.
_OK_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


def ocr_image(image_bytes, media_type="image/png"):
    """Transcribe the text in an image using Claude vision. Returns a string."""
    if media_type not in _OK_IMAGE_TYPES:
        media_type = "image/png"
    b64 = base64.standard_b64encode(image_bytes).decode()
    resp = _client().messages.create(
        model=config.CLAUDE_MODEL,
        max_tokens=1500,
        system=OCR_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64,
                        },
                    },
                    {"type": "text", "text": "Transcribe all text in this image."},
                ],
            }
        ],
    )
    return _first_text(resp).strip()


# --- Claim extraction -------------------------------------------------------

CLAIMS_SCHEMA = {
    "type": "object",
    "properties": {
        "claims": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "text": {"type": "string"},
                    "topic": {"type": "string"},
                },
                "required": ["text", "topic"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["claims"],
    "additionalProperties": False,
}

CLAIMS_SYSTEM = (
    "You extract discrete, checkable HEALTH and NUTRITION claims from a transcript "
    "of spoken audio (e.g. a social-media video).\n"
    "Rules:\n"
    "- Only include factual assertions that could be verified against medical "
    "guidance (e.g. 'eating late at night causes weight gain', 'vitamin C prevents colds').\n"
    "- Ignore opinions, questions, calls to action, personal anecdotes with no "
    "general claim, and pleasantries.\n"
    "- Rewrite each claim as a concise, standalone factual statement in plain English.\n"
    "- Deduplicate. If there are no checkable claims, return an empty list.\n"
    "- 'topic' is a short label like 'nutrition', 'supplements', 'weight loss', "
    "'gut health', 'disease risk'."
)


def extract_claims(transcript):
    """Return a list of {'text', 'topic'} claim dicts."""
    data = _structured(CLAIMS_SYSTEM, f"TRANSCRIPT:\n\n{transcript}", CLAIMS_SCHEMA)
    return data.get("claims", [])


# --- Verdicts ---------------------------------------------------------------

VERDICT_SCHEMA = {
    "type": "object",
    "properties": {
        "verdicts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "claim_index": {"type": "integer"},
                    "status": {
                        "type": "string",
                        "enum": ["Supported", "Contradicted", "Not addressed", "Unclear"],
                    },
                    "confidence": {"type": "string", "enum": ["low", "medium", "high"]},
                    "explanation": {"type": "string"},
                    "citation_ids": {"type": "array", "items": {"type": "string"}},
                },
                "required": [
                    "claim_index",
                    "status",
                    "confidence",
                    "explanation",
                    "citation_ids",
                ],
                "additionalProperties": False,
            },
        }
    },
    "required": ["verdicts"],
    "additionalProperties": False,
}

VERDICT_SYSTEM = (
    "You are a careful health-information fact-checker. For each CLAIM you are given "
    "the retrieved passages from trusted sources (NHS, WHO, ZOE).\n"
    "Judge each claim ONLY against the provided evidence:\n"
    "- 'Supported': the evidence clearly backs the claim.\n"
    "- 'Contradicted': the evidence clearly conflicts with the claim.\n"
    "- 'Not addressed': the evidence doesn't speak to the claim.\n"
    "- 'Unclear': evidence is mixed, partial, or ambiguous.\n"
    "Never use outside knowledge as if it were sourced. Cite the evidence you relied "
    "on using its [id]. Keep explanations to 1-3 sentences, plain and non-alarmist. "
    "Set citation_ids to [] when status is 'Not addressed'."
)


def _build_evidence_block(claims_with_evidence):
    """claims_with_evidence: list of (claim_text, [chunk, ...])."""
    lines, id_map = [], {}
    for i, (claim, chunks) in enumerate(claims_with_evidence):
        lines.append(f'CLAIM {i}: "{claim}"')
        if not chunks:
            lines.append("  (no relevant evidence found)")
        for j, ch in enumerate(chunks):
            cid = f"{i}-{j}"
            id_map[cid] = ch
            snippet = ch["text"][:600]
            lines.append(f'  [{cid}] ({ch["source"].upper()} — {ch["title"]}): {snippet}')
        lines.append("")
    return "\n".join(lines), id_map


def judge_claims(claims_with_evidence):
    """Return (verdicts, id_map).

    verdicts: list of dicts (see VERDICT_SCHEMA).
    id_map: {citation_id -> evidence chunk} for rendering sources.
    """
    block, id_map = _build_evidence_block(claims_with_evidence)
    data = _structured(VERDICT_SYSTEM, block, VERDICT_SCHEMA, max_tokens=4000)
    return data.get("verdicts", []), id_map


# --- Personalisation (opt-in) ----------------------------------------------

PERSONALIZE_SCHEMA = {
    "type": "object",
    "properties": {
        "notes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "claim_index": {"type": "integer"},
                    "relevance": {
                        "type": "string",
                        "enum": ["not_relevant", "relevant", "important", "caution"],
                    },
                    "conditions": {"type": "array", "items": {"type": "string"}},
                    "note": {"type": "string"},
                },
                "required": ["claim_index", "relevance", "conditions", "note"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["notes"],
    "additionalProperties": False,
}

PERSONALIZE_SYSTEM = (
    "You help a user understand whether a health claim matters specifically for "
    "THEM, given what they've told you about themselves (pre-existing conditions "
    "and/or a free-text profile). You are given each claim, our fact-check verdict, "
    "and the user's details.\n"
    "For each claim, rate how it bears on the user:\n"
    "- 'not_relevant': no special bearing on their conditions.\n"
    "- 'relevant': worth being aware of given a condition.\n"
    "- 'important': notably affects management of a condition.\n"
    "- 'caution': acting on this (especially if the claim is false/contradicted) "
    "could be harmful for someone with their condition — advise checking a clinician.\n"
    "Consider that a FALSE claim can be dangerous if believed (e.g. 'you can stop "
    "insulin' for a diabetic). List the specific condition(s) each note applies to. "
    "Keep notes to 1-2 sentences, calm and non-alarmist. This is general information, "
    "not personal medical advice — never tell the user to start/stop a specific "
    "treatment; point them to a professional for anything in 'caution'.\n"
    "IMPORTANT — only personalise when the user is actually talking about THEMSELVES. "
    "You are given their ORIGINAL INPUT. If it is first-person or about their own "
    "situation (e.g. 'I', 'my', 'me', 'should I…', 'is it safe for me'), assess "
    "relevance normally. If it is a general or third-person statement not about the "
    "user personally, return 'not_relevant' for every claim."
)


SUGGESTIONS_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "faqs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "q": {"type": "string"},
                    "a": {"type": "string"},
                },
                "required": ["q", "a"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["summary", "faqs"],
    "additionalProperties": False,
}

SUGGESTIONS_SYSTEM = (
    "You are given health claims that have been fact-checked, with verdicts. "
    "Write a brief, friendly, non-alarmist 'advice summary' (2-4 sentences) for a "
    "general audience that sums up what to take away, and up to 3 short FAQ Q&As a "
    "curious person might ask next (1-2 sentence answers). This is general "
    "information, not personal medical advice — where relevant, suggest speaking to "
    "a GP or pharmacist. Do not tell anyone to start or stop a specific treatment."
)


def suggestions(claims, verdicts_by_index, conditions=None):
    """Return {'summary': str, 'faqs': [{'q','a'}]} for the suggestions screen."""
    lines = []
    if conditions:
        lines.append(f"USER CONDITIONS: {', '.join(conditions)}")
    for i, c in enumerate(claims):
        status = verdicts_by_index.get(i, {}).get("status", "Unclear")
        lines.append(f'- ({status}) "{c["text"]}"')
    data = _structured(SUGGESTIONS_SYSTEM, "\n".join(lines), SUGGESTIONS_SCHEMA, max_tokens=1500)
    return {"summary": data.get("summary", ""), "faqs": data.get("faqs", [])}


def personalize(claims, verdicts_by_index, conditions, profile=None, transcript=None):
    """Return {claim_index: note_dict} keyed by claim index.

    conditions: list of user condition strings (may be empty).
    profile: optional free-text description the user wrote about themselves.
    transcript: the user's original input — the model uses it to decide whether
    the user is talking about themselves (first-person) before personalising.
    """
    if not conditions and not profile:
        return {}
    lines = []
    if conditions:
        lines.append(f"USER CONDITIONS: {', '.join(conditions)}")
    if profile:
        lines.append(f"ABOUT THE USER: {profile}")
    if transcript:
        lines.append(f'ORIGINAL INPUT: "{transcript}"')
    lines.append("")
    for i, c in enumerate(claims):
        status = verdicts_by_index.get(i, {}).get("status", "Unclear")
        lines.append(f'CLAIM {i} (verdict: {status}): "{c["text"]}"')
    data = _structured(PERSONALIZE_SYSTEM, "\n".join(lines), PERSONALIZE_SCHEMA, max_tokens=2500)
    return {n["claim_index"]: n for n in data.get("notes", [])}
