"""
Thin client over the local Ollama HTTP API.

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
    LLM_TEMPERATURE,
    OLLAMA_HOST,
    REQUEST_TIMEOUT,
)


class OllamaError(RuntimeError):
    """Raised when Ollama is unreachable or returns an error."""


def _url(path: str) -> str:
    return f"{OLLAMA_HOST.rstrip('/')}{path}"


def health() -> dict:
    """Return basic Ollama reachability + whether required models are present."""
    try:
        resp = requests.get(_url("/api/tags"), timeout=10)
        resp.raise_for_status()
    except requests.RequestException as exc:  # pragma: no cover - network
        raise OllamaError(f"Cannot reach Ollama at {OLLAMA_HOST}: {exc}") from exc

    installed = {m.get("name", "") for m in resp.json().get("models", [])}
    return {
        "reachable": True,
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
    try:
        resp = requests.post(
            _url("/api/embeddings"),
            json={"model": EMBED_MODEL, "prompt": _apply_prefix(text, task)},
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise OllamaError(f"Embedding request failed: {exc}") from exc

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
        "options": {"temperature": LLM_TEMPERATURE, "num_ctx": LLM_NUM_CTX},
    }
    if system:
        payload["system"] = system
    try:
        resp = requests.post(
            _url("/api/generate"), json=payload, timeout=REQUEST_TIMEOUT
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise OllamaError(f"Generation request failed: {exc}") from exc
    return resp.json().get("response", "").strip()


def generate_stream(prompt: str, system: str | None = None) -> Iterator[str]:
    """Yield response tokens as they arrive — used by the streaming endpoint."""
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": True,
        "options": {"temperature": LLM_TEMPERATURE, "num_ctx": LLM_NUM_CTX},
    }
    if system:
        payload["system"] = system
    try:
        with requests.post(
            _url("/api/generate"),
            json=payload,
            stream=True,
            timeout=REQUEST_TIMEOUT,
        ) as resp:
            resp.raise_for_status()
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
