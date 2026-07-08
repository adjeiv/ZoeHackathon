"""Embeddings + a tiny numpy vector store (cosine similarity)."""
import json
import os
from functools import lru_cache

import numpy as np

import config


@lru_cache(maxsize=1)
def _model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(config.EMBED_MODEL)


def embed_texts(texts, is_query=False):
    """Return an (n, d) float32 matrix of L2-normalized embeddings."""
    prefix = config.QUERY_PREFIX if is_query else ""
    embs = _model().encode(
        [prefix + t for t in texts],
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=len(texts) > 50,
    )
    return embs.astype("float32")


def chunk_text(text, size=config.CHUNK_WORDS, overlap=config.CHUNK_OVERLAP):
    words = text.split()
    chunks, i = [], 0
    step = max(1, size - overlap)
    while i < len(words):
        chunk = " ".join(words[i : i + size]).strip()
        if chunk:
            chunks.append(chunk)
        i += step
    return chunks


class Store:
    """In-memory vector store backed by a numpy matrix + parallel metadata."""

    def __init__(self, embs, chunks):
        self.embs = embs  # (n, d) normalized
        self.chunks = chunks  # list of {text, url, title, source}

    @classmethod
    def load(cls, path=config.INDEX_DIR):
        embs = np.load(os.path.join(path, "embeddings.npy"))
        with open(os.path.join(path, "chunks.json"), encoding="utf-8") as f:
            chunks = json.load(f)
        return cls(embs, chunks)

    @classmethod
    def exists(cls, path=config.INDEX_DIR):
        return os.path.exists(os.path.join(path, "embeddings.npy")) and os.path.exists(
            os.path.join(path, "chunks.json")
        )

    def search(self, query, k=config.TOP_K):
        q = embed_texts([query], is_query=True)[0]
        scores = self.embs @ q  # cosine sim (both normalized)
        idx = np.argsort(-scores)[:k]
        return [{**self.chunks[i], "score": float(scores[i])} for i in idx]
