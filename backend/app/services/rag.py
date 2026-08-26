from __future__ import annotations

import logging
import math
import re
from collections import Counter
from dataclasses import dataclass
from threading import RLock
from typing import Any

from backend.app.config import Settings
from backend.app.schemas import RagBackend
from backend.app.services.portfolio import KnowledgeDocument

LOGGER = logging.getLogger(__name__)
TOKEN_PATTERN = re.compile(r"[a-z0-9][a-z0-9+#.-]*", re.IGNORECASE)
ALIASES = {
    "rag": ("retrieval", "augmented", "generation"),
    "genai": ("generative", "ai"),
    "llm": ("language", "model"),
    "ml": ("machine", "learning"),
    "mern": ("mongodb", "expressjs", "reactjs", "nodejs"),
    "resume": ("education", "experience", "skills"),
    "cv": ("resume",),
}


def tokenize(text: str) -> list[str]:
    normalized = (
        text.casefold()
        .replace("node.js", "nodejs")
        .replace("react.js", "reactjs")
        .replace("express.js", "expressjs")
        .replace("c++", "cpp")
        .replace("retrieval-augmented", "retrieval augmented")
    )
    tokens = TOKEN_PATTERN.findall(normalized)
    expanded = list(tokens)
    for token in tokens:
        expanded.extend(ALIASES.get(token, ()))
    return expanded


@dataclass(frozen=True, slots=True)
class RetrievedDocument:
    document: KnowledgeDocument
    score: float
    lexical_score: float
    semantic_score: float | None = None


class LexicalIndex:
    """Small deterministic BM25-like index used alone or in hybrid retrieval."""

    def __init__(self, documents: tuple[KnowledgeDocument, ...]) -> None:
        self.documents = documents
        self._term_frequencies = [Counter(tokenize(f"{doc.title} {doc.text}")) for doc in documents]
        self._lengths = [sum(frequencies.values()) for frequencies in self._term_frequencies]
        self._average_length = sum(self._lengths) / max(len(self._lengths), 1)
        document_frequency: Counter[str] = Counter()
        for frequencies in self._term_frequencies:
            document_frequency.update(frequencies.keys())
        total = len(documents)
        self._idf = {
            term: math.log(1 + (total - frequency + 0.5) / (frequency + 0.5))
            for term, frequency in document_frequency.items()
        }

    def score(self, query: str) -> list[float]:
        query_terms = Counter(tokenize(query))
        if not query_terms:
            return [0.0] * len(self.documents)
        raw_scores: list[float] = []
        k1, b = 1.4, 0.72
        query_folded = query.casefold().strip()
        for index, frequencies in enumerate(self._term_frequencies):
            document_length = self._lengths[index] or 1
            score = 0.0
            for term, query_frequency in query_terms.items():
                frequency = frequencies.get(term, 0)
                if not frequency:
                    continue
                denominator = frequency + k1 * (
                    1 - b + b * document_length / max(self._average_length, 1)
                )
                score += self._idf.get(term, 0.0) * ((frequency * (k1 + 1)) / denominator)
                score *= 1 + min(query_frequency - 1, 2) * 0.1
            haystack = f"{self.documents[index].title} {self.documents[index].text}".casefold()
            if len(query_folded) >= 4 and query_folded in haystack:
                score += 2.0
            raw_scores.append(score)
        maximum = max(raw_scores, default=0.0)
        if maximum <= 0:
            return raw_scores
        return [score / maximum for score in raw_scores]


class HybridRetriever:
    """Cached semantic + lexical retrieval with a no-network lexical fallback."""

    def __init__(self, documents: tuple[KnowledgeDocument, ...], settings: Settings) -> None:
        self.documents = documents
        self.settings = settings
        self.lexical = LexicalIndex(documents)
        self._model: Any | None = None
        self._faiss_index: Any | None = None
        self._backend: RagBackend = "uninitialized"
        self._semantic_attempted = False
        self._lock = RLock()

    @property
    def backend(self) -> RagBackend:
        return self._backend

    @property
    def ready(self) -> bool:
        return self._backend in {"lexical", "hybrid"}

    def build(self) -> None:
        with self._lock:
            if self._backend == "hybrid" or self._semantic_attempted:
                return
            self.prepare_lexical()
            self._semantic_attempted = True
            if not self.settings.enable_semantic_rag:
                return
        try:
            import faiss  # type: ignore
            import numpy as np
            from sentence_transformers import SentenceTransformer

            model_kwargs: dict[str, object] = {
                "local_files_only": self.settings.embedding_local_files_only,
            }
            if self.settings.embedding_cache_folder:
                model_kwargs["cache_folder"] = str(self.settings.embedding_cache_folder)
            model = SentenceTransformer(self.settings.embedding_model, **model_kwargs)
            corpus = [f"{doc.title}. {doc.text}" for doc in self.documents]
            vectors = model.encode(
                corpus,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            vectors = np.asarray(vectors, dtype="float32")
            index = faiss.IndexFlatIP(vectors.shape[1])
            index.add(vectors)
            with self._lock:
                self._model = model
                self._faiss_index = index
                self._backend = "hybrid"
            LOGGER.info("Semantic RAG initialized with %s", self.settings.embedding_model)
        except Exception as exc:  # noqa: BLE001 - optional dependency/model failures fall back safely
            LOGGER.warning("Semantic RAG unavailable; using lexical retrieval: %s", exc)

    def prepare_lexical(self) -> None:
        with self._lock:
            if self._backend == "uninitialized":
                self._backend = "lexical"

    def search(self, query: str, top_k: int | None = None) -> list[RetrievedDocument]:
        if not self.ready:
            self.build()
        top_k = top_k or self.settings.rag_top_k
        lexical_scores = self.lexical.score(query)
        semantic_scores: dict[int, float] = {}
        if self._backend == "hybrid" and self._model is not None and self._faiss_index is not None:
            try:
                semantic_query = query
                if "bge-small-en-v1.5" in self.settings.embedding_model.casefold():
                    semantic_query = f"Represent this sentence for searching relevant passages: {query}"
                vector = self._model.encode(
                    [semantic_query],
                    convert_to_numpy=True,
                    normalize_embeddings=True,
                    show_progress_bar=False,
                )
                scores, indexes = self._faiss_index.search(vector, min(len(self.documents), max(top_k * 3, 8)))
                semantic_scores = {
                    int(index): max(0.0, min(1.0, (float(score) - 0.15) / 0.85))
                    for score, index in zip(scores[0], indexes[0])
                    if index >= 0
                }
            except Exception as exc:  # noqa: BLE001 - a query failure must preserve lexical retrieval
                LOGGER.warning("Semantic query failed; using lexical scores: %s", exc)

        results: list[RetrievedDocument] = []
        for index, document in enumerate(self.documents):
            lexical = lexical_scores[index]
            semantic = semantic_scores.get(index)
            combined = lexical if semantic is None else 0.45 * lexical + 0.55 * semantic
            if combined >= self.settings.rag_min_score:
                results.append(
                    RetrievedDocument(
                        document=document,
                        score=round(min(combined, 1.0), 6),
                        lexical_score=round(lexical, 6),
                        semantic_score=round(semantic, 6) if semantic is not None else None,
                    )
                )
        results.sort(key=lambda result: (-result.score, result.document.id))
        return results[:top_k]
