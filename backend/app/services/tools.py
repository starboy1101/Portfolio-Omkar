from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from backend.app.schemas import PortfolioAction
from backend.app.services.portfolio import PortfolioRepository


@dataclass(frozen=True, slots=True)
class ToolDefinition:
    name: str
    description: str
    handler: Callable[..., Any]


class PortfolioToolRegistry:
    """Allowlisted, deterministic portfolio tools; no model-generated code is executed."""

    def __init__(self, repository: PortfolioRepository, public_resume_url: str) -> None:
        self.repository = repository
        self.public_resume_url = public_resume_url
        self.tools = {
            "get_profile": ToolDefinition("get_profile", "Return audited profile data", self.get_profile),
            "get_skills": ToolDefinition("get_skills", "Return evidence-linked skills", self.get_skills),
            "get_projects": ToolDefinition("get_projects", "Return portfolio projects", self.get_projects),
            "get_project_details": ToolDefinition(
                "get_project_details", "Return one allowlisted project", self.get_project_details
            ),
            "get_experience": ToolDefinition("get_experience", "Return supplied professional experience", self.get_experience),
            "get_certifications": ToolDefinition(
                "get_certifications", "Return listed certification records", self.get_certifications
            ),
            "get_contact_information": ToolDefinition(
                "get_contact_information", "Return public contact details", self.get_contact_information
            ),
        }
        self._project_aliases = self._build_project_aliases()

    def execute(self, tool_name: str, **arguments: Any) -> Any:
        definition = self.tools.get(tool_name)
        if definition is None:
            raise ValueError(f"Unknown portfolio tool: {tool_name}")
        return definition.handler(**arguments)

    def get_profile(self) -> dict[str, Any]:
        return self.repository.profile_payload(self.public_resume_url)

    def get_skills(self) -> list[dict[str, Any]]:
        return self.repository.skill_categories

    def get_projects(self) -> list[dict[str, Any]]:
        return self.repository.projects

    def get_project_details(self, project_id: str) -> dict[str, Any] | None:
        return self.repository.get_project(project_id)

    def get_experience(self) -> list[dict[str, Any]]:
        return self.repository.raw["experience"]

    def get_certifications(self) -> list[dict[str, Any]]:
        return self.repository.raw["certifications"]

    def get_contact_information(self) -> dict[str, Any]:
        profile = self.repository.raw["profile"]
        return {
            "contact": profile["contact"],
            "social_links": profile["social_links"],
            "portfolio_url": profile["portfolio_url"],
        }

    def _build_project_aliases(self) -> dict[str, str]:
        aliases: dict[str, str] = {}
        for project in self.repository.projects:
            candidates = [project["id"], project["title"], *project.get("aliases", [])]
            for candidate in candidates:
                aliases[candidate.casefold()] = project["id"]
            if project["id"] == "ai-chat-application":
                aliases.update({"rag project": project["id"], "ai chat": project["id"], "swar ai": project["id"]})
            if project["id"] == "rideasy-bike-booking":
                aliases.update({"rideasy": project["id"], "bike booking": project["id"]})
            if project["id"] == "loan-onboarding-system":
                aliases["loan onboarding"] = project["id"]
            if project["id"] == "weather-dashboard":
                aliases["weather app"] = project["id"]
            if project["id"] == "llm-powered-sql-query-generator":
                aliases.update({"sql generator": project["id"], "text-to-sql": project["id"], "text to sql": project["id"]})
            if project["id"] == "llm-evaluation-red-teaming-framework":
                aliases.update({"llm evaluation": project["id"], "red-teaming framework": project["id"], "red teaming framework": project["id"]})
            if project["id"] == "multimodal-image-text-classifier":
                aliases.update({"multimodal classifier": project["id"], "image text classifier": project["id"], "computer vision project": project["id"]})
            if project["id"] == "flipkart-price-analysis":
                aliases.update({"flipkart analysis": project["id"], "price analysis": project["id"]})
            if project["id"] == "supply-chain-inventory-analytics":
                aliases.update({"supply chain analytics": project["id"], "inventory analytics": project["id"]})
        return aliases

    def mentioned_project(self, message: str) -> str | None:
        folded = message.casefold()
        matches = [
            (len(alias), project_id)
            for alias, project_id in self._project_aliases.items()
            if alias in folded and not (alias.endswith("project") and f"{alias}s" in folded)
        ]
        return max(matches, default=(0, None))[1]

    def mentioned_skills(self, message: str) -> list[str]:
        folded = message.casefold()
        matches: list[str] = []
        for skill in sorted(self.repository.all_skills(), key=len, reverse=True):
            token = skill.casefold()
            if token in {"c++", "jwt"}:
                found = token in folded
            else:
                found = bool(re.search(rf"(?<![\w]){re.escape(token)}(?![\w])", folded))
            if found:
                matches.append(skill)
        return matches

    @staticmethod
    def mentioned_project_category(message: str) -> str | None:
        folded = message.casefold()
        category_aliases = {
            "generative ai": "Generative AI",
            "full stack": "Full Stack",
            "frontend": "Frontend",
            "backend": "Backend",
            "ai/ml": "AI/ML",
            "ai ml": "AI/ML",
            "rag": "RAG",
            "python": "Python",
            "data analyst": "Data Analytics",
            "data analytics": "Data Analytics",
            "analytics": "Data Analytics",
            "business intelligence": "Business Intelligence",
            "computer vision": "Computer Vision",
            "llm evaluation": "LLM Evaluation",
            "nlp": "NLP",
            "sql": "SQL",
        }
        return next((value for alias, value in category_aliases.items() if alias in folded), None)

    def select_actions(self, message: str) -> list[PortfolioAction]:
        folded = " ".join(message.casefold().split())
        actions: list[PortfolioAction] = []

        if "resume" in folded or "cv" in folded:
            if any(word in folded for word in ("email", "send", "mail")):
                actions.append(PortfolioAction(type="SEND_RESUME_EMAIL", target="resume", label="Email resume"))
            elif "download" in folded:
                actions.append(
                    PortfolioAction(
                        type="DOWNLOAD_RESUME",
                        target="resume",
                        label="Download resume",
                        url=self.public_resume_url,
                    )
                )
            else:
                actions.append(
                    PortfolioAction(type="OPEN_RESUME", target="resume", label="View resume", url=self.public_resume_url)
                )

        if "linkedin" in folded:
            url = next(
                link["url"]
                for link in self.repository.raw["profile"]["social_links"]
                if link["id"] == "linkedin"
            )
            actions.append(PortfolioAction(type="OPEN_LINKEDIN", target="linkedin", label="Open LinkedIn", url=url))
        if "github" in folded and not self.mentioned_project(message):
            url = next(
                link["url"]
                for link in self.repository.raw["profile"]["social_links"]
                if link["id"] == "github"
            )
            actions.append(PortfolioAction(type="OPEN_GITHUB", target="github", label="Open GitHub", url=url))
        if any(term in folded for term in ("contact", "get in touch", "reach him", "email address", "phone")):
            actions.append(PortfolioAction(type="OPEN_CONTACT", target="contact", label="Open contact"))
        if any(
            term in folded
            for term in ("certification", "certifications", "certificate", "badges", "oracle", "cisco", "ibm")
        ):
            actions.append(
                PortfolioAction(type="SHOW_CERTIFICATIONS", target="certifications", label="Show certifications")
            )
        if any(
            term in folded
            for term in (
                "job description",
                "match this job",
                "fit this role",
                "suitable for",
                "fit for this",
                "good fit",
            )
        ):
            actions.append(PortfolioAction(type="ANALYZE_JD", target="recruiter", label="Analyze job description"))
        if any(term in folded for term in ("guided tour", "portfolio tour", "start tour", "show me around")):
            actions.append(PortfolioAction(type="START_TOUR", target="home", label="Start guided tour"))

        project_id = self.mentioned_project(message)
        if (
            not project_id
            and re.search(r"\b(?:rag|faiss|sentence\s*transformers?)\b", folded)
            and any(term in folded for term in ("experience", "used", "built", "explain"))
            and not any(term in folded for term in ("einfochips", "vidyarthimitra"))
        ):
            project_id = "ai-chat-application"
        if project_id:
            project = self.repository.get_project(project_id)
            actions.append(
                PortfolioAction(
                    type="OPEN_PROJECT",
                    target=project_id,
                    label=f"Open {project['title']}" if project else "Open project",
                )
            )
        elif "project" in folded:
            category = self.mentioned_project_category(message)
            if category:
                actions.append(
                    PortfolioAction(
                        type="FILTER_PROJECTS",
                        target=category,
                        label=f"Show {category} projects",
                        payload={"category": category},
                    )
                )
            elif any(term in folded for term in ("show", "open", "view", "take me", "navigate")):
                actions.append(PortfolioAction(type="NAVIGATE", target="projects", label="Show projects"))

        if not project_id and any(
            term in folded for term in ("experience", "employment", "work history", "worked at")
        ):
            actions.append(PortfolioAction(type="SHOW_EXPERIENCE", target="experience", label="Show experience"))

        skills = self.mentioned_skills(message)
        if skills and not project_id and "project" not in folded:
            actions.append(
                PortfolioAction(
                    type="HIGHLIGHT_SKILL",
                    target=skills[0],
                    label=f"Highlight {skills[0]}",
                    payload={"skills": skills[:4]},
                )
            )
        elif "skills" in folded and any(term in folded for term in ("show", "open", "view", "navigate")):
            actions.append(PortfolioAction(type="NAVIGATE", target="skills", label="Show skills"))

        unique: list[PortfolioAction] = []
        seen: set[tuple[str, str | None]] = set()
        for action in actions:
            key = (action.type, action.target)
            if key not in seen:
                seen.add(key)
                unique.append(action)
        return unique[:3]
