from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

os.environ["ENVIRONMENT"] = "test"
os.environ["ENABLE_SEMANTIC_RAG"] = "false"
os.environ["HF_GRADIO_SPACE_ID"] = ""
os.environ["HF_TOKEN"] = ""

from backend.app.main import app, container


@pytest.fixture()
def client():
    container.rate_limiter.clear()
    with TestClient(app) as test_client:
        yield test_client
    container.rate_limiter.clear()


@pytest.fixture()
def services():
    return container
