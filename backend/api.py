"""FastAPI backend for the ZoeCheck React front end.

Wraps the existing Python pipeline (transcription, claim extraction, RAG
retrieval, Claude verdicts) and maps its multi-claim output into the
single-verdict shape the redesigned Results screen expects.

Run:  uv run uvicorn backend.api:app --reload --port 8000
"""
import os
import sys

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Make the project root importable when launched as `backend.api`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import llm  # noqa: E402
import transcribe  # noqa: E402
from rag import Store  # noqa: E402

load_dotenv()

app = FastAPI(title="ZoeCheck API")

# Vite dev server runs on a different origin; the proxy handles prod but CORS
# keeps `npm run dev` working if the proxy is bypassed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Verdict mapping --------------------------------------------------------
# The pipeline judges each claim as Supported / Contradicted / Not addressed /
# Unclear. The design speaks in MYTH / NEEDS CONTEXT / SUPPORTED with a colour,
# a headline, and a 0-100 position on the truth scale.
STATUS_META = {
    "Supported": {"tag": "SUPPORTED", "verdict": "Backed by science",
                  "color": "#1E9E5A", "truth": 85},
    "Contradicted": {"tag": "MYTH", "verdict": "Mostly a myth",
                     "color": "#E23744", "truth": 16},
    "Unclear": {"tag": "NEEDS CONTEXT", "verdict": "Needs context",
                "color": "#E0A33B", "truth": 50},
    "Not addressed": {"tag": "UNVERIFIED", "verdict": "Not enough evidence",
                      "color": "#E0A33B", "truth": 50},
}
CONF_NUM = {"low": 60, "medium": 75, "high": 90}

# Per-source credibility tag + icon for the Sources card.
SOURCE_META = {
    "nhs": {"name": "NHS", "tag": "INSTITUTIONAL", "icon": "🏥"},
    "who": {"name": "World Health Organization", "tag": "INSTITUTIONAL", "icon": "🌍"},
    "zoe": {"name": "ZOE", "tag": "SCIENCE-BACKED", "icon": "🔬"},
    "johns_hopkins": {"name": "Johns Hopkins", "tag": "INSTITUTIONAL", "icon": "🏛"},
    "x": {"name": "Social post", "tag": "SOCIAL", "icon": "📱"},
}
DEFAULT_SOURCE = {"name": "", "tag": "REFERENCE", "icon": "📄"}

# Priority when choosing which claim leads the verdict card.
STATUS_PRIORITY = {"Contradicted": 0, "Supported": 1, "Unclear": 2, "Not addressed": 3}

_store = None


def get_store():
    global _store
    if _store is None:
        _store = Store.load()
    return _store


def _source_row(chunk):
    meta = SOURCE_META.get(chunk["source"], DEFAULT_SOURCE)
    note = meta["name"] or chunk["source"].upper()
    return {
        "source": chunk["source"],  # raw id → the frontend picks the matching icon PNG
        "name": chunk["title"],
        "note": note,
        "tag": meta["tag"],
        "icon": meta["icon"],  # emoji fallback when no icon file exists
        "url": chunk.get("url", ""),
    }


def check_claim(transcript, conditions=None, profile=None):
    """Run the full pipeline and return the single-verdict Results payload."""
    claims = llm.extract_claims(transcript)
    if not claims:
        return {"empty": True, "transcript": transcript}

    store = get_store()
    cwe = [(c["text"], store.search(c["text"])) for c in claims]
    verdicts, id_map = llm.judge_claims(cwe)
    by_index = {v["claim_index"]: v for v in verdicts}

    # Lead with the most decisive claim (Contradicted > Supported > …).
    order = sorted(
        range(len(claims)),
        key=lambda i: STATUS_PRIORITY.get(by_index.get(i, {}).get("status"), 4),
    )
    primary_i = order[0]
    primary = by_index.get(primary_i, {})
    status = primary.get("status", "Unclear")
    meta = STATUS_META.get(status, STATUS_META["Unclear"])

    # Bullets for "What the science says": one per assessed claim.
    points = [
        by_index[i]["explanation"]
        for i in range(len(claims))
        if by_index.get(i, {}).get("explanation")
        and by_index[i].get("status") in ("Supported", "Contradicted", "Unclear")
    ]

    sugg = llm.suggestions(claims, by_index, conditions)
    summary = sugg.get("summary") or primary.get("explanation", "")
    faqs = sugg.get("faqs", [])

    # "Discover more": link each follow-up question to its best-matching sources.
    for faq in faqs:
        uniq, fseen = [], set()
        for h in store.search(faq["q"], k=2):
            key = h.get("url") or h["title"]
            if key in fseen:
                continue
            fseen.add(key)
            uniq.append(_source_row(h))
        faq["sources"] = uniq

    # Top up the verdict bullets with FAQ answers if we have fewer than two.
    if len(points) < 2:
        points += [f["a"] for f in faqs][: 3 - len(points)]

    # Unique cited sources across all verdicts (primary claim's first).
    sources, seen = [], set()
    ordered_ids = list(primary.get("citation_ids", []))
    for v in verdicts:
        for cid in v.get("citation_ids", []):
            if cid not in ordered_ids:
                ordered_ids.append(cid)
    for cid in ordered_ids:
        ch = id_map.get(cid)
        if not ch:
            continue
        key = ch.get("url") or ch["title"]
        if key in seen:
            continue
        seen.add(key)
        sources.append(_source_row(ch))

    # Personalisation note (opt-in): surface any caution/important flag.
    person_note = None
    if conditions or profile:
        notes = llm.personalize(claims, by_index, conditions, profile, transcript)
        n = notes.get(primary_i)
        if n and n.get("relevance") in {"relevant", "important", "caution"}:
            person_note = {"relevance": n["relevance"], "note": n["note"]}

    return {
        "empty": False,
        "claim": claims[primary_i]["text"],
        "transcript": transcript,
        "tag": meta["tag"],
        "verdict": meta["verdict"],
        "verdictColor": meta["color"],
        "truthScore": meta["truth"],
        "confidence": CONF_NUM.get(primary.get("confidence", "low"), 60),
        "summary": summary,
        "points": points[:4],
        "sources": sources,
        "faqs": faqs,
        "personalNote": person_note,
    }


def _clean_conditions(raw):
    if not raw:
        return None
    items = [c.strip() for c in raw.split(",") if c.strip()]
    return items or None


@app.post("/api/check")
async def check(
    text: str = Form(None),
    url: str = Form(None),
    conditions: str = Form(None),
    profile: str = Form(None),
    file: UploadFile = File(None),
):
    """Accept a claim as text, a link, or an uploaded image/audio/video."""
    conds = _clean_conditions(conditions)
    prof = (profile or "").strip() or None

    try:
        if text and text.strip():
            transcript = text.strip()
        elif file is not None:
            data = await file.read()
            mime = file.content_type or ""
            if mime.startswith("image"):
                transcript = llm.ocr_image(data, mime)
            else:
                suffix = os.path.splitext(file.filename or "")[1] or ".wav"
                transcript = transcribe.transcribe_bytes(data, suffix=suffix)
        elif url and url.strip():
            path = transcribe.download_audio(url.strip())
            transcript = transcribe.transcribe_file(path)
        else:
            return {"error": "Provide a claim as text, a link, or a file."}

        if not (transcript or "").strip():
            return {"empty": True, "transcript": ""}

        return check_claim(transcript, conds, prof)
    except Exception as e:  # noqa: BLE001 — surface a clean message to the UI
        return {"error": str(e)}


class Health(BaseModel):
    ok: bool
    index: bool


@app.get("/api/health", response_model=Health)
def health():
    return Health(ok=True, index=Store.exists())
