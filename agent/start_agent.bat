@echo off
REM ============================================================
REM  Parkar RAG Agent — one-shot launcher (Windows)
REM  Generates docs (if missing), ingests, and starts the API.
REM ============================================================
setlocal
cd /d "%~dp0"

echo [Parkar Agent] Checking Ollama...
ollama --version >nul 2>&1
if errorlevel 1 (
  echo   ! Ollama not found. Install from https://ollama.com and re-run.
  exit /b 1
)

if not exist "data\docx\leave-policy.docx" (
  echo [Parkar Agent] Generating knowledge-base documents...
  python scripts\generate_docs.py || exit /b 1
)

if not exist "vectordb\parkar_knowledge.npy" (
  echo [Parkar Agent] Building vector index...
  python -m rag.ingest || exit /b 1
)

echo [Parkar Agent] Starting API on http://localhost:8000 ...
python -m server.app

endlocal
