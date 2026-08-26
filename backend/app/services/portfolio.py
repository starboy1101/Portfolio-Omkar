from __future__ import annotations

import copy
import json
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path
from typing import Any, ClassVar

from backend.app.schemas import SourceType


@dataclass(frozen=True, slots=True)
class KnowledgeDocument:
    id: str
    kind: SourceType
    title: str
    text: str
    url: str | None = None


class PortfolioDataError(RuntimeError):
    pass


class PortfolioRepository:
    """Loads and exposes the audited portfolio knowledge source."""

    REQUIRED_KEYS: ClassVar[set[str]] = {
        "profile",
        "experience",
        "education",
        "achievements",
        "skill_categories",
        "projects",
        "certifications",
    }

    def __init__(self, data_path: Path) -> None:
        self.data_path = data_path
        self._data = self._load()
        self._documents = tuple(self._build_documents())

    def _load(self) -> dict[str, Any]:
        try:
            with self.data_path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            raise PortfolioDataError(f"Unable to load portfolio data: {exc}") from exc
        missing = sorted(self.REQUIRED_KEYS.difference(data))
        if missing:
            raise PortfolioDataError(f"Portfolio data is missing keys: {', '.join(missing)}")
        return data

    @property
    def raw(self) -> dict[str, Any]:
        return copy.deepcopy(self._data)

    @property
    def documents(self) -> tuple[KnowledgeDocument, ...]:
        return self._documents

    @property
    def projects(self) -> list[dict[str, Any]]:
        return copy.deepcopy(self._data["projects"])

    @property
    def skill_categories(self) -> list[dict[str, Any]]:
        return copy.deepcopy(self._data["skill_categories"])

    def all_skills(self) -> list[str]:
        names = {
            skill["name"]
            for category in self._data["skill_categories"]
            for skill in category["skills"]
        }
        return sorted(names, key=str.casefold)

    def profile_payload(self, resume_url: str) -> dict[str, Any]:
        return {
            "profile": copy.deepcopy(self._data["profile"]),
            "experience": copy.deepcopy(self._data["experience"]),
            "education": copy.deepcopy(self._data["education"]),
            "achievements": copy.deepcopy(self._data["achievements"]),
            "certifications": copy.deepcopy(self._data["certifications"]),
            "resume_url": resume_url,
        }

    def get_project(self, project_id: str) -> dict[str, Any] | None:
        return next(
            (copy.deepcopy(project) for project in self._data["projects"] if project["id"] == project_id),
            None,
        )

    def _build_documents(self) -> Iterator[KnowledgeDocument]:
        data = self._data
        profile = data["profile"]
        social_text = ", ".join(
            f"{item['label']}: {item['url']}" for item in profile["social_links"]
        )
        yield KnowledgeDocument(
            id=profile["id"],
            kind="profile",
            title=f"About {profile['display_name']}",
            text=(
                f"{profile['summary']} Headline: {profile['headline']}. "
                f"Location: {profile['location']['city']}, {profile['location']['state']}, India."
            ),
            url=profile["portfolio_url"],
        )
        yield KnowledgeDocument(
            id="contact",
            kind="contact",
            title="Contact and professional links",
            text=(
                f"Email: {profile['contact']['email']}. Phone: {profile['contact']['phone_display']}. "
                f"Portfolio: {profile['portfolio_url']}. {social_text}"
            ),
        )
        for item in data["experience"]:
            yield KnowledgeDocument(
                id=item["id"],
                kind="experience",
                title=f"{item['title']} at {item['employer']}",
                text=" ".join(
                    [
                        f"{item['title']} at {item['employer']}, {item['period_label']}, {item['location']} ({item['work_mode']}).",
                        *item["highlights"],
                        f"Technologies: {', '.join(item['technologies'])}.",
                        item.get("status_note", ""),
                    ]
                ).strip(),
            )
        for item in data["education"]:
            yield KnowledgeDocument(
                id=item["id"],
                kind="education",
                title=f"{item['qualification']} — {item['institution']}",
                text=" ".join(
                    part
                    for part in [
                        f"{item['qualification']} at {item['institution']}, {item['location']}, completed {item['completion_year']}, {item['score']}.",
                        item.get("note"),
                    ]
                    if part
                ),
            )
        for category in data["skill_categories"]:
            evidence = "; ".join(
                f"{skill['name']} ({', '.join(skill['evidence'])})" for skill in category["skills"]
            )
            yield KnowledgeDocument(
                id=category["id"],
                kind="skills",
                title=category["label"],
                text=f"Verified skills and evidence: {evidence}.",
            )
        for project in data["projects"]:
            links = ", ".join(f"{name}: {url}" for name, url in project["links"].items())
            aliases = ", ".join(project.get("aliases", []))
            yield KnowledgeDocument(
                id=project["id"],
                kind="project",
                title=project["title"],
                text=" ".join(
                    part
                    for part in [
                        project["short_description"],
                        *project["highlights"],
                        f"Technologies: {', '.join(project['technologies'])}.",
                        f"Categories: {', '.join(project['categories'])}.",
                        f"Also known as: {aliases}." if aliases else None,
                        f"Links: {links}." if links else None,
                        project.get("source_note"),
                    ]
                    if part
                ),
                url=project["links"].get("live") or project["links"].get("github"),
            )
        for item in data["certifications"]:
            yield KnowledgeDocument(
                id=item["id"],
                kind="certification",
                title=item["title"],
                text=(
                    f"{item['title']}, {item['issuer']}, {item['year']}. "
                    f"Verification status: {item['verification_status']}. {item['verification_note']}"
                ),
            )
        for item in data["achievements"]:
            yield KnowledgeDocument(
                id=item["id"],
                kind="achievement",
                title=item["title"],
                text=item["description"],
            )
