"""Claude-powered claim extraction and evidence-grounded verdicts."""
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
