"""Streamlit UI: audio → transcript → claims → evidence verdict."""
import streamlit as st
from dotenv import load_dotenv

import llm
import transcribe
from rag import Store

load_dotenv()

st.set_page_config(page_title="Health Claim Checker", page_icon="🩺", layout="centered")

STATUS_STYLE = {
    "Supported": ("✅", "#1a7f37", "#e6f4ea"),
    "Contradicted": ("❌", "#b3261e", "#fce8e6"),
    "Not addressed": ("➖", "#5f6368", "#f1f3f4"),
    "Unclear": ("⚠️", "#946200", "#fef7e0"),
}


@st.cache_resource(show_spinner=False)
def get_store():
    return Store.load()


def render_verdict(claim, verdict, id_map):
    icon, fg, bg = STATUS_STYLE.get(verdict["status"], ("•", "#333", "#eee"))
    st.markdown(
        f"""<div style="border-left:5px solid {fg};background:{bg};
        padding:12px 16px;border-radius:8px;margin-bottom:6px;">
        <div style="font-weight:600;color:{fg};">{icon} {verdict['status']}
        <span style="font-weight:400;opacity:0.7;font-size:0.85em;">
        · confidence: {verdict['confidence']}</span></div>
        <div style="margin-top:6px;font-size:1.02em;">"{claim}"</div>
        <div style="margin-top:8px;color:#333;">{verdict['explanation']}</div>
        </div>""",
        unsafe_allow_html=True,
    )
    cited = [id_map[c] for c in verdict.get("citation_ids", []) if c in id_map]
    if cited:
        with st.expander(f"Sources ({len(cited)})"):
            seen = set()
            for ch in cited:
                key = ch.get("url") or ch["title"]
                if key in seen:
                    continue
                seen.add(key)
                link = f"  ·  [link]({ch['url']})" if ch.get("url", "").startswith("http") else ""
                st.markdown(
                    f"**{ch['source'].upper()} — {ch['title']}**{link}"
                    f"  ·  _relevance {ch['score']:.2f}_"
                )
                st.caption(ch["text"][:300] + "…")


def analyze(transcript, show_transcript=True, source="input"):
    if show_transcript:
        st.subheader("Transcript")
        st.write(transcript)

    with st.status("Extracting claims…", expanded=False) as status:
        claims = llm.extract_claims(transcript)
        status.update(label=f"Found {len(claims)} claim(s)", state="complete")

    if not claims:
        st.info(f"No checkable health claims were found in this {source}.")
        return

    store = get_store()
    with st.status("Retrieving evidence & judging…", expanded=False) as status:
        claims_with_evidence = [
            (c["text"], store.search(c["text"])) for c in claims
        ]
        verdicts, id_map = llm.judge_claims(claims_with_evidence)
        status.update(label="Done", state="complete")

    by_index = {v["claim_index"]: v for v in verdicts}
    st.subheader("Results")
    for i, c in enumerate(claims):
        v = by_index.get(i, {
            "status": "Unclear", "confidence": "low",
            "explanation": "No verdict returned.", "citation_ids": [],
        })
        render_verdict(c["text"], v, id_map)


# --- UI ---------------------------------------------------------------------

st.title("🩺 Health Claim Checker")
st.caption(
    "Transcribe spoken audio, extract health claims, and check them against "
    "trusted sources (NHS · WHO · ZOE)."
)

if not Store.exists():
    st.error(
        "No search index found. Build it first:\n\n"
        "```\nuv run python ingest.py\n```"
    )
    st.stop()

tab_text, tab_rec, tab_file, tab_url = st.tabs(
    ["📝 Paste text", "🎙️ Record", "📁 Upload", "🔗 URL"]
)

with tab_text:
    text = st.text_area(
        "Paste a transcript, article, or any text with health claims",
        height=200,
        placeholder="e.g. Eating after 8pm makes you gain weight, and vitamin C cures colds…",
    )
    if text.strip() and st.button("Analyze text", type="primary"):
        analyze(text.strip(), show_transcript=False, source="text")

with tab_rec:
    audio = st.audio_input("Record live audio")
    if audio and st.button("Analyze recording", type="primary"):
        with st.spinner("Transcribing…"):
            transcript = transcribe.transcribe_bytes(audio.getvalue())
        analyze(transcript, source="recording")

with tab_file:
    up = st.file_uploader(
        "Upload audio/video", type=["mp3", "wav", "m4a", "mp4", "webm", "ogg", "flac"]
    )
    if up and st.button("Analyze file", type="primary"):
        with st.spinner("Transcribing…"):
            transcript = transcribe.transcribe_bytes(
                up.getvalue(), suffix="." + up.name.split(".")[-1]
            )
        analyze(transcript, source="file")

with tab_url:
    url = st.text_input("YouTube / TikTok URL")
    if url and st.button("Analyze URL", type="primary"):
        try:
            with st.spinner("Downloading audio…"):
                path = transcribe.download_audio(url)
            with st.spinner("Transcribing…"):
                transcript = transcribe.transcribe_file(path)
            analyze(transcript, source="video")
        except Exception as e:
            st.error(f"Could not fetch that URL: {e}")

st.divider()
st.caption(
    "⚠️ Informational only — not medical advice. Verdicts reflect only the "
    "indexed source excerpts, which may be incomplete."
)
