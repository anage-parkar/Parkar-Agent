"""
Persistent vector store (NumPy cosine-similarity index).

Why not ChromaDB by default? ChromaDB 1.5.x still initialises its Settings via
`pydantic.v1`, which fails to import on Python 3.14. To keep the agent working
out of the box on modern Python — and to keep latency minimal with no separate
DB process — we use a compact, dependency-light vector index here:

    * embeddings live in a single float32 matrix (memory-mapped friendly),
    * documents + metadata live alongside in JSON,
    * search is exact cosine similarity (fast for a few thousand chunks).

It implements the same interface the rest of the code expects (reset / add /
query / count), so swapping in ChromaDB on Python <= 3.13 is a drop-in change
(see `vectorstore_chroma.py.txt` notes in the README).
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Sequence

import numpy as np

from config import COLLECTION_NAME, VECTORDB_DIR
from rag.chunker import Chunk


class VectorStore:
    def __init__(self, collection_name: str = COLLECTION_NAME):
        self.name = collection_name
        self._vec_path = Path(VECTORDB_DIR) / f"{collection_name}.npy"
        self._meta_path = Path(VECTORDB_DIR) / f"{collection_name}.json"
        self._embeddings: np.ndarray | None = None   # (N, dim) L2-normalised
        self._records: list[dict] = []               # parallel to rows
        self._load()

    # -- persistence ------------------------------------------------------
    def _load(self) -> None:
        if self._vec_path.exists() and self._meta_path.exists():
            self._embeddings = np.load(self._vec_path)
            self._records = json.loads(self._meta_path.read_text(encoding="utf-8"))
        else:
            self._embeddings = np.zeros((0, 0), dtype=np.float32)
            self._records = []

    def _save(self) -> None:
        VECTORDB_DIR.mkdir(parents=True, exist_ok=True)
        np.save(self._vec_path, self._embeddings)
        self._meta_path.write_text(
            json.dumps(self._records, ensure_ascii=False), encoding="utf-8"
        )

    # -- write path -------------------------------------------------------
    def reset(self) -> None:
        self._embeddings = np.zeros((0, 0), dtype=np.float32)
        self._records = []
        for p in (self._vec_path, self._meta_path):
            if p.exists():
                p.unlink()

    def add(self, chunks: Sequence[Chunk], embeddings: Sequence[Sequence[float]]) -> None:
        if not chunks:
            return
        mat = np.asarray(embeddings, dtype=np.float32)
        mat = _l2_normalize(mat)
        if self._embeddings is None or self._embeddings.size == 0:
            self._embeddings = mat
        else:
            self._embeddings = np.vstack([self._embeddings, mat])
        for chunk in chunks:
            self._records.append(
                {"id": chunk.id, "text": chunk.text, "metadata": chunk.metadata}
            )
        self._save()

    # -- read path --------------------------------------------------------
    def query(self, embedding: Sequence[float], top_k: int) -> list[dict]:
        if self._embeddings is None or self._embeddings.size == 0:
            return []
        q = _l2_normalize(np.asarray(embedding, dtype=np.float32).reshape(1, -1))[0]
        # cosine similarity == dot product of L2-normalised vectors
        scores = self._embeddings @ q
        k = min(top_k, scores.shape[0])
        # argpartition for top-k, then sort those k by score desc
        top_idx = np.argpartition(-scores, k - 1)[:k]
        top_idx = top_idx[np.argsort(-scores[top_idx])]

        hits: list[dict] = []
        for i in top_idx:
            rec = self._records[int(i)]
            hits.append(
                {
                    "text": rec["text"],
                    "metadata": rec["metadata"],
                    "similarity": float(scores[int(i)]),
                }
            )
        return hits

    def count(self) -> int:
        return len(self._records)


def _l2_normalize(mat: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return mat / norms
