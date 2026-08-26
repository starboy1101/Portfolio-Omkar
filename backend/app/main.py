from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app import __version__
from backend.app.api.routes import router
from backend.app.dependencies import get_container
from backend.app.schemas import HealthResponse, ReadyResponse

container = get_container()
logging.basicConfig(
    level=getattr(logging, container.settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    container.retriever.prepare_lexical()
    semantic_task = asyncio.create_task(asyncio.to_thread(container.retriever.build))
    try:
        yield
    finally:
        if not semantic_task.done():
            semantic_task.cancel()


app = FastAPI(
    title=container.settings.app_name,
    version=container.settings.app_version,
    description="Grounded portfolio RAG, deterministic actions, recruiter matching, and secure contact APIs.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=container.settings.allowed_origins,
    allow_credentials=container.settings.cors_allow_credentials,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(router)


@app.get("/health", response_model=HealthResponse, tags=["operations"])
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if container.repository.documents else "degraded",
        version=__version__,
        rag_backend=container.retriever.backend,
        llm_provider=container.language_model.provider_name,
        llm_configured=container.language_model.configured,
        email_configured=container.email.configured,
    )


@app.get("/ready", response_model=ReadyResponse, tags=["operations"])
async def ready() -> ReadyResponse:
    checks = {
        "portfolio_data": bool(container.repository.documents),
        "retrieval": container.retriever.ready,
        "resume_file": container.settings.resume_path.is_file(),
    }
    return ReadyResponse(ready=all(checks.values()), checks=checks)


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    return {
        "service": container.settings.app_name,
        "docs": "/docs",
        "health": "/health",
        "model_gateway": "configured" if container.language_model.configured else "not configured",
    }
