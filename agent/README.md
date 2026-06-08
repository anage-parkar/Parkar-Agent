# Parkar RAG Agent

A retrieval-augmented generation (RAG) assistant trained on Parkar's internal
knowledge base. It powers the floating chat widget that appears on every page of
the website. Everything runs **locally via [Ollama](https://ollama.com)** for low
latency and data privacy — no external API calls.

```
Question ─▶ embed (nomic-embed-text) ─▶ vector search (top-K)
                                              │
                                   relevant knowledge chunks
                                              │
            grounded prompt ─▶ llama3.2 (Ollama) ─▶ answer + sources
```

---

## 1. Architecture

| Stage | Component | File |
|-------|-----------|------|
| Knowledge authoring | Generates 12 `.docx` knowledge files | `scripts/generate_docs.py` |
| Loading | Parses `.docx` (paragraphs **and** tables, in order) | `rag/loader.py` |
| Chunking | Header-aware splitter, title-prefixed chunks | `rag/chunker.py` |
| Embeddings | `nomic-embed-text` via Ollama (with task prefixes) | `rag/ollama_client.py` |
| Vector store | Persistent NumPy cosine index | `rag/vectorstore.py` |
| Ingestion | Orchestrates load → chunk → embed → store | `rag/ingest.py` |
| Retrieval + generation | Top-K search, grounding, `llama3.2` answer | `rag/retriever.py` |
| API | FastAPI: `/chat`, `/chat/stream`, `/health` | `server/app.py` |
| Config | All tunables, env-overridable | `config.py` |
| Frontend | Floating widget (auto-injected on all pages) | `../website/js/parkar-agent-widget.js` |

### Why these choices
- **Ollama + `llama3.2` (3B)** — lowest-latency local generation; no per-token cost,
  no data leaves the machine. Swap the model in `config.py` / `.env`.
- **`nomic-embed-text`** — fast, high-quality 768-dim embeddings. We use its
  `search_document:` / `search_query:` task prefixes, which materially improve
  retrieval ranking.
- **NumPy cosine index** — ChromaDB 1.5.x can't import on Python 3.14 (its
  settings still use `pydantic.v1`). A compact NumPy index needs no extra service,
  adds no latency, and persists to `vectordb/`. On Python ≤ 3.13 you can swap in
  ChromaDB by re-implementing the same `VectorStore` interface (`reset`/`add`/
  `query`/`count`).
- **Grounding guardrail** — if no chunk clears `MIN_SIMILARITY`, the agent says it
  doesn't know and points to the right team, instead of hallucinating.

---

## 2. Knowledge base

`scripts/generate_docs.py` produces one `.docx` per category in `data/docx/`:

`leave-policy`, `partners`, `upcoming-projects`, `teams`, `platforms`,
`solutions`, `legal-policies`, `work-culture`, `industries`, `careers`, `gcc`,
`insights`.

> Internal HR docs (Leave Policy, Work Culture, Upcoming Projects) are marked
> **SAMPLE** — replace their `.docx` files with the authoritative versions and
> re-run ingestion. To add a new topic, just drop a `.docx` into `data/docx/` and
> re-ingest; no code change needed.

---

## 3. Setup & run

### Prerequisites
- Python 3.11+ (tested on 3.14)
- [Ollama](https://ollama.com) installed and running
- Models pulled:
  ```bash
  ollama pull llama3.2
  ollama pull nomic-embed-text
  ```

### Install
```bash
cd agent
pip install -r requirements.txt
cp .env.example .env        # optional — tweak models, ports, chunking
```

### Build the knowledge base + index
```bash
python scripts/generate_docs.py     # (re)generate the .docx files
python -m rag.ingest                # parse → chunk → embed → store
```

### Start the API
```bash
python -m server.app
# or:  uvicorn server.app:app --host 0.0.0.0 --port 8000
```
On Windows you can use the helper: `start_agent.bat`.

Check it: open <http://localhost:8000/health>.

---

## 4. API

**`POST /chat`**
```json
{ "message": "What is AIONIQ?" }
```
→
```json
{
  "answer": "AIONIQ is Parkar's AI operating model platform...",
  "sources": [{ "title": "Platforms", "source": "platforms.docx", "category": "platforms", "similarity": 0.74 }],
  "grounded": true
}
```

**`POST /chat/stream`** — Server-Sent Events: a `sources` event, then `token`
events, then `done`. Used by the widget for live typing.

**`GET /health`** — Ollama reachability, installed models, and vector chunk count.

---

## 5. Frontend widget

`../website/js/parkar-agent-widget.js` + `parkar-agent-widget.css` render a
floating button (bottom-right) that opens a chat panel. It is **auto-injected on
every page** by `website/js/components.js` — no per-page edits.

Point it at a non-local API by setting, before the widget loads:
```html
<script>window.PARKAR_AGENT_API = 'https://agent.parkar.in';</script>
```
or via `data-api` on the injected tag / editing the default in the widget file.

---

## 6. Configuration (`config.py` / `.env`)

| Key | Default | Purpose |
|-----|---------|---------|
| `OLLAMA_HOST` | ngrok VM URL | Primary Ollama endpoint |
| `OLLAMA_FALLBACK_HOST` | `http://localhost:11434` | Tried automatically when the primary is unreachable (set empty to disable) |
| `LLM_MODEL` | `llama3.2:latest` | Generation model (`llama3.2:1b` for max speed) |
| `EMBED_MODEL` | `nomic-embed-text:latest` | Embedding model |
| `LLM_TEMPERATURE` | `0.2` | Lower = more factual |
| `LLM_NUM_PREDICT` | `320` | Max output tokens — main latency cap |
| `OLLAMA_KEEP_ALIVE` | `30m` | Keeps the model warm between calls |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | `600` / `100` | Chunking (chars) |
| `TOP_K` | `4` | Chunks fed to the LLM (hybrid re-ranked) |
| `MAX_PER_DOC` | `2` | Max chunks from one document |
| `MIN_SIMILARITY` | `0.25` | Grounding floor |
| `SERVER_PORT` | `8000` | API port |
| `CORS_ORIGINS` | `*` | Allowed origins |

---

## 7. Updating the knowledge base

1. Edit or add `.docx` files in `data/docx/` (or edit `generate_docs.py`).
2. `python -m rag.ingest` (idempotent — it rebuilds the index from scratch).
3. Restart the server if it was running.
