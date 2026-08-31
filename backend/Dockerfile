FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    ENVIRONMENT=production \
    ENABLE_SEMANTIC_RAG=false

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend
COPY data /app/data
COPY public/resumes/OmkarMahabdi_AIML.pdf /app/public/resumes/OmkarMahabdi_AIML.pdf

RUN useradd --create-home --uid 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7860/ready', timeout=4)"

# One worker keeps the in-memory index and rate limiter coherent.
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
