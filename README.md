# 🩺 Health Claim Checker

Take health content as spoken audio (live mic, uploaded file, or a
YouTube/TikTok URL), a pasted transcript, or a **screenshot** (OCR'd with Claude
vision), extract the health/nutrition **claims** it makes, and check each against a
local **RAG** index of trusted sources (**NHS · WHO · ZOE**) — with a
Supported / Contradicted / Not addressed verdict and citations.

```
audio ─▶ Whisper ─▶ transcript ─▶ Claude (extract claims)
                                     │
                        each claim ─▶ vector search ─▶ trusted-source passages
                                     │
                                     ▶ Claude (judge + cite) ─▶ verdict cards
```

Everything runs locally except the Claude calls (claim extraction + verdicts).
Transcription (faster-whisper) and embeddings (`bge-small`) need no API keys.

## Setup

Prereqs: [uv](https://docs.astral.sh/uv/), and `ffmpeg` (`brew install ffmpeg`)
for robust audio decoding.

```bash
uv sync                       # create .venv and install everything
cp .env.example .env          # then put your key in it: ANTHROPIC_API_KEY=...
uv run python ingest.py       # fetch trusted sources and build the vector index
uv run streamlit run app.py   # launch the app
```

`ingest.py` re-run is only needed when you change the sources.

## Project layout

| File | Role |
|------|------|
| `config.py` | Models, chunking, paths, enabled sources |
| `sources.py` | Trusted-source URLs, web fetching, local-docs loader |
| `ingest.py` | Fetch → chunk → embed → save index (`data/index/`) |
| `rag.py` | Embeddings + numpy cosine-similarity vector store |
| `transcribe.py` | faster-whisper + yt-dlp audio download |
| `llm.py` | Claude claim extraction + evidence-grounded verdicts |
| `app.py` | Streamlit UI |

## Adding / curating sources

- **Web pages:** add URLs to `SOURCES` in `sources.py` (a failed URL is skipped,
  not fatal). NHS is under the Open Government Licence; WHO fact sheets are open.
- **Content you can't scrape (e.g. ZOE, behind Cloudflare):** drop `.md`/`.txt`
  files under `data/docs/<source>/` — see `data/docs/zoe/README.md` for the format.
- **Mayo Clinic** is disabled by default (`config.DISABLED_SOURCES`) because its
  terms restrict scraping; enable only if you've confirmed permission.

## Updating the index

The search index lives in `data/index/` (`embeddings.npy` + `chunks.json`).
Whenever the source material or indexing config changes, rebuild it:

```bash
uv run python ingest.py
```

This **overwrites** the existing index (a full rebuild, not an append), then the
running app picks it up on its next launch — restart `streamlit run app.py` if
it's open, since the index is cached per session.

Rebuild after any of these:

- **Added/removed web URLs** in `SOURCES` (`sources.py`).
- **Added/edited local docs** under `data/docs/<source>/` — new source folders
  (e.g. `data/docs/john_hopkins/`) are picked up automatically; the folder name
  becomes the source label.
- **Enabled/disabled a source** via `config.DISABLED_SOURCES`.
- **Changed chunking or the embedding model** (`CHUNK_WORDS`, `CHUNK_OVERLAP`,
  `EMBED_MODEL` in `config.py`). Changing `EMBED_MODEL` *requires* a rebuild — old
  vectors are incompatible with a new model.

To confirm what got indexed, run `uv run python ingest.py` and read the per-URL
`✓ / ✗` log and the final chunk count.

## Notes / knobs

- Bigger Whisper = better transcription: set `WHISPER_SIZE` in `config.py`
  (`base` → `small`/`medium`). Bigger embeddings: `EMBED_MODEL` → `bge-base`.
- Verdicts reflect **only the indexed excerpts**, which may be incomplete —
  this is an informational tool, **not medical advice**.

## Running the App

1. Backend (FastAPI):
uv run uvicorn backend.api:app --reload --port 8000

2. Frontend (Vite) — new tab:
cd frontend && npm run dev

3. ngrok tunnel — new tab:
ngrok http 5173

