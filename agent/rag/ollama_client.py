"""
Thin client over the Ollama HTTP API.

Two responsibilities:
  * embed()       -> turn text into vectors with nomic-embed-text
  * generate()    -> answer with llama3.2 (non-streaming)
  * generate_stream() -> token-by-token streaming for the chat widget

We talk to Ollama over plain HTTP (requests) so the only runtime dependency is
`requests`. Everything is configured from config.py.
"""
from __future__ import annotations

import json
from typing import Iterator, Sequence

import requests

from config import (
    EMBED_MODEL,
    LLM_MODEL,
    LLM_NUM_CTX,
    LLM_NUM_PREDICT,
    LLM_TEMPERATURE,
    LLM_TOP_P,
    OLLAMA_FALLBACK_HOST,
    OLLAMA_HOST,
    OLLAMA_KEEP_ALIVE,
    REQUEST_TIMEOUT,
)


class OllamaError(RuntimeError):
    """Raised when Ollama is unreachable or returns an error."""


# Always sent so a free-tier ngrok tunnel returns JSON instead of its HTML
# browser-warning interstitial. Harmless against a direct Ollama endpoint (ignored).
_HEADERS = {"ngrok-skip-browser-warning": "true"}

# One reused session: pools the TCP/TLS connection so we don't pay a fresh
# handshake to the (remote, tunnelled) Ollama on every embed/generate call.
_SESSION = requests.Session()
_SESSION.headers.update(_HEADERS)

# Ordered list of endpoints to try. The free ngrok tunnel drops intermittently,
# so we fall back to a local Ollama automatically. De-duplicated, empties dropped.
_HOSTS = list(dict.fromkeys(h.rstrip("/") for h in (OLLAMA_HOST, OLLAMA_FALLBACK_HOST) if h))
_TRIES_PER_HOST = 2          # retry once per host for transient tunnel SSL drops
_preferred = 0               # index of the host that last worked — tried first


def _ordered_hosts() -> list[int]:
    return sorted(range(len(_HOSTS)), key=lambda i: 0 if i == _preferred else 1)


def _open(method: str, path: str, *, timeout: int, stream: bool = False, **kw):
    """Issue a request, failing over across _HOSTS. Returns an open Response
    (caller reads/streams it). 'Sticks' to whichever host succeeds so we don't
    keep hammering a dead tunnel on every call."""
    global _preferred
    last_exc: Exception | None = None
    for idx in _ordered_hosts():
        url = f"{_HOSTS[idx]}{path}"
        for _ in range(_TRIES_PER_HOST):
            try:
                resp = _SESSION.request(method, url, timeout=timeout, stream=stream, **kw)
                resp.raise_for_status()
                _preferred = idx
                return resp
            except requests.RequestException as exc:
                last_exc = exc
    raise OllamaError(
        f"All Ollama hosts failed ({', '.join(_HOSTS)}): {last_exc}"
    ) from last_exc


# Shared generation options. keep_alive keeps the model resident between calls;
# num_predict caps output length — together these are the main latency levers.
def _gen_options() -> dict:
    return {
        "temperature": LLM_TEMPERATURE,
        "num_ctx": LLM_NUM_CTX,
        "num_predict": LLM_NUM_PREDICT,
        "top_p": LLM_TOP_P,
    }


def active_host() -> str:
    """The endpoint currently preferred (last one that answered)."""
    return _HOSTS[_preferred] if _HOSTS else ""


def health() -> dict:
    """Return basic Ollama reachability + whether required models are present."""
    resp = _open("GET", "/api/tags", timeout=max(REQUEST_TIMEOUT, 120))
    installed = {m.get("name", "") for m in resp.json().get("models", [])}
    return {
        "reachable": True,
        "host": active_host(),
        "models_installed": sorted(installed),
        "llm_ready": LLM_MODEL in installed,
        "embed_ready": EMBED_MODEL in installed,
    }


# ---------------------------------------------------------------------------
# Embeddings
# ---------------------------------------------------------------------------
# nomic-embed-text is trained with task prefixes. Using them sharply improves
# retrieval separation: store chunks as "search_document:" and questions as
# "search_query:". We apply them automatically based on `task`.
_PREFIX = {
    "document": "search_document: ",
    "query": "search_query: ",
}


def _apply_prefix(text: str, task: str | None) -> str:
    if task in _PREFIX and not text.startswith("search_"):
        return _PREFIX[task] + text
    return text


def embed(text: str, task: str | None = "query") -> list[float]:
    """Embed a single string. `task` is 'query' (default), 'document', or None."""
    resp = _open(
        "POST",
        "/api/embeddings",
        json={
            "model": EMBED_MODEL,
            "prompt": _apply_prefix(text, task),
            "keep_alive": OLLAMA_KEEP_ALIVE,
        },
        timeout=REQUEST_TIMEOUT,
    )
    vector = resp.json().get("embedding")
    if not vector:
        raise OllamaError("Ollama returned an empty embedding.")
    return vector


def embed_batch(texts: Sequence[str], task: str | None = "document") -> list[list[float]]:
    """Embed many strings (default task 'document' — used during ingestion).
    Ollama's embeddings endpoint is one-at-a-time, so we loop — fine for a few
    hundred chunks and keeps memory flat."""
    return [embed(t, task=task) for t in texts]


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------
def generate(prompt: str, system: str | None = None) -> str:
    """Single-shot generation (non-streaming)."""
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": OLLAMA_KEEP_ALIVE,
        "options": _gen_options(),
    }
    if system:
        payload["system"] = system
    resp = _open("POST", "/api/generate", json=payload, timeout=REQUEST_TIMEOUT)
    return resp.json().get("response", "").strip()


def generate_stream(prompt: str, system: str | None = None) -> Iterator[str]:
    """Yield response tokens as they arrive — used by the streaming endpoint."""
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": True,
        "keep_alive": OLLAMA_KEEP_ALIVE,
        "options": _gen_options(),
    }
    if system:
        payload["system"] = system
    try:
        with _open(
            "POST", "/api/generate", json=payload, stream=True, timeout=REQUEST_TIMEOUT
        ) as resp:
            for line in resp.iter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                token = chunk.get("response", "")
                if token:
                    yield token
                if chunk.get("done"):
                    break
    except requests.RequestException as exc:
        raise OllamaError(f"Streaming generation failed: {exc}") from exc
