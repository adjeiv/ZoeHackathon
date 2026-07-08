"""Build the vector index from trusted sources.

Usage:
    python ingest.py
"""
import json
import os

import numpy as np

import config
from rag import chunk_text, embed_texts
from sources import SOURCES, fetch_clean, load_local_docs


def main():
    all_chunks = []
    for source, urls in SOURCES.items():
        if source in config.DISABLED_SOURCES:
            print(f"— skipping disabled source: {source}")
            continue
        for url in urls:
            title, text = fetch_clean(url)
            if not text:
                print(f"  ✗ failed: {url}")
                continue
            pieces = chunk_text(text)
            for ch in pieces:
                all_chunks.append(
                    {"text": ch, "url": url, "title": title, "source": source}
                )
            print(f"  ✓ {source:4s} {len(pieces):3d} chunks  {url}")

    # Local documents (e.g. ZOE excerpts under data/docs/zoe/*.md)
    for source, title, text, url in load_local_docs():
        if source in config.DISABLED_SOURCES:
            continue
        pieces = chunk_text(text)
        for ch in pieces:
            all_chunks.append(
                {"text": ch, "url": url, "title": title, "source": source}
            )
        print(f"  ✓ {source:4s} {len(pieces):3d} chunks  (local) {title}")

    if not all_chunks:
        raise SystemExit(
            "No content fetched. Check your network and the URLs in sources.py."
        )

    print(f"\nEmbedding {len(all_chunks)} chunks with {config.EMBED_MODEL} ...")
    embs = embed_texts([c["text"] for c in all_chunks])

    os.makedirs(config.INDEX_DIR, exist_ok=True)
    np.save(os.path.join(config.INDEX_DIR, "embeddings.npy"), embs)
    with open(os.path.join(config.INDEX_DIR, "chunks.json"), "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False)

    print(f"\n✅ Indexed {len(all_chunks)} chunks → {config.INDEX_DIR}")


if __name__ == "__main__":
    main()
