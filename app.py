"""ZOE-styled mobile health-claim checker (Streamlit).

Screen flow:  home → processing (transcribe → fetch) → score → suggestions
Plus a History view and a settings popover (personalisation / URL input).
"""
import base64
import os
from functools import lru_cache

import streamlit as st
from dotenv import load_dotenv

import config
import history
import llm
import transcribe
from rag import Store

load_dotenv()
st.set_page_config(page_title="ZoeCheck", page_icon="🟡", layout="centered")

# --- Brand palette ----------------------------------------------------------
CREAM = "#FCEFA4"
INPUT_YELLOW = "#FDF2B2"
YELLOW = "#FFD400"
TEAL = "#37DFC6"
BLUE = "#2743C6"
INK = "#141414"

ASSETS = os.path.join(config.BASE_DIR, "assets")


@lru_cache(maxsize=4)
def _img_b64(name):
    with open(os.path.join(ASSETS, name), "rb") as f:
        return base64.b64encode(f.read()).decode()


@lru_cache(maxsize=32)
def _icon_b64(source):
    """Base64 for assets/icons/<source>.png, or None if the file isn't there."""
    path = os.path.join(ASSETS, "icons", f"{source}.png")
    if os.path.exists(path):
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode()
    return None


def inject_css():
    st.markdown(
        f"""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap');
        .stApp {{ background: {CREAM}; }}
        [data-testid="stHeader"], #MainMenu, footer, [data-testid="stToolbar"] {{ display: none; }}
        .block-container {{ max-width: 480px; padding-top: 1.2rem; padding-bottom: 3rem; }}
        html, body, [class*="css"], .stMarkdown, p, div, span, h1, h2, h3 {{
            font-family: 'Poppins', system-ui, -apple-system, sans-serif; color: {INK};
        }}
        h1, h2, h3 {{ font-weight: 800; letter-spacing: -0.5px; }}
        /* Text inputs -> pale yellow rounded pills */
        [data-testid="stTextInput"] input, [data-baseweb="input"] {{
            background: {INPUT_YELLOW} !important; border: none !important;
            border-radius: 16px !important; padding: 14px 16px !important; font-size: 1rem;
        }}
        [data-testid="stTextInput"] > div > div {{ background: transparent; border: none; }}
        [data-testid="stTextInput"] input {{ color: #D9D9D9 !important; }}
        [data-testid="stTextInput"] input::placeholder {{ color: #D9D9D9 !important; opacity: 1; }}
        /* File uploader dropzone -> pale yellow */
        [data-testid="stFileUploaderDropzone"] {{
            background: {INPUT_YELLOW}; border: none; border-radius: 16px;
        }}
        [data-testid="stFileUploaderDropzoneInstructions"],
        [data-testid="stFileUploaderDropzoneInstructions"] * {{ color: #D9D9D9 !important; }}
        /* Personalisation inputs (text area + multiselect) -> themed, not default */
        [data-testid="stTextArea"] textarea {{
            background: {INPUT_YELLOW} !important; border: none !important;
            border-radius: 16px !important; color: {INK} !important; padding: 12px 14px !important;
        }}
        [data-testid="stMultiSelect"] div[data-baseweb="select"] > div {{
            background: {INPUT_YELLOW} !important; border: none !important;
            border-radius: 16px !important;
        }}
        [data-testid="stMultiSelect"] [data-baseweb="tag"] {{
            background: #7F3EFE !important; border-radius: 8px !important;
        }}
        [data-testid="stMultiSelect"] [data-baseweb="tag"] span {{ color: #ffffff !important; }}
        [data-testid="stMultiSelect"] [data-baseweb="tag"] svg {{ fill: #ffffff !important; }}
        /* Buttons -> teal pills */
        .stButton > button {{
            background: {TEAL}; color: {INK}; border: none; border-radius: 999px;
            padding: 12px 28px; font-weight: 700; font-size: 1.05rem; width: 100%;
        }}
        .stButton > button:hover {{ background: #2ec9b1; color: {INK}; }}
        /* Dark-purple buttons: hamburger, Check, nav items, Clear history, ← Home */
        .st-key-hamburger button, .st-key-check_btn button,
        .st-key-nav_home button, .st-key-nav_hist button, .st-key-nav_pers button,
        .st-key-clear_hist button, .st-key-home_back button, .st-key-pers_back button,
        .st-key-hamburger button:hover, .st-key-check_btn button:hover,
        .st-key-nav_home button:hover, .st-key-nav_hist button:hover, .st-key-nav_pers button:hover,
        .st-key-clear_hist button:hover, .st-key-home_back button:hover, .st-key-pers_back button:hover {{
            background: #7F3EFE !important; color: #ffffff !important;
        }}
        .st-key-hamburger button *, .st-key-check_btn button *,
        .st-key-nav_home button *, .st-key-nav_hist button *, .st-key-nav_pers button *,
        .st-key-clear_hist button *, .st-key-home_back button *, .st-key-pers_back button * {{ color: #ffffff !important; }}
        .zc-center {{ text-align: center; }}
        .zc-card {{ border-radius: 20px; padding: 20px 22px; margin: 14px 0; min-height: 120px; }}
        .zc-pill {{
            display: flex; align-items: center; justify-content: space-between;
            background: {YELLOW}; color: {INK}; border-radius: 10px;
            padding: 10px 14px; margin: 8px 0; text-decoration: none; font-weight: 600;
        }}
        .zc-score {{ font-size: 5rem; font-weight: 800; line-height: 1; margin: 0; }}

        /* "👤 Me" popover trigger -> blue, stable across hover/focus/active */
        [data-testid="stPopover"] button {{
            background: #1E5ABC !important; border: none !important;
            border-radius: 999px !important; font-weight: 700 !important;
        }}
        [data-testid="stPopover"] button,
        [data-testid="stPopover"] button *,
        [data-testid="stPopover"] button:hover,
        [data-testid="stPopover"] button:hover *,
        [data-testid="stPopover"] button:active,
        [data-testid="stPopover"] button:focus,
        [data-testid="stPopover"] button:focus * {{ color: #ffffff !important; }}
        [data-testid="stPopover"] button:hover,
        [data-testid="stPopover"] button:active,
        [data-testid="stPopover"] button:focus {{ background: #1E5ABC !important; }}
        /* trigger by its own testid, incl. the open (aria-expanded) state */
        [data-testid="stPopoverButton"] {{
            background: #1E5ABC !important; border: none !important;
            border-radius: 999px !important; font-weight: 700 !important;
        }}
        [data-testid="stPopoverButton"]:hover,
        [data-testid="stPopoverButton"]:active,
        [data-testid="stPopoverButton"]:focus,
        [data-testid="stPopoverButton"][aria-expanded="true"] {{ background: #1E5ABC !important; }}
        [data-testid="stPopoverButton"],
        [data-testid="stPopoverButton"] *,
        [data-testid="stPopoverButton"]:hover *,
        [data-testid="stPopoverButton"]:focus *,
        [data-testid="stPopoverButton"][aria-expanded="true"] * {{ color: #ffffff !important; }}

        /* File uploader "Browse files" button -> dark purple */
        [data-testid="stFileUploaderDropzone"] button {{
            background: #7F3EFE !important; border: none !important;
            border-radius: 999px !important;
        }}
        [data-testid="stFileUploaderDropzone"] button,
        [data-testid="stFileUploaderDropzone"] button *,
        [data-testid="stFileUploaderDropzone"] button:hover,
        [data-testid="stFileUploaderDropzone"] button:hover * {{ color: #ffffff !important; }}

        /* Record / mic widget -> blue background, white contents */
        [data-testid="stAudioInput"] {{
            background: #1E5ABC !important; border: none !important;
            border-radius: 16px !important;
        }}
        [data-testid="stAudioInput"] * {{ color: #ffffff !important; }}
        [data-testid="stAudioInput"] svg {{ fill: #ffffff !important; color: #ffffff !important; }}
        [data-testid="stAudioInput"] button {{ background: transparent !important; }}

        /* Expander / FAQ headers -> stable blue, never flip to black */
        [data-testid="stExpander"] summary,
        [data-testid="stExpander"] summary *,
        [data-testid="stExpander"] summary:hover,
        [data-testid="stExpander"] summary:hover *,
        details summary, details summary * {{ color: #1E5ABC !important; }}
        </style>
        """,
        unsafe_allow_html=True,
    )


def mascot(name="pink_mascot.png", width=200):
    st.markdown(
        f"<div class='zc-center'><img src='data:image/png;base64,{_img_b64(name)}' "
        f"width='{width}'/></div>",
        unsafe_allow_html=True,
    )


def card(title, body_html, bg, fg=INK):
    st.markdown(
        f"<div class='zc-card' style='background:{bg};color:{fg};'>"
        f"<div style='font-weight:700;font-size:1.15rem;margin-bottom:8px;'>{title}</div>"
        f"<div style='font-size:1rem;line-height:1.5;'>{body_html}</div></div>",
        unsafe_allow_html=True,
    )


@st.cache_resource(show_spinner=False)
def get_store():
    return Store.load()


# --- State ------------------------------------------------------------------
ss = st.session_state
ss.setdefault("screen", "home")
ss.setdefault("pending", None)
ss.setdefault("result", None)
ss.setdefault("menu_open", False)
# Persistent (non-widget) stores so personalisation survives the menu closing.
ss.setdefault("cond_persist", list(config.USER_CONDITIONS))
ss.setdefault("prof_persist", "")


def go(screen):
    ss["screen"] = screen
    st.rerun()


# --- Pipeline ---------------------------------------------------------------
def resolve_transcript(pending):
    src = pending["source"]
    if src == "text":
        return pending["text"]
    if src == "screenshot":
        return llm.ocr_image(pending["image"], pending.get("mime", "image/png"))
    if src == "video":
        path = transcribe.download_audio(pending["url"])
        return transcribe.transcribe_file(path)
    # recording / file audio
    return transcribe.transcribe_bytes(pending["audio"], suffix=pending.get("suffix", ".wav"))


def run_pipeline(transcript, source, conditions, profile=None):
    claims = llm.extract_claims(transcript)
    if not claims:
        return {"transcript": transcript, "claims": [], "empty": True}

    store = get_store()
    cwe = [(c["text"], store.search(c["text"])) for c in claims]
    verdicts, id_map = llm.judge_claims(cwe)
    by_index = {v["claim_index"]: v for v in verdicts}

    notes = (
        llm.personalize(claims, by_index, conditions, profile, transcript)
        if (conditions or profile) else {}
    )

    correct, wrong = [], []
    for i, c in enumerate(claims):
        status = by_index.get(i, {}).get("status")
        if status == "Supported":
            correct.append(c["text"])
        elif status == "Contradicted":
            wrong.append(c["text"])

    # Unique cited sources across all verdicts.
    sources, seen = [], set()
    for v in verdicts:
        for cid in v.get("citation_ids", []):
            ch = id_map.get(cid)
            if not ch:
                continue
            key = ch.get("url") or ch["title"]
            if key in seen:
                continue
            seen.add(key)
            sources.append({"source": ch["source"], "title": ch["title"], "url": ch.get("url", "")})

    assessed = len(correct) + len(wrong)
    score = round(100 * len(correct) / assessed) if assessed else None

    sugg = llm.suggestions(claims, by_index, conditions)

    # Link each FAQ to the best-matching source(s) from the index.
    for faq in sugg["faqs"]:
        hits = store.search(faq["q"], k=2)
        uniq, fseen = [], set()
        for h in hits:
            key = h.get("url") or h["title"]
            if key in fseen:
                continue
            fseen.add(key)
            uniq.append({"source": h["source"], "title": h["title"], "url": h.get("url", "")})
        faq["sources"] = uniq

    # Save to history.
    saved = []
    for i, c in enumerate(claims):
        v = by_index.get(i, {})
        rec = {"text": c["text"], "status": v.get("status", "Unclear"),
               "confidence": v.get("confidence", "low"), "explanation": v.get("explanation", "")}
        n = notes.get(i)
        if n and n.get("relevance") in {"relevant", "important", "caution"}:
            rec["relevance_note"] = n["note"]
        saved.append(rec)
    history.add_entry(source, saved)

    return {
        "transcript": transcript, "empty": False, "score": score,
        "correct": correct, "wrong": wrong, "sources": sources,
        "summary": sugg["summary"], "faqs": sugg["faqs"], "notes": notes, "claims": claims,
    }


# --- Shared bits ------------------------------------------------------------
def sources_html(sources):
    if not sources:
        return "<i>No specific sources were cited.</i>"
    rows = []
    for s in sources:
        icon_b64 = _icon_b64(s["source"])
        icon = (
            f"<img src='data:image/png;base64,{icon_b64}' width='20' "
            f"style='vertical-align:middle;margin-right:8px;border-radius:4px;'/>"
            if icon_b64 else ""
        )
        label = f"{icon}{s['source'].upper()} — {s['title']}"
        if s["url"].startswith("http"):
            rows.append(f"<a class='zc-pill' href='{s['url']}' target='_blank'>{label} <span>›</span></a>")
        else:
            rows.append(f"<div class='zc-pill'>{label}</div>")
    return "".join(rows)


def menu_bar():
    """Top bar shown on every screen: wordmark + a collapsible hamburger menu.

    Uses a toggle (not st.popover) so it can close on selection — st.popover
    can't be dismissed programmatically.
    """
    left, right = st.columns([4, 1])
    with left:
        st.markdown(
            f"<div style='display:flex;align-items:center;gap:8px;height:44px;'>"
            f"<img src='data:image/png;base64,{_img_b64('pink_mascot.png')}' width='34'/>"
            f"<span style='font-weight:800;font-size:1.15rem;'>ZoeCheck</span></div>",
            unsafe_allow_html=True,
        )
    with right:
        if st.button("☰", key="hamburger", use_container_width=True):
            ss["menu_open"] = not ss["menu_open"]

    if not ss["menu_open"]:
        return

    # Collapse the menu the instant a destination is chosen.
    if st.button("🏠 Home", key="nav_home", use_container_width=True):
        ss["menu_open"] = False
        go("home")
    if st.button("👤 Personalisation", key="nav_pers", use_container_width=True):
        ss["menu_open"] = False
        go("personalisation")
    if st.button("🕘 History", key="nav_hist", use_container_width=True):
        ss["menu_open"] = False
        go("history")


def active_personal():
    conds = ss.get("cond_persist") or None
    prof = (ss.get("prof_persist") or "").strip() or None
    return conds, prof


# ============================================================================
inject_css()

if not Store.exists():
    st.error("No search index. Build it first:\n\n```\nuv run python ingest.py\n```")
    st.stop()

menu_bar()
screen = ss["screen"]

# --- HOME -------------------------------------------------------------------
if screen == "home":
    mascot("pink_mascot.png", 200)
    st.markdown("<h1 class='zc-center'>Hear some wild<br>health claims?</h1>",
                unsafe_allow_html=True)

    def divider(txt):
        return (f"<p class='zc-center' style='font-weight:700;margin:10px 0 6px;"
                f"color:#DE3785;'>{txt}</p>")

    st.markdown(divider("PASTE IT HERE"), unsafe_allow_html=True)
    text = st.text_input("claim", label_visibility="collapsed",
                         placeholder="e.g. Eating after 8pm makes you gain weight…")
    st.markdown(divider("OR TAP TO RECORD"), unsafe_allow_html=True)
    audio = st.audio_input("record", label_visibility="collapsed")
    st.markdown(divider("OR UPLOAD A PHOTO OR VIDEO"), unsafe_allow_html=True)
    up = st.file_uploader("upload", label_visibility="collapsed",
                          type=["mp3", "wav", "m4a", "mp4", "webm", "ogg",
                                "flac", "png", "jpg", "jpeg", "webp"])
    with st.expander("🔗 or check a video link"):
        url = st.text_input("url", placeholder="YouTube / TikTok URL",
                            label_visibility="collapsed")

    if st.button("Check ✨", type="primary", key="check_btn"):
        pending = None
        if text.strip():
            pending = {"source": "text", "text": text.strip()}
        elif audio is not None:
            pending = {"source": "recording", "audio": audio.getvalue(), "suffix": ".wav"}
        elif up is not None:
            if (up.type or "").startswith("image"):
                pending = {"source": "screenshot", "image": up.getvalue(), "mime": up.type}
            else:
                pending = {"source": "file", "audio": up.getvalue(),
                           "suffix": "." + up.name.split(".")[-1]}
        elif url.strip():
            pending = {"source": "video", "url": url.strip()}

        if pending:
            conds, prof = active_personal()
            pending["conditions"] = conds
            pending["profile"] = prof
            ss["pending"] = pending
            go("processing")
        else:
            st.warning("Paste a claim, record, upload, or add a link first.")

# --- PROCESSING (transcribe → fetch) ----------------------------------------
elif screen == "processing":
    ph = st.empty()
    pending = ss["pending"]
    ok = False
    try:
        if pending["source"] != "text":
            with ph.container():
                mascot("mascot_talking.png", 240)
                st.markdown("<h3 class='zc-center'>one moment, transcribing your input</h3>",
                            unsafe_allow_html=True)
            transcript = resolve_transcript(pending)
        else:
            transcript = pending["text"]

        with ph.container():
            mascot("mascot_talking.png", 240)
            st.markdown("<h3 class='zc-center'>one moment, fetching information</h3>",
                        unsafe_allow_html=True)
        ss["result"] = run_pipeline(transcript, pending["source"],
                                    pending.get("conditions"), pending.get("profile"))
        ok = True
    except Exception as e:
        ph.empty()
        st.error(f"Something went wrong: {e}")
        if st.button("← Back"):
            go("home")
    if ok:
        ph.empty()
        go("score")

# --- SCORE ------------------------------------------------------------------
elif screen == "score":
    r = ss["result"]
    if not r or r.get("empty"):
        st.markdown("<h2 class='zc-center'>No checkable claims found</h2>", unsafe_allow_html=True)
        with st.expander("What we heard"):
            st.write(r.get("transcript", "") if r else "")
        if st.button("← New check", type="primary"):
            go("home")
    else:
        st.markdown("<h2 class='zc-center'>Overall Score</h2>", unsafe_allow_html=True)
        score_txt = f"{r['score']}%" if r["score"] is not None else "—"
        st.markdown(f"<p class='zc-score zc-center'>{score_txt}</p>", unsafe_allow_html=True)

        correct = "".join(f"• {c}<br>" for c in r["correct"]) or "<i>Nothing clearly supported.</i>"
        wrong = "".join(f"• {c}<br>" for c in r["wrong"]) or "<i>Nothing clearly contradicted.</i>"
        card("What seems correct:", correct, TEAL)
        card("What seems wrong:", wrong, YELLOW)
        card("According to", sources_html(r["sources"]), BLUE, fg="#fff")

        st.markdown("<h2 class='zc-center'>Discover Our<br>Suggestions</h2>", unsafe_allow_html=True)
        _, mid, _ = st.columns([1, 2, 1])
        if mid.button("Let's Go", type="primary"):
            go("suggestions")
        if st.button("← New check"):
            go("home")

# --- SUGGESTIONS ------------------------------------------------------------
elif screen == "suggestions":
    r = ss["result"] or {}
    st.markdown("<h2 class='zc-center'>Discover Our<br>Suggestions</h2>", unsafe_allow_html=True)
    card("Sources to look at:", sources_html(r.get("sources", [])), TEAL)
    card("Advice Summary", r.get("summary", "") or "<i>No summary available.</i>", YELLOW)

    st.markdown("<h3 class='zc-center'>FAQs</h3>", unsafe_allow_html=True)
    for faq in r.get("faqs", []):
        with st.expander(faq["q"]):
            st.write(faq["a"])
            if faq.get("sources"):
                st.markdown("**Sources:**", unsafe_allow_html=True)
                st.markdown(sources_html(faq["sources"]), unsafe_allow_html=True)
    if st.button("← New check", type="primary"):
        go("home")

# --- PERSONALISATION --------------------------------------------------------
elif screen == "personalisation":
    st.markdown("<h2 class='zc-center'>👤 Personalisation</h2>", unsafe_allow_html=True)
    st.caption(
        "Tell us about you, and we'll flag how claims relate to your health. "
        "Applied automatically when your input is about you (mentions 'I', 'my', "
        "'should I…', etc.). Not medical advice."
    )
    ss.setdefault("pers_conditions", list(ss["cond_persist"]))
    st.multiselect("My conditions", config.COMMON_CONDITIONS, key="pers_conditions")
    ss["cond_persist"] = ss["pers_conditions"]
    ss.setdefault("pers_profile", ss["prof_persist"])
    st.text_area("About me (optional)", key="pers_profile",
                 placeholder="e.g. I'm 65, vegetarian, and pregnant")
    ss["prof_persist"] = ss["pers_profile"]
    if st.button("← Home", type="primary", key="pers_back"):
        go("home")

# --- HISTORY ----------------------------------------------------------------
elif screen == "history":
    st.markdown("<h2 class='zc-center'>🕘 History</h2>", unsafe_allow_html=True)
    entries = history.load()
    if not entries:
        st.caption("No checks yet.")
    else:
        if st.button("Clear history", key="clear_hist"):
            history.clear()
            st.rerun()
        for e in reversed(entries):
            with st.expander(f"{e['ts']}  ·  {e['source']}  ·  {len(e['claims'])} claim(s)"):
                for cl in e["claims"]:
                    st.markdown(f"**{cl['status']}** — {cl['text']}")
                    if cl.get("explanation"):
                        st.caption(cl["explanation"])
    if st.button("← Home", type="primary", key="home_back"):
        go("home")

st.markdown(
    "<p class='zc-center' style='font-size:0.8rem;opacity:0.6;margin-top:24px;'>"
    "Informational only — not medical advice.</p>",
    unsafe_allow_html=True,
)
