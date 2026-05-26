"""
Load .docx knowledge-base files into plain text.

Each file becomes one `Document` with the full text plus metadata (source file
name and a human-friendly category/title derived from the filename). Headings
are preserved inline so the chunker keeps section context.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from docx import Document as DocxDocument
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table
from docx.text.paragraph import Paragraph

from config import DOCX_DIR


def _iter_blocks(doc):
    """Yield paragraphs and tables in true document order.

    python-docx exposes paragraphs and tables as separate collections, which
    loses their interleaving. Walking the body XML keeps a heading next to the
    table that belongs under it — critical for chunk relevance.
    """
    body = doc.element.body
    for child in body.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, doc)
        elif isinstance(child, CT_Tbl):
            yield Table(child, doc)


@dataclass
class Document:
    source: str                      # file name, e.g. "leave-policy.docx"
    title: str                       # e.g. "Leave Policy"
    text: str
    metadata: dict = field(default_factory=dict)


def _title_from_filename(path: Path) -> str:
    return path.stem.replace("-", " ").replace("_", " ").title()


def _extract(path: Path) -> tuple[str, str]:
    """Return (heading, text) for a .docx, reading paragraphs and tables in
    document order. `heading` is the document's title (level-0/Title style) —
    a rich label like 'Parkar GCC — Global Capability Centers' that we prepend
    to every chunk so its strong topic tokens travel with the content."""
    doc = DocxDocument(str(path))
    parts: list[str] = []
    heading = ""

    for block in _iter_blocks(doc):
        if isinstance(block, Paragraph):
            text = block.text.strip()
            if not text:
                continue
            style = (block.style.name or "").lower() if block.style else ""
            if style == "title" and not heading:
                heading = text
            # Mark headings so chunk boundaries respect sections.
            if style.startswith("heading") or style == "title":
                parts.append(f"\n## {text}\n")
            else:
                parts.append(text)
        elif isinstance(block, Table):
            parts.append(_render_table(block))

    return heading, "\n".join(p for p in parts if p.strip()).strip()


def _render_table(table: Table) -> str:
    """Flatten a table so each data row reads as a self-contained sentence,
    keyed by the header — far better for embeddings than bare pipe rows."""
    rows = [[c.text.strip() for c in r.cells] for r in table.rows]
    if not rows:
        return ""
    header, *body = rows
    lines = [" | ".join(header)]
    for row in body:
        if not any(row):
            continue
        # "FirstCol — Header2: val2; Header3: val3"
        label = row[0]
        rest = [
            f"{header[i]}: {row[i]}"
            for i in range(1, len(row))
            if i < len(header) and row[i]
        ]
        lines.append(f"{label} — " + "; ".join(rest) if rest else label)
    return "\n".join(lines)


def load_documents(docx_dir: Path | None = None) -> list[Document]:
    """Load every .docx in the data directory."""
    directory = Path(docx_dir or DOCX_DIR)
    docs: list[Document] = []
    for path in sorted(directory.glob("*.docx")):
        if path.name.startswith("~$"):  # skip Word lock files
            continue
        heading, text = _extract(path)
        if not text:
            continue
        title = _title_from_filename(path)
        heading = heading or title
        docs.append(
            Document(
                source=path.name,
                title=title,
                text=text,
                metadata={
                    "source": path.name,
                    "title": title,        # short label for UI source chips
                    "heading": heading,     # rich title used as chunk context
                    "category": path.stem,
                },
            )
        )
    return docs
