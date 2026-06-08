"""
Guardrails — keep the assistant strictly on-topic (Parkar questions only).

Everything here is driven by editable files in ``agent/instructions/`` so the
policy can be tuned without touching code:

  * ``scope_policy.md``    -> appended to the system prompt (see scope_policy()).
  * ``refusal_rules.json`` -> pre-retrieval deny patterns (see check_input()).

Design notes:
  * check_input() runs BEFORE retrieval and makes NO model call, so it both
    enforces scope and *saves* latency on obvious off-topic requests.
  * Files are read once and cached; restart the server to pick up edits.
"""
from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

from config import ASSISTANT_NAME

_INSTRUCTIONS_DIR = Path(__file__).resolve().parent.parent / "instructions"
_RULES_FILE = _INSTRUCTIONS_DIR / "refusal_rules.json"
_POLICY_FILE = _INSTRUCTIONS_DIR / "scope_policy.md"

# Generic refusal used if a rule in refusal_rules.json omits its own message.
_DEFAULT_REFUSAL = (
    f"I'm {ASSISTANT_NAME} — I can only help with questions about Parkar. "
    "Ask me about our services, platforms, policies, teams and more!"
)


@lru_cache(maxsize=1)
def _rules() -> list[dict]:
    """Load and compile refusal rules once. Returns [] if the file is missing
    or malformed, so a bad edit degrades to 'no input gate' rather than a crash
    (the scope policy + similarity floor still apply)."""
    if not _RULES_FILE.exists():
        return []
    try:
        data = json.loads(_RULES_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    compiled: list[dict] = []
    for rule in data.get("rules", []):
        patterns = []
        for raw in rule.get("patterns", []):
            try:
                patterns.append(re.compile(raw, re.IGNORECASE))
            except re.error:
                continue  # skip a single bad pattern, keep the rest
        if patterns:
            compiled.append(
                {
                    "name": rule.get("name", "rule"),
                    "patterns": patterns,
                    "message": rule.get("message") or _DEFAULT_REFUSAL,
                }
            )
    return compiled


@lru_cache(maxsize=1)
def scope_policy() -> str:
    """The scope policy text to append to the system prompt ('' if absent)."""
    if _POLICY_FILE.exists():
        try:
            return _POLICY_FILE.read_text(encoding="utf-8").strip()
        except OSError:
            return ""
    return ""


def check_input(question: str) -> str | None:
    """Return a refusal message if the question is an obvious off-domain request
    (math, code, translation, ...), else None. Runs before retrieval; no model
    call. The first matching rule wins."""
    q = question.strip()
    if not q:
        return None
    for rule in _rules():
        if any(pat.search(q) for pat in rule["patterns"]):
            return rule["message"]
    return None
