"""
URL Resolver — maps user questions to relevant Parkar website URLs.

Parses parkar-urls.txt once at startup. For each entry, keywords are built
from the label text, the URL path segments, and the section heading.

User questions are tokenised, suffix-stemmed, and synonym-expanded before
matching so vocabulary gaps (job vs career, opening vs position) are bridged
without a second model call.
"""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import NamedTuple

_URLS_FILE = Path(__file__).resolve().parent.parent.parent / "parkar-urls.txt"

_MAX_URLS = 3
_MIN_SCORE = 0.15   # fraction of expanded query terms that must match

# Words that carry no discriminative signal for URL matching.
_STOPWORDS = frozenset("""
    the a an of for to in on and or is are do does what which how who when
    with as at by from your our we you i it its their this that these those
    about can could would should will have has offer offers been being
    parkar digital
    there any some more all get let make into here very just also only please
    tell explain show know learn much many few lot lots quite really actually
    basically generally simply currently recently without theres thats
    provide providing does offer offering
""".split())

# Synonym map: question term (post-stem) → canonical terms found in URL labels/paths.
# This bridges the vocabulary gap between how users ask and how pages are labelled.
_SYNONYMS: dict[str, list[str]] = {
    # Careers
    "job":            ["career", "position", "open"],
    "jobs":           ["career", "position", "open"],
    "opening":        ["career", "position", "open"],
    "openings":       ["career", "position", "open"],
    "hiring":         ["career"],
    "vacancy":        ["career", "position"],
    "vacancies":      ["career", "position"],
    "employment":     ["career"],
    "opportunity":    ["career"],
    "opportunities":  ["career"],
    "recruit":        ["career"],
    "recruitment":    ["career"],
    "role":           ["career", "position"],
    "roles":          ["career", "position"],
    "position":       ["career", "open"],
    "positions":      ["career", "open"],
    # Contact
    "reach":          ["contact"],
    "touch":          ["contact"],
    "enquiry":        ["contact"],
    "inquiry":        ["contact"],
    "connect":        ["contact"],
    # Insights
    "blog":           ["blog", "insight"],
    "blogs":          ["blog", "insight"],
    "article":        ["blog", "insight"],
    "articles":       ["blog", "insight"],
    "post":           ["blog", "insight"],
    "posts":          ["blog", "insight"],
    "read":           ["blog", "insight"],
    "publication":    ["blog", "insight"],
    "write":          ["blog", "insight"],
    "wrote":          ["blog", "insight"],
    # Company / About
    "history":        ["journey", "about"],
    "story":          ["journey", "about"],
    "founded":        ["journey", "about"],
    "origin":         ["journey", "about"],
    "background":     ["journey", "about"],
    "award":          ["award", "recognition"],
    "awards":         ["award", "recognition"],
    "prize":          ["award"],
    "achievement":    ["award"],
    "accolade":       ["award"],
    "recognize":      ["award"],
    # Industries
    "sector":         ["industry"],
    "sectors":        ["industry"],
    "vertical":       ["industry"],
    "client":         ["industry"],
    "clients":        ["industry"],
    "customer":       ["industry"],
    "customers":      ["industry"],
    "serve":          ["industry"],
    # Leadership / Team
    "leader":         ["leadership"],
    "leaders":        ["leadership"],
    "management":     ["leadership"],
    "executive":      ["leadership"],
    "executives":     ["leadership"],
    "founder":        ["leadership"],
    "founders":       ["leadership"],
    "ceo":            ["leadership"],
    "cto":            ["leadership"],
    # Events
    "conference":     ["event"],
    "summit":         ["event"],
    "seminar":        ["event"],
    "conclave":       ["event"],
    # Research
    "report":         ["research"],
    "reports":        ["research"],
    "whitepaper":     ["research"],
    "study":          ["case"],
    "studies":        ["case"],
    # Legal
    "policy":         ["legal", "privacy"],
    "policies":       ["legal", "privacy"],
    "condition":      ["legal", "term"],
    "conditions":     ["legal", "term"],
    "compliance":     ["legal"],
    "regulation":     ["legal"],
    # Tech / Solutions
    "app":            ["application"],
    "apps":           ["application"],
    "infra":          ["cloud"],
    "infrastructure": ["cloud"],
    "microservice":   ["cloud", "application"],
    "kubernetes":     ["cloud", "application"],
    "devops":         ["cloud", "application"],
    "saas":           ["application", "platform"],
    "aiops":          ["aiop", "itop"],
    "itops":          ["itop"],
    "operation":      ["itop"],
    "operations":     ["itop"],
}


class _UrlEntry(NamedTuple):
    label: str
    url: str
    section: str
    keywords: frozenset


def _stem(word: str) -> str:
    """Strip common plural / verb suffixes for basic normalisation.

    Keeps the logic simple — only removes unambiguous suffixes so that
    'careers' → 'career', 'positions' → 'position', etc.
    """
    if len(word) > 5 and word.endswith("ies"):
        return word[:-3] + "y"
    if len(word) > 4 and word.endswith("es") and word[-3] not in "aeiou":
        return word[:-2]
    if len(word) > 4 and word.endswith("s") and word[-2] not in "aeiousxz":
        return word[:-1]
    return word


def _tokenize(text: str) -> list[str]:
    """Tokenise text, filter stopwords (before AND after stemming), then stem."""
    result = []
    for raw in re.findall(r"[a-z0-9]+", text.lower()):
        if len(raw) <= 2 or raw in _STOPWORDS:
            continue
        stemmed = _stem(raw)
        if stemmed not in _STOPWORDS:
            result.append(stemmed)
    return result


def _expand(terms: list[str]) -> set[str]:
    """Expand query terms with synonyms to bridge vocabulary gaps."""
    expanded = set(terms)
    for t in terms:
        for syn in _SYNONYMS.get(t, []):
            expanded.update(_tokenize(syn))
    return expanded


def _url_path_tokens(url: str) -> list[str]:
    """Extract keyword tokens from the URL path segments."""
    path = url.split("parkar.in", 1)[1] if "parkar.in" in url else url
    return _tokenize(path.replace("-", " ").replace("/", " "))


@lru_cache(maxsize=1)
def _load_entries() -> list[_UrlEntry]:
    if not _URLS_FILE.exists():
        return []
    entries: list[_UrlEntry] = []
    current_section = ""
    for raw in _URLS_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or all(c in "-= \t" for c in line):
            continue
        if ": http" in line:
            idx = line.index(": http")
            label = line[:idx].strip()
            url = line[idx + 2:].strip()
            if label and url.startswith("http"):
                kws = frozenset(
                    _tokenize(f"{label} {current_section}")
                    + _url_path_tokens(url)
                )
                entries.append(_UrlEntry(
                    label=label, url=url,
                    section=current_section, keywords=kws,
                ))
            continue
        sub = re.match(r"^--\s+(.+?)\s+--$", line)
        if sub:
            current_section = sub.group(1)
            continue
        if ":" not in line and not line.startswith("END"):
            current_section = line
    return entries


def resolve(question: str, max_urls: int = _MAX_URLS) -> list[dict]:
    """Return up to max_urls relevant URL dicts for the given question.

    Each dict has keys: label, url, section.
    Returns [] when nothing matches or the URL file is missing.
    """
    q_terms = _tokenize(question)
    if not q_terms:
        return []
    q_expanded = _expand(q_terms)

    scored: list[tuple[float, _UrlEntry]] = []
    for entry in _load_entries():
        overlap = len(q_expanded & entry.keywords)
        if overlap == 0:
            continue
        # Score = fraction of expanded query terms covered by this entry.
        # Entries that cover more of what the user asked about rank higher.
        score = overlap / max(len(q_expanded), 1)
        if score >= _MIN_SCORE:
            scored.append((score, entry))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [
        {"label": e.label, "url": e.url, "section": e.section}
        for _, e in scored[:max_urls]
    ]
