# Agent instructions & guardrails

This folder holds the **editable policy** that keeps the assistant on-topic
(Parkar questions only). No code changes are needed to tune it — edit a file
here and **restart the server**.

| File | What it does |
|------|--------------|
| `scope_policy.md` | Appended to the model's system prompt. Tells the LLM, in plain language, what it may and may not answer. This is the layer that makes the model itself refuse off-topic questions. |
| `refusal_rules.json` | A fast, pre-retrieval gate. If the user's message matches a pattern here, the agent refuses **instantly** — before any embedding or LLM call. Catches the obvious cases (math, code, translation) and is also a small latency win. |

These are loaded by `../rag/guardrails.py` and wired into `../rag/retriever.py`.

## How the three guardrail layers fit together

1. **Input gate** (`refusal_rules.json`) — instant refusal for obvious off-domain
   requests. No model call.
2. **Scope policy** (`scope_policy.md`) — injected into the system prompt so the
   model declines anything it can't ground in Parkar context.
3. **Similarity floor** (`MIN_SIMILARITY` in `config.py`) — if nothing in the
   knowledge base clears the floor, the question is off-topic by definition and
   the agent gives its "I don't have that" fallback.

## Editing `refusal_rules.json`

Each rule has a `name`, a list of `patterns` (Python regex, matched
case-insensitively with `re.search`), and a `message` shown when it matches.

- Keep patterns **tight** — a pattern that's too broad will refuse genuine Parkar
  questions. (Example: `code` alone would block "code of conduct"; that's why the
  rule excludes it.)
- Test a new pattern against both the off-topic phrasing you want to block **and**
  a few real Parkar questions, to be sure it doesn't over-match.
- Changes apply on server restart (the rules are cached at startup).
