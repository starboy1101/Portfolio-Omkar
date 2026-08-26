---
title: Omkar Qwen3 4B
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: "6.24.0"
python_version: "3.10"
app_file: app.py
pinned: false
models:
  - Qwen/Qwen3-4B-Instruct-2507
preload_from_hub:
  - Qwen/Qwen3-4B-Instruct-2507
short_description: ZeroGPU Qwen endpoint for Omkar's portfolio backend
---

# Omkar Qwen3 4B ZeroGPU Space

This folder is a complete, separate Hugging Face Gradio Space. It runs
`Qwen/Qwen3-4B-Instruct-2507` on ZeroGPU and exposes the stable named API
endpoint `/generate` for the Render FastAPI backend.

## Deploy it

1. On Hugging Face, create a new **Gradio** Space. A public Space is simplest.
2. In **Settings → Hardware**, select **ZeroGPU**. The hardware choice cannot be
   declared by these repository files.
3. Copy this folder's `README.md`, `app.py`, and `requirements.txt` into the root
   of that Space repository, then commit them.
4. Wait for the model to preload and for the Space status to become **Running**.
5. Open **Use via API** and confirm that `/generate` is listed. You can also run:

   ```python
   from gradio_client import Client

   Client("YOUR_USERNAME/YOUR_SPACE").view_api()
   ```

6. In the Render backend, set `HF_GRADIO_SPACE_ID` to
   `YOUR_USERNAME/YOUR_SPACE`, keep `HF_GRADIO_API_NAME=/generate`, and store a
   Hugging Face read token in the backend-only `HF_TOKEN` secret.

Do not put `HF_TOKEN` in a `VITE_*` variable or in frontend code. For a private
Space, the token must belong to an account that can read the Space.

## API contract

The named endpoint accepts four inputs in this order:

1. `system_prompt` (text)
2. `prompt` (text)
3. `max_new_tokens` (64–512)
4. `temperature` (0–1)

It returns one text value. Keep `api_name="generate"` in `app.py`; the backend
intentionally does not depend on Gradio's unstable numeric function indexes.

## Important free-tier behavior

ZeroGPU can sleep and queue requests. Calls from Render do not carry the browser
ZeroGPU identity header, so an authenticated backend call uses the `HF_TOKEN`
owner's shared ZeroGPU quota. This architecture is suitable for a low-traffic
portfolio demo, not an always-on public inference API. The FastAPI service keeps
an evidence-grounded, no-model response path for quota, queue, and outage cases.

References: [ZeroGPU](https://huggingface.co/docs/hub/spaces-zerogpu),
[Space configuration](https://huggingface.co/docs/hub/spaces-config-reference),
[Gradio API endpoints](https://www.gradio.app/guides/view-api-page), and the
[Qwen model card](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507).
