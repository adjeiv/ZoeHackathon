"""Persistent history of checked claims (local JSON file)."""
import json
import os
from datetime import datetime

import config

HISTORY_PATH = os.path.join(config.BASE_DIR, "data", "history.json")


def load():
    """Return the list of saved check entries (oldest first)."""
    if not os.path.exists(HISTORY_PATH):
        return []
    try:
        with open(HISTORY_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def add_entry(source, claims):
    """Append one check. `claims` is a list of dicts with at least text/status."""
    if not claims:
        return
    entries = load()
    entries.append(
        {
            "ts": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "source": source,
            "claims": claims,
        }
    )
    os.makedirs(os.path.dirname(HISTORY_PATH), exist_ok=True)
    with open(HISTORY_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)


def clear():
    if os.path.exists(HISTORY_PATH):
        os.remove(HISTORY_PATH)
