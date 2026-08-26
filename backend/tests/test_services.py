from __future__ import annotations

import asyncio

from backend.app.schemas import ChatRequest
from backend.app.services.chat import ChatService
from backend.app.services.jd import JobDescriptionAnalyzer
from backend.app.services.rag import HybridRetriever


def test_lexical_retrieval_finds_rag_project(services):
    retriever = HybridRetriever(services.repository.documents, services.settings)
    retriever.build()
    results = retriever.search("FAISS SentenceTransformers retrieval augmented generation")
    assert results
    assert results[0].document.id == "ai-chat-application"
    assert results[0].lexical_score > 0


def test_registry_rejects_unknown_tool(services):
    try:
        services.tools.execute("run_python", code="print('unsafe')")
    except ValueError as exc:
        assert "Unknown portfolio tool" in str(exc)
    else:
        raise AssertionError("Unknown tool must be rejected")


def test_jd_with_no_detected_technology_does_not_invent_match(services):
    analyzer = JobDescriptionAnalyzer(services.repository)
    result = analyzer.analyze("We are seeking a thoughtful colleague with excellent communication habits.")
    assert result.overall_match == 0
    assert result.strong_matches == []
    assert "No supported technical requirements" in result.summary


def test_certification_documents_match_the_supplied_list_without_warning_copy(services):
    documents = [doc for doc in services.repository.documents if doc.kind == "certification"]
    assert len(documents) == 10
    assert any(doc.title == "Python Essentials 2" for doc in documents)
    assert all("recipient-bearing credential" not in doc.text for doc in documents)


def test_optional_llm_prompt_redacts_email_and_phone(services):
    class SpyModel:
        provider_name = "hf_gradio_zerogpu"
        configured = True

        def __init__(self):
            self.prompt = ""

        async def generate(self, prompt: str):
            self.prompt = prompt
            return "Grounded answer"

    model = SpyModel()
    service = ChatService(
        services.repository,
        services.retriever,
        services.tools,
        model,
        services.settings,
    )
    response = asyncio.run(
        service.answer(
            ChatRequest(
                message="Explain Python to recruiter@example.com at +91 98765 43210",
                history=[{"role": "user", "content": "My email is private@example.com"}],
            )
        )
    )
    assert response.message == "Grounded answer"
    assert "recruiter@example.com" not in model.prompt
    assert "private@example.com" not in model.prompt
    assert "98765" not in model.prompt
    assert "[email redacted]" in model.prompt
