from __future__ import annotations

import asyncio
import json
import re
from collections.abc import AsyncIterator

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from backend.app.dependencies import get_container
from backend.app.schemas import (
    ChatRequest,
    ChatResponse,
    ContactRequest,
    DeliveryResponse,
    JobDescriptionRequest,
    JobMatchResponse,
    ProfileResponse,
    ProjectsResponse,
    ResumeEmailRequest,
    SkillsResponse,
)
from backend.app.services.email_service import (
    EmailConfigurationError,
    EmailDeliveryError,
)
from backend.app.services.rate_limit import RateLimitExceeded
from backend.app.services.security import honeypot_triggered

router = APIRouter(prefix="/api")


def _client_identity(request: Request) -> str:
    container = get_container()
    if container.settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limit(request: Request, scope: str, limit: int, window: int) -> None:
    try:
        get_container().rate_limiter.check(_client_identity(request), scope, limit, window)
    except RateLimitExceeded as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc


def _sse(event: str, payload: object) -> str:
    return f"event: {event}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


@router.get("/profile", response_model=ProfileResponse)
async def get_profile() -> ProfileResponse:
    container = get_container()
    return ProfileResponse(**container.repository.profile_payload(container.settings.public_resume_url))


@router.get("/projects", response_model=ProjectsResponse)
async def get_projects() -> ProjectsResponse:
    return ProjectsResponse(items=get_container().repository.projects)


@router.get("/skills", response_model=SkillsResponse)
async def get_skills() -> SkillsResponse:
    repository = get_container().repository
    return SkillsResponse(categories=repository.skill_categories, all=repository.all_skills())


@router.post("/chat", response_model=ChatResponse, response_model_exclude_none=True)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    container = get_container()
    _rate_limit(
        request,
        "chat",
        container.settings.chat_rate_limit,
        container.settings.standard_rate_window_seconds,
    )
    if len(payload.message) > container.settings.max_chat_chars:
        raise HTTPException(status_code=422, detail="Message is too long")
    return await container.chat.answer(payload)


@router.post("/chat/stream")
async def chat_stream(payload: ChatRequest, request: Request) -> StreamingResponse:
    container = get_container()
    _rate_limit(
        request,
        "chat_stream",
        container.settings.chat_rate_limit,
        container.settings.standard_rate_window_seconds,
    )
    if len(payload.message) > container.settings.max_chat_chars:
        raise HTTPException(status_code=422, detail="Message is too long")

    async def generate() -> AsyncIterator[str]:
        # Flush headers before a sleeping Render service or ZeroGPU queue finishes.
        yield ": connected\n\n"
        try:
            result = await container.chat.answer(payload)
            for token in re.findall(r"\S+\s*", result.message):
                yield _sse("delta", {"type": "delta", "delta": token})
                await asyncio.sleep(0)
            yield _sse(
                "complete",
                {
                    "type": "complete",
                    "response": result.model_dump(mode="json", by_alias=True, exclude_none=True),
                },
            )
        except Exception:  # noqa: BLE001 - SSE must close with a safe event for any provider failure
            yield _sse("error", {"type": "error", "message": "The assistant could not complete the response."})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post("/jd/analyze", response_model=JobMatchResponse)
async def analyze_job_description(payload: JobDescriptionRequest, request: Request) -> JobMatchResponse:
    container = get_container()
    _rate_limit(
        request,
        "jd",
        container.settings.jd_rate_limit,
        container.settings.standard_rate_window_seconds,
    )
    if len(payload.job_description) > container.settings.max_jd_chars:
        raise HTTPException(status_code=422, detail="Job description is too long")
    return container.jd_analyzer.analyze(payload.job_description)


@router.post("/resume/email", response_model=DeliveryResponse, status_code=status.HTTP_202_ACCEPTED)
async def email_resume(payload: ResumeEmailRequest, request: Request) -> DeliveryResponse:
    container = get_container()
    _rate_limit(
        request,
        "resume_email",
        container.settings.email_rate_limit,
        container.settings.sensitive_rate_window_seconds,
    )
    if honeypot_triggered(payload.website):
        raise HTTPException(status_code=400, detail="Unable to process submission")
    try:
        await container.email.send_resume(payload)
    except EmailConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Resume email is temporarily unavailable") from exc
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=502, detail="Resume email could not be delivered") from exc
    return DeliveryResponse(accepted=True, message="Resume email accepted for delivery")


@router.post("/contact", response_model=DeliveryResponse, status_code=status.HTTP_202_ACCEPTED)
async def contact(payload: ContactRequest, request: Request) -> DeliveryResponse:
    container = get_container()
    _rate_limit(
        request,
        "contact",
        container.settings.contact_rate_limit,
        container.settings.sensitive_rate_window_seconds,
    )
    if honeypot_triggered(payload.website):
        raise HTTPException(status_code=400, detail="Unable to process submission")
    try:
        await container.email.send_contact_notification(payload)
    except EmailConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Contact delivery is temporarily unavailable") from exc
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=502, detail="Contact message could not be delivered") from exc
    return DeliveryResponse(accepted=True, message="Contact request accepted for delivery")
