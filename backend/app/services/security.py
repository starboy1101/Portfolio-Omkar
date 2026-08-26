from __future__ import annotations

import re

INJECTION_PATTERNS = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"\bignore\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|above)\s+(?:instructions?|prompts?|rules?)\b",
        r"\b(?:reveal|show|print|repeat|leak|expose)\b.{0,50}\b(?:system|developer|hidden|internal)\s+(?:prompt|instructions?|message|rules?)\b",
        r"\b(?:environment\s+variables?|env\s+vars?|api\s*keys?|smtp\s+password|access\s+tokens?|secrets?)\b",
        r"\b(?:act|behave|respond)\s+as\s+(?:the\s+)?(?:system|developer|root|admin)\b",
        r"\b(?:override|bypass|disable)\b.{0,40}\b(?:safety|security|guardrails?|instructions?)\b",
        r"\bprompt\s+injection\b.{0,40}\b(?:succeed|execute|follow|test)\b",
    )
)

SAFE_REFUSAL = (
    "I can’t reveal hidden instructions, credentials, environment variables, or internal configuration. "
    "I can help with Omkar’s verified skills, experience, projects, education, certifications, resume, or contact details."
)
EMAIL_PATTERN = re.compile(r"(?<![\w.+-])[\w.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}")
PHONE_PATTERN = re.compile(r"(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)(?!\w)")


def looks_like_prompt_injection(text: str) -> bool:
    compact = " ".join(text.split())
    return any(pattern.search(compact) for pattern in INJECTION_PATTERNS)


def sanitize_for_prompt(text: str, maximum: int) -> str:
    """Remove control characters and bound untrusted text before prompt assembly."""

    cleaned = "".join(character for character in text if character in "\n\t" or ord(character) >= 32)
    return cleaned.strip()[:maximum]


def redact_personal_data(text: str) -> str:
    """Keep lead/contact data out of remote model prompts."""

    redacted = EMAIL_PATTERN.sub("[email redacted]", text)
    return PHONE_PATTERN.sub("[phone redacted]", redacted)


def honeypot_triggered(value: str | None) -> bool:
    return bool(value and value.strip())
