"""
Central configuration for the Parkar RAG Agent.

All tunables (Ollama models, chunking, paths, server) live here and can be
overridden with environment variables (see .env.example). Keeping this in one
place means the ingestion pipeline, retriever and server always agree.
"""
from __future__ import annotations

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Optional .env loading (no hard dependency on python-dotenv)
# ---------------------------------------------------------------------------
def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


_load_dotenv()


def _env(key: str, default: str) -> str:
    return os.environ.get(key, default)


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DOCX_DIR = DATA_DIR / "docx"
VECTORDB_DIR = BASE_DIR / "vectordb"

DOCX_DIR.mkdir(parents=True, exist_ok=True)
VECTORDB_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Ollama  (low-latency local inference)
# ---------------------------------------------------------------------------
OLLAMA_HOST = _env("OLLAMA_HOST", "http://localhost:11434")
# Generation model — llama3.2 (3B) chosen for lowest latency.
LLM_MODEL = _env("LLM_MODEL", "llama3.2:latest")
# Embedding model — nomic-embed-text (768-dim, fast, strong retrieval quality).
EMBED_MODEL = _env("EMBED_MODEL", "nomic-embed-text:latest")
# Generation controls
LLM_TEMPERATURE = float(_env("LLM_TEMPERATURE", "0.2"))
LLM_NUM_CTX = int(_env("LLM_NUM_CTX", "4096"))
REQUEST_TIMEOUT = int(_env("REQUEST_TIMEOUT", "120"))

# ---------------------------------------------------------------------------
# Vector store (ChromaDB, persistent)
# ---------------------------------------------------------------------------
COLLECTION_NAME = _env("COLLECTION_NAME", "parkar_knowledge")

# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------
CHUNK_SIZE = int(_env("CHUNK_SIZE", "900"))        # characters per chunk
CHUNK_OVERLAP = int(_env("CHUNK_OVERLAP", "150"))  # overlap between chunks

# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------
TOP_K = int(_env("TOP_K", "6"))                    # chunks fed to the LLM
# Below this cosine similarity we treat the KB as not covering the question.
MIN_SIMILARITY = float(_env("MIN_SIMILARITY", "0.25"))

# ---------------------------------------------------------------------------
# Server
# ---------------------------------------------------------------------------
SERVER_HOST = _env("SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(_env("SERVER_PORT", "8000"))
# Comma-separated list of allowed CORS origins ("*" allows all — fine for dev).
CORS_ORIGINS = _env("CORS_ORIGINS", "*").split(",")

# Assistant identity / behaviour
ASSISTANT_NAME = _env("ASSISTANT_NAME", "Parkar Assistant")
