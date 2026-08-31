from __future__ import annotations

import re
from dataclasses import dataclass

from backend.app.schemas import JobMatchResponse, MatchEvidence
from backend.app.services.portfolio import PortfolioRepository


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9+]", "", value.casefold().replace("c++", "cplusplus"))


@dataclass(frozen=True, slots=True)
class Requirement:
    name: str
    patterns: tuple[str, ...]


REQUIREMENTS = (
    Requirement("Python", (r"\bpython\b",)),
    Requirement("FastAPI", (r"\bfastapi\b",)),
    Requirement("Django", (r"\bdjango\b",)),
    Requirement("Flask", (r"\bflask\b",)),
    Requirement("C++", (r"\bc\+\+\b", r"\bcpp\b")),
    Requirement("Java", (r"\bjava\b(?!script)",)),
    Requirement("JavaScript", (r"\bjavascript\b", r"\bjs\b")),
    Requirement("TypeScript", (r"\btypescript\b", r"\bts\b")),
    Requirement("React", (r"\breact(?:\.js)?\b",)),
    Requirement("Node.js", (r"\bnode(?:\.js)?\b",)),
    Requirement("REST APIs", (r"\brest(?:ful)?\s+apis?\b", r"\brest\b")),
    Requirement("WebSockets", (r"\bwebsockets?\b", r"\bsse\b")),
    Requirement("SQL", (r"\bsql\b",)),
    Requirement("Advanced SQL", (r"advanced sql",)),
    Requirement("DuckDB", (r"\bduckdb\b",)),
    Requirement("Common Table Expressions (CTEs)", (r"\bctes?\b", r"common table expressions?")),
    Requirement("Window Functions", (r"window functions?",)),
    Requirement("PostgreSQL", (r"\bpostgres(?:ql)?\b",)),
    Requirement("MySQL", (r"\bmysql\b",)),
    Requirement("MongoDB", (r"\bmongodb\b",)),
    Requirement("ChromaDB", (r"\bchromadb\b",)),
    Requirement("Supabase", (r"\bsupabase\b",)),
    Requirement("RAG", (r"\brag\b", r"retrieval[- ]augmented generation")),
    Requirement("FAISS", (r"\bfaiss\b",)),
    Requirement("SentenceTransformers", (r"\bsentence\s*transformers?\b",)),
    Requirement("LangChain", (r"\blangchain\b",)),
    Requirement("Llama", (r"\bllama\b",)),
    Requirement("NLP", (r"\bnlp\b", r"natural language processing")),
    Requirement("Generative AI", (r"generative ai", r"\bgenai\b", r"\bllms?\b")),
    Requirement("Machine Learning", (r"machine learning", r"\bml\b")),
    Requirement("Deep Learning", (r"deep learning",)),
    Requirement("PyTorch", (r"\bpytorch\b",)),
    Requirement("TensorFlow", (r"\btensorflow\b",)),
    Requirement("OpenCV", (r"\bopencv\b",)),
    Requirement("CLIP", (r"\bclip\b",)),
    Requirement("QLoRA", (r"\bqlora\b",)),
    Requirement("Text-to-SQL", (r"text[- ]to[- ]sql",)),
    Requirement("LLM Evaluation", (r"llm evaluation",)),
    Requirement("DeepEval", (r"\bdeepeval\b",)),
    Requirement("LangSmith", (r"\blangsmith\b",)),
    Requirement("AWS", (r"\baws\b", r"amazon web services")),
    Requirement("Azure", (r"\bazure\b",)),
    Requirement("Google Cloud", (r"google cloud", r"\bgcp\b")),
    Requirement("Docker", (r"\bdocker\b",)),
    Requirement("Kubernetes", (r"\bkubernetes\b", r"\bk8s\b")),
    Requirement("Git", (r"\bgit\b", r"\bgithub\b")),
    Requirement("CI/CD", (r"\bci\s*/?\s*cd\b", r"continuous integration")),
    Requirement("Redis", (r"\bredis\b",)),
    Requirement("Celery", (r"\bcelery\b",)),
    Requirement("Linux", (r"\blinux\b",)),
    Requirement("Tableau", (r"\btableau\b",)),
    Requirement("Pandas", (r"\bpandas\b",)),
    Requirement("Power BI", (r"\bpower\s*bi\b",)),
    Requirement("Streamlit", (r"\bstreamlit\b",)),
    Requirement("Advanced Excel", (r"\bexcel\b",)),
    Requirement("Exploratory Data Analysis (EDA)", (r"exploratory data analysis", r"\beda\b")),
    Requirement("Statistical Analysis", (r"statistical analysis",)),
    Requirement("Data Analytics", (r"data analytics", r"data analyst")),
    Requirement("Business Intelligence", (r"business intelligence", r"\bbi\b")),
    Requirement("MFC", (r"\bmfc\b",)),
    Requirement("WASAPI", (r"\bwasapi\b",)),
)


PARTIAL_EQUIVALENCE = {
    "Flask": ("Python", "FastAPI", "Django"),
    "SQL": ("PostgreSQL", "MySQL"),
    "LangChain": ("RAG", "FAISS", "SentenceTransformers"),
    "Machine Learning": ("NLP", "RAG", "FAISS", "SentenceTransformers"),
    "Deep Learning": ("NLP", "Llama", "GPT-3"),
    "PyTorch": ("Machine Learning", "NLP"),
    "TensorFlow": ("Machine Learning", "NLP"),
    "AWS": ("Google Cloud Storage",),
    "Azure": ("Google Cloud Storage",),
    "Git": ("Netlify CI/CD",),
}


class JobDescriptionAnalyzer:
    """Transparent keyword/evidence matcher; it never infers missing experience."""

    def __init__(self, repository: PortfolioRepository) -> None:
        self.repository = repository
        self.data = repository.raw
        self._evidence = self._build_evidence()

    def _build_evidence(self) -> dict[str, list[tuple[str, str]]]:
        evidence: dict[str, list[tuple[str, str]]] = {}

        def add(term: str, source_id: str, description: str) -> None:
            evidence.setdefault(normalize(term), []).append((source_id, description))

        for category in self.data["skill_categories"]:
            for skill in category["skills"]:
                for source in skill["evidence"]:
                    add(skill["name"], source, f"{skill['name']} is listed with evidence {source}.")
        for project in self.data["projects"]:
            for technology in project["technologies"]:
                add(technology, f"project:{project['id']}", f"{project['title']} uses {technology}.")
            for category in project["categories"]:
                add(category, f"project:{project['id']}", f"{project['title']} is categorized as {category}.")
        for item in self.data["experience"]:
            for technology in item["technologies"]:
                add(technology, f"experience:{item['id']}", f"{item['title']} work lists {technology}.")
        return evidence

    @staticmethod
    def _detect_requirements(description: str) -> list[str]:
        return [
            requirement.name
            for requirement in REQUIREMENTS
            if any(re.search(pattern, description, re.IGNORECASE) for pattern in requirement.patterns)
        ]

    def _direct_evidence(self, requirement: str) -> list[tuple[str, str]]:
        key = normalize(requirement)
        results = list(self._evidence.get(key, []))
        if requirement == "React":
            results.extend(self._evidence.get(normalize("React.js"), []))
        if requirement == "WebSockets":
            results.extend(self._evidence.get(normalize("WebSocket/SSE"), []))
        if requirement == "Google Cloud":
            results.extend(self._evidence.get(normalize("Google Cloud Storage"), []))
        if requirement == "CI/CD":
            results.extend(self._evidence.get(normalize("Netlify CI/CD"), []))
        if requirement == "Generative AI":
            for related in ("RAG", "Llama", "GPT-3", "Gemini Pro"):
                results.extend(self._evidence.get(normalize(related), []))
        return list(dict.fromkeys(results))

    def analyze(self, description: str) -> JobMatchResponse:
        requirements = self._detect_requirements(description)
        strong: list[MatchEvidence] = []
        partial: list[MatchEvidence] = []
        missing: list[str] = []

        for requirement in requirements:
            direct = self._direct_evidence(requirement)
            if direct:
                strong.append(
                    MatchEvidence(
                        requirement=requirement,
                        evidence=[item[1] for item in direct[:3]],
                        source_ids=[item[0] for item in direct[:3]],
                    )
                )
                continue
            related_evidence: list[tuple[str, str]] = []
            for related in PARTIAL_EQUIVALENCE.get(requirement, ()):
                related_evidence.extend(self._direct_evidence(related))
            if related_evidence:
                partial.append(
                    MatchEvidence(
                        requirement=requirement,
                        evidence=[f"Adjacent evidence only: {item[1]}" for item in related_evidence[:3]],
                        source_ids=[item[0] for item in related_evidence[:3]],
                    )
                )
            else:
                missing.append(requirement)

        denominator = len(requirements)
        score = round((len(strong) + 0.5 * len(partial)) / denominator * 100) if denominator else 0
        project_counts: dict[str, int] = {}
        for match in [*strong, *partial]:
            for source_id in match.source_ids:
                if source_id.startswith("project:"):
                    project_id = source_id.split(":", 1)[1]
                    project_counts[project_id] = project_counts.get(project_id, 0) + 1
        project_titles = {project["id"]: project["title"] for project in self.data["projects"]}
        relevant_projects = [
            project_titles[project_id]
            for project_id, _ in sorted(project_counts.items(), key=lambda item: (-item[1], item[0]))
            if project_id in project_titles
        ][:4]

        if not requirements:
            summary = (
                "No supported technical requirements were detected. Add a fuller job description with explicit "
                "technologies to receive an evidence-based comparison."
            )
        else:
            summary = (
                f"Matched {len(strong)} of {denominator} detected technical requirements directly, "
                f"with {len(partial)} adjacent matches. Skills listed as not found are not present in the audited data."
            )
        return JobMatchResponse(
            overall_match=score,
            strong_matches=strong,
            partial_matches=partial,
            not_found=missing,
            relevant_projects=relevant_projects,
            summary=summary,
            methodology=(
                "Deterministic keyword matching against audited resume and portfolio evidence; direct matches score "
                "1, adjacent technologies score 0.5, and absent technologies score 0. This is not a hiring decision."
            ),
        )
