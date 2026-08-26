from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

from backend.app.config import Settings, get_settings
from backend.app.services.chat import ChatService
from backend.app.services.email_service import EmailService
from backend.app.services.jd import JobDescriptionAnalyzer
from backend.app.services.llm import LanguageModel, create_language_model
from backend.app.services.portfolio import PortfolioRepository
from backend.app.services.rag import HybridRetriever
from backend.app.services.rate_limit import InMemoryRateLimiter
from backend.app.services.tools import PortfolioToolRegistry


@dataclass(slots=True)
class ServiceContainer:
    settings: Settings
    repository: PortfolioRepository
    retriever: HybridRetriever
    tools: PortfolioToolRegistry
    language_model: LanguageModel
    chat: ChatService
    jd_analyzer: JobDescriptionAnalyzer
    email: EmailService
    rate_limiter: InMemoryRateLimiter


@lru_cache(maxsize=1)
def get_container() -> ServiceContainer:
    settings = get_settings()
    repository = PortfolioRepository(settings.portfolio_data_path)
    retriever = HybridRetriever(repository.documents, settings)
    tools = PortfolioToolRegistry(repository, settings.public_resume_url)
    language_model = create_language_model(settings)
    chat = ChatService(repository, retriever, tools, language_model, settings)
    return ServiceContainer(
        settings=settings,
        repository=repository,
        retriever=retriever,
        tools=tools,
        language_model=language_model,
        chat=chat,
        jd_analyzer=JobDescriptionAnalyzer(repository),
        email=EmailService(settings),
        rate_limiter=InMemoryRateLimiter(),
    )


def reset_dependencies() -> None:
    """Test helper for settings/service cache isolation."""

    get_container.cache_clear()
    get_settings.cache_clear()

