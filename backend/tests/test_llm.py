from __future__ import annotations

import asyncio
import logging
import sys
from types import SimpleNamespace

from backend.app.config import Settings
from backend.app.services.llm import (
    SYSTEM_PROMPT,
    HuggingFaceGradioModel,
    create_language_model,
)


def _settings(**overrides: object) -> Settings:
    values: dict[str, object] = {
        "hf_gradio_space_id": "owner/qwen-space",
        "hf_gradio_api_name": "generate",
        "hf_token": "hf_private_test_token",
        "hf_gradio_timeout_seconds": 42,
        "llm_max_tokens": 256,
        "llm_temperature": 0.15,
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


def test_factory_is_remote_only_and_unconfigured_without_space_id() -> None:
    model = create_language_model(_settings(hf_gradio_space_id=None))

    assert isinstance(model, HuggingFaceGradioModel)
    assert model.provider_name == "hf_gradio_zerogpu"
    assert model.configured is False
    assert asyncio.run(model.generate("unused")) is None


def test_gradio_gateway_uses_named_endpoint_and_backend_token(monkeypatch) -> None:
    captured: dict[str, object] = {}

    class FakeJob:
        def result(self, timeout: float) -> list[str]:
            captured["result_timeout"] = timeout
            return ["  Grounded Qwen answer  "]

        def cancel(self) -> None:
            raise AssertionError("A successful job must not be cancelled")

    class FakeClient:
        def __init__(self, **options: object) -> None:
            captured["client_options"] = options

        def submit(self, *args: object, **kwargs: object) -> FakeJob:
            captured["submit_args"] = args
            captured["submit_kwargs"] = kwargs
            return FakeJob()

    monkeypatch.setitem(sys.modules, "gradio_client", SimpleNamespace(Client=FakeClient))
    model = HuggingFaceGradioModel(_settings())

    result = asyncio.run(model.generate("AUDITED CONTEXT\nQuestion"))

    assert result == "Grounded Qwen answer"
    options = captured["client_options"]
    assert isinstance(options, dict)
    assert options["src"] == "owner/qwen-space"
    assert options["token"] == "hf_private_test_token"
    assert options["download_files"] is False
    assert options["httpx_kwargs"] == {"timeout": 42.0}
    assert captured["submit_args"] == (SYSTEM_PROMPT, "AUDITED CONTEXT\nQuestion", 256, 0.15)
    assert captured["submit_kwargs"] == {"api_name": "/generate"}
    assert captured["result_timeout"] == 42.0


def test_gradio_timeout_cancels_job_and_does_not_log_token(monkeypatch, caplog) -> None:
    state = {"cancelled": False}

    class TimeoutJob:
        def result(self, timeout: float) -> str:
            del timeout
            raise TimeoutError("request included hf_private_test_token")

        def cancel(self) -> None:
            state["cancelled"] = True

    class FakeClient:
        def __init__(self, **options: object) -> None:
            del options

        def submit(self, *args: object, **kwargs: object) -> TimeoutJob:
            del args, kwargs
            return TimeoutJob()

    monkeypatch.setitem(sys.modules, "gradio_client", SimpleNamespace(Client=FakeClient))
    caplog.set_level(logging.WARNING)

    result = asyncio.run(HuggingFaceGradioModel(_settings()).generate("prompt"))

    assert result is None
    assert state["cancelled"] is True
    assert "hf_private_test_token" not in caplog.text
    assert "TimeoutError" in caplog.text
