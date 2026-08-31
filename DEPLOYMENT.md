# Render + Hugging Face ZeroGPU deployment

Deploy in this order:

```text
1. Hugging Face model Space
2. Render Blueprint (FastAPI backend + static frontend)
3. End-to-end verification
```

## 1. Create the Qwen ZeroGPU Space

1. Sign in to Hugging Face and create a new Space.
2. Choose **Gradio** as the SDK and choose a simple name such as
   `omkar-qwen3-4b`.
3. After creation, open **Settings -> Hardware** and select **ZeroGPU**.
4. Put these repository files at the root of the new Space repository:

   ```text
   backend/huggingface-space/README.md        -> README.md
   backend/huggingface-space/app.py           -> app.py
   backend/huggingface-space/requirements.txt -> requirements.txt
   ```

5. Commit the files and wait until the Space is running. Model weights are
   preloaded from `Qwen/Qwen3-4B-Instruct-2507`.
6. Open **Use via API**. Confirm the named endpoint is exactly `/generate` and
   that its four inputs are `system_prompt`, `prompt`, `max_new_tokens`, and
   `temperature`.

Optional API inspection from a machine with `gradio_client` installed:

```python
from gradio_client import Client

Client("YOUR_HF_USERNAME/omkar-qwen3-4b").view_api()
```

Create a fine-grained Hugging Face read token for the Render backend. A token is
required for a private Space and recommended for authenticated ZeroGPU quota.
Never commit it.

## 2. Deploy the Render Blueprint

Push this repository to GitHub, GitLab, or Bitbucket. In Render:

1. Choose **New -> Blueprint**.
2. Connect this repository and select the root `render.yaml`.
3. During initial creation, Render asks for the `sync: false` values:

   - `HF_GRADIO_SPACE_ID`: `YOUR_HF_USERNAME/omkar-qwen3-4b`
   - `HF_TOKEN`: the backend-only Hugging Face read token
   - `VITE_GA_MEASUREMENT_ID`: an optional GA4 ID such as `G-XXXXXXXXXX`;
     leave analytics unconfigured if you do not have a GA4 property yet

4. Apply the Blueprint. It creates:

   - `omkar-mahabdi-portfolio`: a Render Static Site built with Vite;
   - `omkar-mahabdi-portfolio-api`: a free Python FastAPI Web Service.

The Blueprint automatically copies the backend's `RENDER_EXTERNAL_URL` into the
frontend build variable `VITE_AI_API_URL`. It also copies the frontend's public
URL into backend `CORS_ORIGINS` and `PORTFOLIO_URL`. You do not need to guess
either `.onrender.com` URL.

The backend intentionally installs `backend/requirements.txt`, not the semantic
RAG or Space requirements. This keeps Torch, model weights, full Gradio, FAISS,
and SentenceTransformers off the 512 MB Render service.

## 3. Verify the deployment

Wait for both services to finish, then check:

1. `https://YOUR_BACKEND.onrender.com/health`

   Expected fields include:

   ```json
   {
     "status": "ok",
     "ragBackend": "lexical",
     "llmProvider": "hf_gradio_zerogpu",
     "llmConfigured": true
   }
   ```

2. `https://YOUR_BACKEND.onrender.com/ready` should return `ready: true`.
3. Open the Render frontend and ask, "Explain Omkar's RAG project."
4. Confirm the answer includes source cards/actions and that the browser network
   request goes only to the Render backend, not directly to `hf.space`.
5. Temporarily pausing the Space should still produce a grounded fallback after
   the configured timeout.
6. If analytics is configured, open a private browser window and confirm that no
   Google Analytics request occurs before a cookie choice. Allow analytics, then
   verify the current page appears in GA4 Realtime.

After Render assigns the final frontend URL, replace the old deployment URL in
`render.yaml` (`VITE_SITE_URL`), `index.html`, `public/robots.txt`,
`public/sitemap.xml`, and the audited portfolio `portfolio_url` if it differs
from `https://omkar-mahabdi-portfolio.onrender.com`. Commit that factual URL and
let the Blueprint redeploy both services.

## Custom domains

If you later attach a custom domain to the frontend, add that exact origin to the
backend's `CORS_ORIGINS`. Render Blueprint service references cannot concatenate
an automatic URL and an extra literal, so manage the comma-separated value in
the backend dashboard at that point. Rebuild the frontend after changing any
`VITE_*` value because Vite injects it during build.

## Troubleshooting

### Health says `llmConfigured: false`

Set `HF_GRADIO_SPACE_ID` on the **backend** Render service. Use the repository ID
form `owner/space`, not the human title. Restart the service after saving it.

### Gradio reports that `/generate` does not exist

Confirm the Space has the supplied `run.click(..., api_name="generate")` code.
Open **Use via API** or call `view_api()`. Do not switch the backend to a numeric
`fn_index`.

### Requests time out or immediately use fallback

Check the Space runtime logs and ZeroGPU quota/queue status. Both Render free and
ZeroGPU can cold-start. Keep `HF_GRADIO_TIMEOUT_SECONDS=180` initially. The
backend does not retry after submission because a retry can spend quota twice.

### CORS fails

Compare the browser's exact origin with backend `CORS_ORIGINS`. Include the
scheme and do not add a trailing path. Redeploy the backend after correcting it.

### Render exceeds memory

Verify the Blueprint build command still installs only
`backend/requirements.txt` and that `ENABLE_SEMANTIC_RAG=false`. Do not deploy
Qwen on Render's free backend; the BF16 4B model alone is far larger than its
memory allocation.

### Resume/contact email returns 503

That is expected without email configuration. Render free blocks outbound SMTP
ports 25, 465, and 587. Use a paid backend or add an HTTPS email API adapter;
adding SMTP credentials alone does not bypass the network restriction.

## Capacity expectations

This topology is appropriate for a portfolio/demo. The Render service can sleep
after inactivity, ZeroGPU can queue, and backend-authenticated model calls share
the HF token owner's ZeroGPU quota. The early SSE connection marker prevents the
frontend stream from sitting completely idle while generation starts, and the
no-model fallback keeps portfolio questions usable when inference is unavailable.

Official references:

- [Hugging Face ZeroGPU](https://huggingface.co/docs/hub/spaces-zerogpu)
- [Hugging Face Space configuration](https://huggingface.co/docs/hub/spaces-config-reference)
- [Gradio Python client](https://www.gradio.app/docs/python-client/client)
- [Render Blueprint specification](https://render.com/docs/blueprint-spec)
- [Render FastAPI deployment](https://render.com/docs/deploy-fastapi)
- [Render free services](https://render.com/docs/free)
- [Google consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Google Analytics SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)
