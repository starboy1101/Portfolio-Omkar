# Ask Omkar AI backend

This FastAPI service is the security and grounding layer between the React
portfolio and the dedicated Hugging Face ZeroGPU model Space.

```text
React -> FastAPI validation/rate limits -> audited retrieval -> Gradio client
                                                         -> Qwen ZeroGPU Space
```

Only generated text comes back from the Space. Sources, portfolio actions,
prompt-injection checks, PII redaction, recruiter scoring, email handling, and
fallback answers remain in FastAPI.

## Setup

Run commands from the repository root so `backend.app` imports and shared data
paths resolve:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r backend/requirements.txt
```

Copy `backend/.env.example` to `backend/.env`, then set at minimum:

```dotenv
HF_GRADIO_SPACE_ID=YOUR_HF_USERNAME/YOUR_SPACE_NAME
HF_GRADIO_API_NAME=/generate
HF_TOKEN=hf_your_backend_only_read_token
```

Start the API:

```bash
uvicorn backend.app.main:app --reload --port 7860
```

Open `http://localhost:7860/docs`. Health and readiness are available at
`/health` and `/ready`.

If the Space ID is blank, `/health` reports `llmConfigured: false` and chat uses
the audited no-model response path. Model failures and timeouts return the same
safe fallback instead of breaking the frontend.

## Remote model contract

`backend/app/services/llm.py` creates one lazy `gradio_client.Client` targeting
`HF_GRADIO_SPACE_ID`. It submits these positional values to `/generate`:

1. the backend-owned system prompt;
2. a PII-redacted, bounded portfolio prompt;
3. `LLM_MAX_TOKENS`;
4. `LLM_TEMPERATURE`.

The client waits at most `HF_GRADIO_TIMEOUT_SECONDS`, cancels a timed-out job,
does not automatically retry a submitted generation, and never writes the HF
token or provider exception text to logs.

The matching Space implementation is in `backend/huggingface-space/`. Deploy
those files to a separate Gradio ZeroGPU Space; do not deploy this FastAPI
service as the model Space.

## Retrieval

Lexical retrieval has no heavy dependency and is the Render default. The
semantic BGE + FAISS path remains optional:

```bash
python -m pip install -r backend/requirements-semantic-rag.txt
```

```dotenv
ENABLE_SEMANTIC_RAG=true
EMBEDDING_LOCAL_FILES_ONLY=false
```

Use that only on a service with enough RAM. If imports or model loading fail,
retrieval stays lexical.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Process, retrieval, model-gateway, and email status |
| `GET` | `/ready` | Portfolio, retrieval, and resume readiness |
| `GET` | `/api/profile` | Audited profile data |
| `GET` | `/api/projects` | Canonical project data |
| `GET` | `/api/skills` | Evidence-linked skills |
| `POST` | `/api/chat` | Grounded answer, sources, suggestions, actions |
| `POST` | `/api/chat/stream` | SSE deltas and final response |
| `POST` | `/api/jd/analyze` | Evidence-based JD comparison |
| `POST` | `/api/resume/email` | Validated resume delivery |
| `POST` | `/api/contact` | Validated contact notification |

The action registry is allowlisted and has no shell, Python execution,
filesystem, or arbitrary-URL tool. Resume/contact actions stay deterministic and
are never sent to Qwen.

## Email

SMTP values remain supported for local use or a host that permits SMTP:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
SMTP_SENDER_EMAIL=portfolio@example.com
CONTACT_RECIPIENT_EMAIL=omkarmahabdi007@gmail.com
```

Render's free web services block outbound SMTP ports 25, 465, and 587. On that
plan these endpoints remain safely unconfigured and return `503`; use a paid
backend or implement an HTTPS email provider before enabling them in production.

## Tests

```bash
python -m pip install -r backend/requirements-dev.txt
python -m pytest -c backend/pytest.ini backend/tests
```

Provider tests use a fake Gradio client and verify the Space ID, token, named
endpoint, generation options, timeout cancellation, and token-safe logging.

For complete deployment steps, see the root `DEPLOYMENT.md` and `render.yaml`.
