"""
Ingestion pipeline: docx -> chunks -> embeddings -> ChromaDB.

Run as a script:
    python -m rag.ingest          # rebuild the vector store from scratch

This is idempotent: it resets the collection first, so re-running after you
edit the .docx files gives you a clean, up-to-date index.
"""
from __future__ import annotations

import sys
import time

from rag import ollama_client
from rag.chunker import chunk_documents
from rag.loader import load_documents
from rag.vectorstore import VectorStore


def build_index(verbose: bool = True) -> int:
    def log(msg: str) -> None:
        if verbose:
            print(msg, flush=True)

    # 0. Pre-flight: make sure Ollama + models are available.
    status = ollama_client.health()
    if not status["embed_ready"]:
        raise SystemExit(
            f"Embedding model not installed. Run: ollama pull "
            f"{ollama_client.EMBED_MODEL if hasattr(ollama_client, 'EMBED_MODEL') else 'nomic-embed-text'}"
        )

    log("1/4  Loading .docx knowledge base...")
    docs = load_documents()
    if not docs:
        raise SystemExit(
            "No .docx files found in data/docx/. "
            "Run `python scripts/generate_docs.py` first."
        )
    log(f"      Loaded {len(docs)} documents: {', '.join(d.title for d in docs)}")

    log("2/4  Chunking...")
    chunks = chunk_documents(docs)
    log(f"      Produced {len(chunks)} chunks.")

    log("3/4  Embedding chunks with Ollama (nomic-embed-text)...")
    t0 = time.time()
    embeddings = ollama_client.embed_batch([c.text for c in chunks])
    log(f"      Embedded {len(embeddings)} chunks in {time.time() - t0:.1f}s.")

    log("4/4  Writing to the vector store...")
    store = VectorStore()
    store.reset()
    store.add(chunks, embeddings)
    total = store.count()
    log(f"      Done. Vector store now holds {total} chunks.")
    return total


if __name__ == "__main__":
    try:
        build_index()
    except KeyboardInterrupt:
        sys.exit(130)
