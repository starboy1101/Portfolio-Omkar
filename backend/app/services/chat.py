from __future__ import annotations

import re

from backend.app.config import Settings
from backend.app.schemas import ChatRequest, ChatResponse, SourceReference
from backend.app.services.llm import LanguageModel
from backend.app.services.portfolio import PortfolioRepository
from backend.app.services.rag import HybridRetriever, RetrievedDocument
from backend.app.services.security import (
    SAFE_REFUSAL,
    looks_like_prompt_injection,
    redact_personal_data,
    sanitize_for_prompt,
)
from backend.app.services.tools import PortfolioToolRegistry

UNKNOWN_RESPONSE = (
    "That information isn’t included in Omkar’s audited portfolio. I can tell you about his projects, skills, "
    "experience, education, certifications, resume, or contact details."
)


class ChatService:
    def __init__(
        self,
        repository: PortfolioRepository,
        retriever: HybridRetriever,
        tools: PortfolioToolRegistry,
        language_model: LanguageModel,
        settings: Settings,
    ) -> None:
        self.repository = repository
        self.retriever = retriever
        self.tools = tools
        self.language_model = language_model
        self.settings = settings

    async def answer(self, request: ChatRequest) -> ChatResponse:
        user_history = [item.content for item in request.history if item.role == "user"]
        security_text = "\n".join([*user_history[-self.settings.max_history_messages :], request.message])
        if looks_like_prompt_injection(security_text):
            return ChatResponse(
                message=SAFE_REFUSAL,
                suggestions=["Show Omkar's AI projects", "What Python skills does he have?", "Open his resume"],
                grounded=True,
                fallback_used=True,
            )
        if self._is_unknown_personal_topic(request.message):
            return ChatResponse(
                message=UNKNOWN_RESPONSE,
                suggestions=["Tell me about Omkar", "Show his projects", "How can I contact him?"],
                grounded=True,
                fallback_used=True,
            )

        retrieval_query = self._retrieval_query(request)
        results = self.retriever.search(retrieval_query)
        results = self._prioritize_results(request.message, results)
        actions = self.tools.select_actions(request.message)
        sources = [self._source_reference(result) for result in results[:4]]

        known_intent = self._has_known_intent(request.message)
        reliable = bool(results) and any(result.lexical_score >= 0.12 for result in results[:3])
        if not reliable and not known_intent:
            return ChatResponse(
                message=UNKNOWN_RESPONSE,
                actions=actions,
                suggestions=["Tell me about Omkar", "Show his projects", "How can I contact him?"],
                grounded=True,
                fallback_used=True,
            )

        llm_answer = None
        deterministic_action_types = {"SEND_RESUME_EMAIL", "OPEN_CONTACT"}
        force_deterministic = any(action.type in deterministic_action_types for action in actions)
        if (
            not force_deterministic
            and self.language_model.configured
            and results
        ):
            llm_answer = await self.language_model.generate(self._build_prompt(request, results))
        message = llm_answer or self._template_answer(request, results)
        return ChatResponse(
            message=message,
            sources=sources,
            actions=actions,
            suggestions=self._suggestions(request.message),
            grounded=True,
            fallback_used=llm_answer is None,
        )

    def _retrieval_query(self, request: ChatRequest) -> str:
        history = [item.content for item in request.history if item.role == "user"]
        bounded = history[-min(2, self.settings.max_history_messages) :]
        context = " ".join(request.context.values()) if request.context else ""
        return " ".join([*bounded, context, request.message]).strip()

    def _build_prompt(self, request: ChatRequest, results: list[RetrievedDocument]) -> str:
        context = "\n\n".join(
            redact_personal_data(
                f"[{result.document.kind}:{result.document.id}] {result.document.title}\n{result.document.text}"
            )
            for result in results
        )
        history = "\n".join(
            f"{item.role}: {redact_personal_data(sanitize_for_prompt(item.content, 1000))}"
            for item in request.history[-self.settings.max_history_messages :]
        )
        question = redact_personal_data(sanitize_for_prompt(request.message, self.settings.max_chat_chars))
        return (
            f"AUDITED PORTFOLIO CONTEXT\n{context}\n\n"
            f"BOUNDED CONVERSATION HISTORY\n{history or '(none)'}\n\n"
            f"QUESTION\n{question}\n\n"
            "Answer only from the audited context. If evidence is insufficient, use the portfolio-not-included response."
        )

    def _template_answer(self, request: ChatRequest, results: list[RetrievedDocument]) -> str:
        message = request.message
        folded = message.casefold()
        data = self.repository.raw
        profile = data["profile"]
        if any(phrase in folded for phrase in ("who is", "tell me about", "about omkar", "introduce")):
            return profile["summary"]
        if any(
            phrase in folded
            for phrase in (
                "data analyst role",
                "data analytics role",
                "business intelligence role",
                "analytics role",
            )
        ) and any(phrase in folded for phrase in ("suitable for", "fit for", "good fit", "role")):
            return (
                "Data analytics is Omkar's secondary track. Direct evidence includes a Data Analyst internship plus "
                "Python, SQL, Pandas, DuckDB, Tableau, and Streamlit work in the Flipkart Price Analysis and Supply "
                "Chain and Inventory Analytics projects. Recruiter mode can compare this evidence with the role's "
                "exact requirements without overstating his primary AI/ML experience."
            )
        if any(
            phrase in folded
            for phrase in (
                "suitable for",
                "fit for",
                "good fit",
                "match this role",
                "ai engineer role",
                "python engineer role",
            )
        ):
            return (
                "The audited portfolio provides direct evidence across the AI Chat Application, a fine-tuned "
                "text-to-SQL system, an LLM evaluation and red-teaming framework, and a multimodal classifier, "
                "alongside Python, RAG, FastAPI, and resume-backed software engineering experience. A responsible "
                "role-fit assessment depends on the job's explicit requirements; Recruiter mode compares those "
                "requirements without inferring missing skills."
            )
        if any(term in folded for term in ("guided tour", "portfolio tour", "start tour", "show me around")):
            return (
                "I can guide you through Omkar's introduction, experience, skills, projects, certifications, "
                "resume, and contact section. You can stop the tour at any time."
            )
        if any(term in folded for term in ("contact", "email address", "phone", "reach him", "get in touch")):
            linkedin = next(link["url"] for link in profile["social_links"] if link["id"] == "linkedin")
            github = next(link["url"] for link in profile["social_links"] if link["id"] == "github")
            return (
                f"You can contact Omkar at {profile['contact']['email']} or {profile['contact']['phone_display']}. "
                f"LinkedIn: {linkedin}. GitHub: {github}."
            )
        if "resume" in folded or re.search(r"\bcv\b", folded):
            if any(term in folded for term in ("send", "email", "mail")):
                return "I can help send Omkar’s resume. Enter the recipient email in the secure resume-request flow."
            return (
                "Omkar's role-specific AI/ML and Data Analyst resumes are available in the portfolio. "
                "The AI/ML resume is the primary copy used by the resume action and secure email flow."
            )
        if (
            re.search(r"\b(?:rag|faiss|sentence\s*transformers?)\b", folded)
            and any(
                term in folded
                for term in ("experience", "used", "built", "explain", "einfochips", "vidyarthimitra")
            )
        ):
            current_role = next(
                (item for item in data["experience"] if item["id"] == "einfochips-software-engineer-ai-ml"),
                None,
            )
            project = self.repository.get_project("ai-chat-application")
            if "vidyarthi" in folded and "einfochips" not in folded:
                return (
                    "RAG, FAISS, and Sentence Transformers are not mapped to the Data Analyst internship. "
                    "They are documented in Omkar's current AI/ML engineering role and AI Chat Application project."
                )
            evidence: list[str] = []
            if current_role:
                evidence.append(
                    f"In {current_role['title']} at {current_role['employer']}, "
                    f"{current_role['highlights'][0]} {current_role['highlights'][1]}"
                )
            if project:
                evidence.append(
                    f"The {project['title']} project applies the same stack: "
                    f"{project['highlights'][1]}"
                )
            if evidence:
                return " ".join(evidence)
        if any(term in folded for term in ("experience", "employment", "work history", "worked at")):
            first, second = data["experience"]
            return (
                f"The portfolio lists Omkar as {first['title']} at {first['employer']} from {first['period_label']}. "
                f"A key outcome: {first['highlights'][0]} "
                f"It also lists a {second['title']} role at {second['employer']} from {second['period_label']}. "
                f"That role includes {second['highlights'][0]}"
            )
        if any(term in folded for term in ("education", "degree", "college", "university", "cgpa", "gpa")):
            degree = data["education"][0]
            return (
                f"Omkar’s resume lists a {degree['qualification']} from {degree['institution']} in "
                f"{degree['completion_year']} with {degree['score']}. The updated education section also lists "
                "CBSE Class XII in the Science stream and CBSE Class X at Army Public School."
            )
        if any(
            term in folded
            for term in ("certification", "certificate", "badge", "oracle", "cisco", "ibm", "deloitte", "freecodecamp")
        ):
            names = "; ".join(
                f"{item['title']} ({item['year']})" if item.get("year") else item["title"]
                for item in data["certifications"]
            )
            return f"Omkar's listed certifications are: {names}."
        if any(term in folded for term in ("achievement", "hackmit", "hackathon", "award")):
            return " ".join(item["description"] for item in data["achievements"])

        project_id = self._resolved_project(request)
        if project_id:
            project = self.repository.get_project(project_id)
            if project:
                return (
                    f"{project['title']}: {project['short_description']} "
                    f"Key evidence: {' '.join(project['highlights'])} "
                    f"Technologies: {', '.join(project['technologies'])}."
                )
        if "project" in folded:
            category = self.tools.mentioned_project_category(message)
            if category:
                matching = [item for item in data["projects"] if category in item["categories"]]
                if matching:
                    projects = "; ".join(
                        f"{item['title']} — {item['short_description']}" for item in matching
                    )
                    return f"Projects with verified {category} evidence: {projects}"
            projects = "; ".join(f"{item['title']} — {item['short_description']}" for item in data["projects"])
            return f"Omkar’s audited portfolio includes: {projects}"

        mentioned_skills = self.tools.mentioned_skills(message)
        if mentioned_skills:
            evidence_lines: list[str] = []
            for category in data["skill_categories"]:
                for skill in category["skills"]:
                    if skill["name"] in mentioned_skills:
                        references: list[str] = []
                        specific = [item for item in skill["evidence"] if not item.startswith("resume:")]
                        for reference in specific or skill["evidence"]:
                            kind, _, reference_id = reference.partition(":")
                            if kind == "project":
                                project = self.repository.get_project(reference_id)
                                if project:
                                    references.append(
                                        f"{project['title']}, where {project['highlights'][0].lower()}"
                                    )
                            elif kind == "experience":
                                experience = next(
                                    (item for item in data["experience"] if item["id"] == reference_id),
                                    None,
                                )
                                if experience:
                                    references.append(
                                        f"{experience['title']} at {experience['employer']}, where "
                                        f"{experience['highlights'][0].lower()}"
                                    )
                            elif kind == "resume":
                                references.append(
                                    "the supplied technical-skills list; no specific project is mapped yet"
                                )
                        evidence_lines.append(f"{skill['name']}: {'; '.join(references[:3])}")
            return "Verified portfolio evidence: " + "; ".join(evidence_lines[:6]) + "."
        if "skill" in folded or "technology" in folded or "tech stack" in folded:
            categories = "; ".join(
                f"{category['label']}: {', '.join(skill['name'] for skill in category['skills'])}"
                for category in data["skill_categories"]
            )
            return f"Omkar’s evidence-linked skills are organized as follows: {categories}."

        if results:
            top = results[0].document
            return f"Based on the audited portfolio, {top.title}: {top.text}"
        return UNKNOWN_RESPONSE

    def _resolved_project(self, request: ChatRequest) -> str | None:
        explicit = self.tools.mentioned_project(request.message)
        if explicit:
            return explicit
        if request.context:
            context_project = request.context.get("projectId") or request.context.get("project_id")
            if context_project and self.repository.get_project(context_project):
                return context_project
        for item in reversed(request.history[-self.settings.max_history_messages :]):
            candidate = self.tools.mentioned_project(item.content)
            if candidate:
                return candidate
        return None

    @staticmethod
    def _source_reference(result: RetrievedDocument) -> SourceReference:
        snippet = result.document.text
        if len(snippet) > 240:
            snippet = snippet[:237].rstrip() + "…"
        return SourceReference(
            type=result.document.kind,
            id=result.document.id,
            title=result.document.title,
            snippet=snippet,
            url=result.document.url,
            score=round(result.score, 4),
        )

    def _prioritize_results(
        self,
        message: str,
        results: list[RetrievedDocument],
    ) -> list[RetrievedDocument]:
        project_id = self.tools.mentioned_project(message)
        category = self.tools.mentioned_project_category(message) if "project" in message.casefold() else None
        category_ids = {
            project["id"]
            for project in self.repository.projects
            if category and category in project["categories"]
        }
        required_ids = {project_id} if project_id else set()
        required_ids.update(category_ids)
        present_ids = {result.document.id for result in results}
        for document in self.repository.documents:
            if document.id in required_ids and document.id not in present_ids:
                results.append(
                    RetrievedDocument(
                        document=document,
                        score=0.0,
                        lexical_score=0.0,
                    )
                )

        def priority(result: RetrievedDocument) -> tuple[int, float, str]:
            if project_id and result.document.id == project_id:
                rank = 0
            elif category_ids and result.document.id in category_ids:
                rank = 1
            else:
                rank = 2
            return (rank, -result.score, result.document.id)

        return sorted(results, key=priority)

    @staticmethod
    def _has_known_intent(message: str) -> bool:
        folded = message.casefold()
        return any(
            term in folded
            for term in (
                "who is omkar",
                "tell me about omkar",
                "introduce omkar",
                "project",
                "skill",
                "experience",
                "education",
                "resume",
                "contact",
                "github",
                "linkedin",
                "certif",
                "hackmit",
                "job description",
                "suitable for",
                "fit for",
                "good fit",
                "ai engineer role",
                "python engineer role",
                "data analyst role",
                "data analytics role",
                "business intelligence role",
                "guided tour",
                "portfolio tour",
                "start tour",
                "show me around",
            )
        )

    @staticmethod
    def _is_unknown_personal_topic(message: str) -> bool:
        folded = " ".join(message.casefold().split())
        return any(
            phrase in folded
            for phrase in (
                "favorite ",
                "favourite ",
                "favorite food",
                "favourite food",
                "favorite color",
                "favourite colour",
                "date of birth",
                "birthday",
                "how old",
                "his age",
                "salary",
                "compensation",
                "marital status",
                "relationship status",
                "religion",
                "caste",
                "political view",
                "home address",
                "family details",
                "languages does he speak",
                "language does he speak",
                "spoken languages",
                "his hobbies",
            )
        )

    @staticmethod
    def _suggestions(message: str) -> list[str]:
        folded = message.casefold()
        if "rag" in folded or "ai chat" in folded:
            return ["Explain the AI Chat architecture", "Which Python tools did he use?", "Open the AI Chat project"]
        if "experience" in folded:
            return ["What did he build with C++?", "Tell me about his internship", "Show his resume"]
        if "project" in folded:
            return ["Which project best shows Python?", "Show his data analytics projects", "Explain his RAG project"]
        return ["What AI/ML projects has he built?", "Show his data analytics projects", "How can I contact him?"]
