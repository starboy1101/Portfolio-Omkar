# Omkar Portfolio with Ask Omkar AI

This repository deploys as three separate services:

```text
Visitor
  -> Render Static Site (React/Vite portfolio)
  -> Render Web Service (FastAPI, security, RAG, actions)
  -> Hugging Face Gradio ZeroGPU Space (Qwen3-4B inference only)
```

The browser never calls Hugging Face directly. The FastAPI backend builds a
bounded prompt from audited portfolio data, removes personal data, calls the
named Gradio endpoint, and validates all UI actions itself. If ZeroGPU is
sleeping, queued, out of quota, or unavailable, the backend returns an honest
evidence-grounded response without running a local language model.

## Deployment files

- [`render.yaml`](render.yaml): Render Blueprint for both the static frontend
  and FastAPI backend, including automatic URL/CORS wiring.
- [`DEPLOYMENT.md`](DEPLOYMENT.md): start-to-finish deployment and
  troubleshooting guide.
- [`backend/huggingface-space/`](backend/huggingface-space): the three files to
  copy into a separate Hugging Face Gradio ZeroGPU Space.
- [`backend/.env.example`](backend/.env.example): all backend configuration.

The previous llama.cpp/GGUF provider, direct Hugging Face Inference provider,
and FastAPI-mounted Gradio console have been removed. Qwen inference now happens
only in the dedicated ZeroGPU Space.

## Main technology choices

| Layer | Choice |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Motion |
| Backend | FastAPI, Pydantic, SSE, `gradio_client` |
| Default retrieval | Lightweight lexical retrieval on Render |
| Optional retrieval | BGE embeddings plus FAISS via a separate requirements file |
| Generative model | `Qwen/Qwen3-4B-Instruct-2507` on Hugging Face ZeroGPU |
| Failure path | Audited deterministic answers; no local LLM |

`data/portfolio.json` is the shared audited content source. Resume facts govern
employment and education, while portfolio-only project evidence stays clearly
separate. Model text cannot execute code, select arbitrary URLs, or invent
frontend actions.

## Repository structure

```text
.
|-- data/portfolio.json
|-- src/                         # React portfolio and assistant UI
|-- backend/
|   |-- app/api/                 # FastAPI routes
|   |-- app/services/            # chat, RAG, model gateway, email, security
|   |-- huggingface-space/       # copy into the separate Gradio Space
|   |-- requirements.txt         # lightweight Render dependencies
|   |-- requirements-semantic-rag.txt
|   `-- tests/
|-- render.yaml                  # frontend + backend Blueprint
|-- DEPLOYMENT.md
`-- .env.example                 # frontend API, canonical URL, and analytics
```

## Local development

Prerequisites: Node.js 18+ and Python 3.11.

Backend, from the repository root:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r backend/requirements.txt
```

Copy `backend/.env.example` to `backend/.env`. For real Qwen answers, set:

```dotenv
HF_GRADIO_SPACE_ID=YOUR_HF_USERNAME/YOUR_SPACE_NAME
HF_GRADIO_API_NAME=/generate
HF_TOKEN=hf_your_backend_only_read_token
```

Then start FastAPI:

```bash
uvicorn backend.app.main:app --reload --port 7860
```

Frontend:

```bash
npm install
npm run dev
```

The frontend defaults to `http://localhost:7860` through `.env.example`. Useful
backend URLs are `/docs`, `/health`, and `/ready`.

Frontend build variables:

| Variable | Purpose |
| --- | --- |
| `VITE_AI_API_URL` | Public Render backend origin |
| `VITE_SITE_URL` | Canonical public frontend origin, without a trailing slash |
| `VITE_GA_MEASUREMENT_ID` | Optional GA4 ID; the tag loads only after explicit consent |

The dedicated Qwen Space is not required for local correctness. Leave
`HF_GRADIO_SPACE_ID` blank to exercise the no-model fallback. ZeroGPU itself is
a Hugging Face runtime; deploy the files instead of trying to emulate ZeroGPU on
a normal local CPU.

## Backend variables

| Variable | Purpose |
| --- | --- |
| `HF_GRADIO_SPACE_ID` | Hugging Face Space ID, such as `owner/space` |
| `HF_GRADIO_API_NAME` | Stable named endpoint; keep `/generate` |
| `HF_TOKEN` | Backend-only HF read token; never expose as `VITE_*` |
| `HF_GRADIO_TIMEOUT_SECONDS` | Queue/network/job timeout |
| `LLM_MAX_TOKENS`, `LLM_TEMPERATURE` | Bounded generation settings |
| `CORS_ORIGINS` | Allowed Render frontend origin(s) |
| `ENABLE_SEMANTIC_RAG` | Optional BGE + FAISS path; defaults to `false` |
| `TRUST_PROXY_HEADERS` | Enabled by the Render Blueprint for per-client limits |

For optional semantic retrieval locally or on a larger service:

```bash
python -m pip install -r backend/requirements-semantic-rag.txt
```

Then set `ENABLE_SEMANTIC_RAG=true`. Keep it disabled on Render's 512 MB free
web service; lexical retrieval is always available.

## API surface

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Liveness and readiness |
| `GET` | `/api/profile`, `/api/projects`, `/api/skills` | Audited portfolio data |
| `POST` | `/api/chat` | Grounded response, sources, actions, suggestions |
| `POST` | `/api/chat/stream` | SSE response stream with an early connection marker |
| `POST` | `/api/jd/analyze` | Evidence-based job-description comparison |
| `POST` | `/api/resume/email`, `/api/contact` | Validated delivery flows |

## Verification

```bash
npm run check
python -m pip install -r backend/requirements-dev.txt
python -m pytest -c backend/pytest.ini backend/tests
```

Tests mock the Gradio client. They do not download Qwen or consume ZeroGPU
quota.

## Free-tier constraints

- Render's free FastAPI service sleeps after inactivity, and a ZeroGPU Space may
  also sleep or queue. The first response can therefore be noticeably slower.
- Render's free web service is intentionally kept lightweight: no Qwen weights,
  Torch, SentenceTransformers, full Gradio, or FAISS are installed there.
- Authenticated server-to-Space calls share the Hugging Face token owner's
  ZeroGPU quota. This design fits a low-traffic portfolio demo.
- Render blocks outbound SMTP ports on free web services. The existing SMTP
  endpoints need a paid backend or a future HTTPS email-provider adapter.
- In-memory rate limits reset when the backend restarts and are intended for one
  Uvicorn worker.

See [`DEPLOYMENT.md`](DEPLOYMENT.md) before deploying.
