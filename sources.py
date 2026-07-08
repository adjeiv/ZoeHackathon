"""Trusted-source seed URLs + fetching/cleaning.

These are curated starting points focused on nutrition, metabolic and gut
health (aligned with ZOE's domain). Add/curate freely — the ingest step skips
any URL that fails to fetch, so a broken link won't break the build.

Licensing notes:
  - NHS content is published under the Open Government Licence (reuse allowed
    with attribution).
  - WHO fact sheets are openly available (CC BY-NC-SA).
  - ZOE's site is behind Cloudflare bot protection, so it can't be scraped
    directly. Add ZOE excerpts you have rights to under data/docs/zoe/*.md
    instead (see load_local_docs below).
  - Mayo Clinic is DISABLED by default (see config.DISABLED_SOURCES) because its
    terms restrict scraping. Enable only if you've confirmed permission.
"""
import json
import os

import requests
import trafilatura

import config

# A real browser UA improves fetch success on some sites.
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    )
}

SOURCES = {
    "nhs": [
        "https://www.nhs.uk/live-well/eat-well/how-to-eat-a-balanced-diet/eating-a-balanced-diet/",
        "https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/",
        "https://www.nhs.uk/live-well/eat-well/digestive-health/how-to-get-more-fibre-into-your-diet/",
        "https://www.nhs.uk/live-well/eat-well/food-types/how-does-sugar-in-our-diet-affect-our-health/",
        "https://www.nhs.uk/live-well/eat-well/food-types/salt-nutrition/",
        "https://www.nhs.uk/live-well/eat-well/food-types/different-fats-nutrition/",
        "https://www.nhs.uk/live-well/eat-well/food-types/meat-nutrition/",
        "https://www.nhs.uk/live-well/eat-well/food-types/starchy-foods-and-carbohydrates/",
        "https://www.nhs.uk/live-well/eat-well/digestive-health/good-foods-to-help-your-digestion/",
        "https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-c/",
    ],
    "who": [
        "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
        "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
        "https://www.who.int/news-room/fact-sheets/detail/diabetes",
        "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)",
        "https://www.who.int/news-room/fact-sheets/detail/salt-reduction",
    ],
    # ZOE can't be scraped (Cloudflare). Add excerpts under data/docs/zoe/*.md.
    "zoe": [],
    # Disabled by default — see config.DISABLED_SOURCES / licensing note above.
    "mayo": [
        "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/fiber/art-20043983",
        "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/added-sugar/art-20045328",
    ],
}


def fetch_clean(url):
    """Return (title, main_text) for a URL, or (None, None) on failure."""
    html = trafilatura.fetch_url(url)
    if not html:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=20)
            resp.raise_for_status()
            html = resp.text
        except Exception:
            return None, None
    data = trafilatura.extract(
        html,
        output_format="json",
        include_comments=False,
        include_tables=False,
        url=url,
    )
    if not data:
        return None, None
    obj = json.loads(data)
    text = obj.get("text")
    if not text:
        return None, None
    title = obj.get("title") or _slug_title(url)
    return title, text


def _slug_title(url):
    """Build a readable title from a URL slug as a fallback."""
    slug = url.rstrip("/").split("/")[-1]
    slug = slug.split("?")[0].replace("-", " ").replace("_", " ").strip()
    return slug[:1].upper() + slug[1:] if slug else url


LOCAL_DOCS_DIR = os.path.join(config.BASE_DIR, "data", "docs")


def load_local_docs():
    """Yield (source, title, text, url) for local .md/.txt docs.

    Layout: data/docs/<source>/<file>.md — the folder name is the source label
    (e.g. 'zoe'), the first non-empty line is the title, and an optional first
    line 'URL: https://...' is used as the citation link. This is how you add
    content that can't be scraped (e.g. ZOE articles you have rights to).
    """
    if not os.path.isdir(LOCAL_DOCS_DIR):
        return
    for source in sorted(os.listdir(LOCAL_DOCS_DIR)):
        sdir = os.path.join(LOCAL_DOCS_DIR, source)
        if not os.path.isdir(sdir):
            continue
        for fn in sorted(os.listdir(sdir)):
            if not fn.lower().endswith((".md", ".txt")):
                continue
            with open(os.path.join(sdir, fn), encoding="utf-8") as f:
                raw = f.read().strip()
            if not raw:
                continue
            lines = raw.splitlines()
            url = ""
            if lines and lines[0].lower().startswith("url:"):
                url = lines[0].split(":", 1)[1].strip()
                lines = lines[1:]
            title = next((l.lstrip("# ").strip() for l in lines if l.strip()), fn)
            text = "\n".join(lines).strip()
            yield source, title, text, url
