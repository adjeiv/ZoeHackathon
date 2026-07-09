"""Central configuration for the health-claim fact-checker."""
import os

# --- Claude (claim extraction + evidence verdict) ---
CLAUDE_MODEL = "claude-opus-4-8"

# --- Embeddings (local, no API key) ---
# bge-small is fast and strong for retrieval. Swap to bge-base for more quality.
EMBED_MODEL = "BAAI/bge-small-en-v1.5"
# bge models want this prefix on the *query* side (not on stored passages).
QUERY_PREFIX = "Represent this sentence for searching relevant passages: "

# --- Transcription (local faster-whisper) ---
# tiny | base | small | medium | large-v3  (bigger = more accurate, slower)
WHISPER_SIZE = "base"

# --- Chunking / retrieval ---
CHUNK_WORDS = 220
CHUNK_OVERLAP = 40
TOP_K = 4                # evidence passages retrieved per claim
MIN_SCORE = 0.30         # below this, evidence is treated as weak (shown but flagged)

# --- Personalisation (OFF by default) ---
# When enabled, an extra Claude step flags whether each claim is particularly
# relevant/important/dangerous given the user's pre-existing conditions.
PERSONALIZATION_ENABLED = False
USER_CONDITIONS = []  # e.g. ["type 2 diabetes", "high blood pressure"]
# Convenience presets for the UI multiselect.
COMMON_CONDITIONS = [
    "type 2 diabetes",
    "type 1 diabetes",
    "high blood pressure",
    "high cholesterol",
    "heart disease",
    "chronic kidney disease",
    "coeliac disease",
    "IBS",
    "pregnancy",
    "food allergy",
    "anaemia",
    "PCOS",
    "PMOS",
]

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_DIR = os.path.join(BASE_DIR, "data", "index")

# --- Sources ---
# Mayo Clinic's terms restrict scraping/republishing, so it's off by default.
# Remove "mayo" from this set only if you've confirmed you're allowed to use it.
DISABLED_SOURCES = {"mayo"}
