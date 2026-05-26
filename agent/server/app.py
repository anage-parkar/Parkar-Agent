"""
FastAPI server for the Parkar RAG Agent.

Endpoints:
    GET  /health        -> Ollama + vector store status
    POST /chat          -> {answer, sources, grounded}  (single response)
    POST /chat/stream   -> Server-Sent Events stream of tokens, then sources

Run:
    cd agent
    uvicorn server.app:app --host 0.0.0.0 --port 8000
    # or: python -m server.app
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Allow `python -m server.app` and `uvicorn server.app:app` from agent/.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import StreamingResponse  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

import config  # noqa: E402
from rag import ollama_client  # noqa: E402
from rag.retriever import Retriever  # noqa: E402
from rag.vectorstore import VectorStore  # noqa: E402

app = FastAPI(title="Parkar RAG Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Build retriever once at startup (reuses the persistent Chroma collection).
_retriever: Retriever | None = None


def get_retriever() -> Retriever:
    global _retriever
    if _retriever is None:
        _retriever = Retriever()
    return _retriever


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    top_k: int | None = None


@app.get("/health")
def health() -> dict:
    out: dict = {"status": "ok", "assistant": config.ASSISTANT_NAME}
    try:
        out["ollama"] = ollama_client.health()
    except Exception as exc:  # pragma: no cover
        out["status"] = "degraded"
        out["ollama"] = {"reachable": False, "error": str(exc)}
    try:
        out["vector_chunks"] = VectorStore().count()
    except Exception as exc:  # pragma: no cover
        out["status"] = "degraded"
        out["vector_chunks"] = 0
        out["vector_error"] = str(exc)
    return out


@app.post("/chat")
def chat(req: ChatRequest) -> dict:
    top_k = req.top_k or config.TOP_K
    result = get_retriever().answer(req.message, top_k=top_k)
    return result


@app.post("/chat/stream")
def chat_stream(req: ChatRequest) -> StreamingResponse:
    top_k = req.top_k or config.TOP_K
    stream, sources = get_retriever().answer_stream(req.message, top_k=top_k)

    def event_gen():
        # First event: the sources, so the UI can render citations immediately.
        yield f"event: sources\ndata: {json.dumps(sources)}\n\n"
        try:
            for token in stream:
                yield f"event: token\ndata: {json.dumps(token)}\n\n"
        except Exception as exc:  # pragma: no cover
            yield f"event: error\ndata: {json.dumps(str(exc))}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server.app:app",
        host=config.SERVER_HOST,
        port=config.SERVER_PORT,
        reload=False,
    )
