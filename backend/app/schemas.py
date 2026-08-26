from __future__ import annotations

import re
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
    r"(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+"
    r"[A-Za-z]{2,63}$"
)


def validate_email_address(value: str) -> str:
    cleaned = value.strip()
    if len(cleaned) > 254 or not EMAIL_PATTERN.fullmatch(cleaned):
        raise ValueError("Enter a valid email address")
    local, domain = cleaned.rsplit("@", 1)
    return f"{local}@{domain.lower()}"


def to_camel(value: str) -> str:
    head, *tail = value.split("_")
    return head + "".join(part.capitalize() for part in tail)


class StrictModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class HistoryMessage(StrictModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1500)


class ChatRequest(StrictModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[HistoryMessage] = Field(default_factory=list, max_length=12)
    session_id: str | None = Field(default=None, max_length=100, pattern=r"^[A-Za-z0-9_.:-]+$")
    context: dict[str, str] | None = Field(default=None, max_length=8)


ActionType = Literal[
    "NAVIGATE",
    "OPEN_PROJECT",
    "OPEN_RESUME",
    "DOWNLOAD_RESUME",
    "OPEN_GITHUB",
    "OPEN_LINKEDIN",
    "OPEN_CONTACT",
    "FILTER_PROJECTS",
    "HIGHLIGHT_SKILL",
    "SEND_RESUME_EMAIL",
    "SHOW_EXPERIENCE",
    "SHOW_CERTIFICATIONS",
    "ANALYZE_JD",
    "START_TOUR",
]

SourceType = Literal[
    "profile",
    "experience",
    "education",
    "skills",
    "project",
    "certification",
    "achievement",
    "contact",
]
RagBackend = Literal["uninitialized", "lexical", "hybrid"]


class PortfolioAction(StrictModel):
    type: ActionType
    target: str | None = None
    label: str | None = None
    url: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class SourceReference(StrictModel):
    type: SourceType
    id: str
    title: str
    snippet: str | None = None
    url: str | None = None
    score: float | None = Field(default=None, ge=0, le=1)


class ChatResponse(StrictModel):
    message: str
    sources: list[SourceReference] = Field(default_factory=list)
    actions: list[PortfolioAction] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    grounded: bool = True
    fallback_used: bool = True


class JobDescriptionRequest(StrictModel):
    job_description: str = Field(min_length=20, max_length=12000)


class MatchEvidence(StrictModel):
    requirement: str
    evidence: list[str] = Field(default_factory=list)
    source_ids: list[str] = Field(default_factory=list)


class JobMatchResponse(StrictModel):
    overall_match: int = Field(ge=0, le=100)
    strong_matches: list[MatchEvidence]
    partial_matches: list[MatchEvidence]
    not_found: list[str]
    relevant_projects: list[str]
    summary: str
    methodology: str


class ResumeEmailRequest(StrictModel):
    recipient_email: str = Field(min_length=3, max_length=254)
    recipient_name: str | None = Field(default=None, max_length=100)
    company: str | None = Field(default=None, max_length=120)
    website: str = Field(default="", max_length=200, description="Honeypot; leave blank")

    @field_validator("recipient_email")
    @classmethod
    def validate_recipient_email(cls, value: str) -> str:
        return validate_email_address(value)


class ContactRequest(StrictModel):
    name: str = Field(min_length=2, max_length=100)
    company: str | None = Field(default=None, max_length=120)
    email: str = Field(min_length=3, max_length=254)
    role: str | None = Field(default=None, max_length=120)
    subject: str | None = Field(default=None, max_length=160)
    message: str = Field(min_length=10, max_length=3000)
    website: str = Field(default="", max_length=200, description="Honeypot; leave blank")

    @field_validator("email")
    @classmethod
    def validate_contact_email(cls, value: str) -> str:
        return validate_email_address(value)


class DeliveryResponse(StrictModel):
    accepted: bool
    message: str


class HealthResponse(StrictModel):
    status: Literal["ok", "degraded"]
    version: str
    rag_backend: RagBackend
    llm_provider: str
    llm_configured: bool
    email_configured: bool


class ReadyResponse(StrictModel):
    ready: bool
    checks: dict[str, bool]


class ProfileResponse(StrictModel):
    profile: dict[str, Any]
    experience: list[dict[str, Any]]
    education: list[dict[str, Any]]
    achievements: list[dict[str, Any]]
    certifications: list[dict[str, Any]]
    resume_url: str


class ProjectsResponse(StrictModel):
    items: list[dict[str, Any]]


class SkillsResponse(StrictModel):
    categories: list[dict[str, Any]]
    all: list[str]
