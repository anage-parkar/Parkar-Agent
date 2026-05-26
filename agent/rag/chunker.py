"""
Recursive character text splitter.

RAG works best when each chunk is a self-contained, similarly-sized passage.
We split on the most natural boundaries first (paragraphs, then sentences,
then words) and only fall back to a hard cut when a single span is too big.
Overlap carries a little context across boundaries so answers don't get cut
mid-thought.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from config import CHUNK_OVERLAP, CHUNK_SIZE
from rag.loader import Document

_SEPARATORS = ["\n\n", "\n", ". ", " "]


@dataclass
class Chunk:
    id: str
    text: str
    metadata: dict


def _split_text(text: str, size: int, overlap: int) -> list[str]:
    text = text.strip()
    if len(text) <= size:
        return [text] if text else []

    # Pick the finest separator that actually appears.
    separator = next((s for s in _SEPARATORS if s in text), "")
    pieces = text.split(separator) if separator else list(text)

    chunks: list[str] = []
    current = ""
    for piece in pieces:
        candidate = piece if not current else current + separator + piece
        if len(candidate) <= size:
            current = candidate
            continue
        if current:
            chunks.append(current)
        # A single piece larger than `size` needs to be broken down further.
        if len(piece) > size:
            chunks.extend(_split_text(piece, size, overlap))
            current = ""
        else:
            current = piece
    if current:
        chunks.append(current)

    return _apply_overlap(chunks, overlap)


def _apply_overlap(chunks: list[str], overlap: int) -> list[str]:
    if overlap <= 0 or len(chunks) <= 1:
        return chunks
    out = [chunks[0]]
    for prev, cur in zip(chunks, chunks[1:]):
        tail = prev[-overlap:]
        out.append((tail + " " + cur).strip())
    return out


def _split_by_headers(text: str) -> list[str]:
    """Break a document into sections at each '## ' heading, keeping the
    heading attached to its body. One coherent topic per section = sharper
    embeddings than cramming several sections into one big chunk."""
    sections = re.split(r"\n(?=## )", text)
    return [s.strip() for s in sections if s.strip()]


def chunk_documents(
    documents: list[Document],
    size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[Chunk]:
    """Header-aware chunking. Each chunk covers one section and is prefixed with
    the document title, so the title's context (e.g. 'Parkar GCC') rides along
    with every chunk and lifts retrieval precision."""
    chunks: list[Chunk] = []
    for doc in documents:
        heading = doc.metadata.get("heading", doc.title)
        idx = 0
        for section in _split_by_headers(doc.text):
            pieces = _split_text(section, size, overlap) if len(section) > size else [section]
            for piece in pieces:
                # Prepend the rich document heading so its strong topic tokens
                # (e.g. "GCC", "Global Capability Centers") ride with every chunk.
                text = piece if piece.startswith(heading) else f"{heading}\n{piece}"
                meta = dict(doc.metadata)
                meta["chunk_index"] = idx
                chunks.append(Chunk(id=f"{doc.metadata['category']}::{idx}", text=text, metadata=meta))
                idx += 1
    return chunks
