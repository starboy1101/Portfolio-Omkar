from __future__ import annotations

import gradio as gr
import spaces
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = "Qwen/Qwen3-4B-Instruct-2507"
MAX_SYSTEM_CHARS = 4_000
MAX_PROMPT_CHARS = 24_000

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.bfloat16,
    low_cpu_mem_usage=True,
).to("cuda")
model.eval()


@spaces.GPU(duration=60)
def generate(
    system_prompt: str,
    prompt: str,
    max_new_tokens: int = 384,
    temperature: float = 0.2,
) -> str:
    """Generate one bounded response for the named Gradio API endpoint."""

    cleaned_prompt = (prompt or "").strip()[:MAX_PROMPT_CHARS]
    if not cleaned_prompt:
        raise ValueError("Prompt is required")

    cleaned_system = (system_prompt or "").strip()[:MAX_SYSTEM_CHARS]
    messages: list[dict[str, str]] = []
    if cleaned_system:
        messages.append({"role": "system", "content": cleaned_system})
    messages.append({"role": "user", "content": cleaned_prompt})

    token_limit = max(64, min(int(max_new_tokens), 512))
    sampling_temperature = max(0.0, min(float(temperature), 1.0))
    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt",
    ).to(model.device)

    generation_options: dict[str, object] = {
        "max_new_tokens": token_limit,
        "do_sample": sampling_temperature > 0,
        "pad_token_id": tokenizer.eos_token_id,
    }
    if sampling_temperature > 0:
        generation_options.update(temperature=sampling_temperature, top_p=0.9)

    with torch.inference_mode():
        generated_ids = model.generate(**inputs, **generation_options)

    input_length = inputs["input_ids"].shape[-1]
    answer = tokenizer.decode(generated_ids[0, input_length:], skip_special_tokens=True).strip()
    if not answer:
        raise RuntimeError("Model returned no text")
    return answer


with gr.Blocks(title="Omkar Qwen3 4B") as demo:
    gr.Markdown(
        "# Qwen3-4B-Instruct-2507 on ZeroGPU\n"
        "A small public test console for the model endpoint used by Omkar's portfolio backend."
    )
    system_prompt = gr.Textbox(
        label="System prompt",
        value="You are a concise, helpful assistant.",
        lines=4,
    )
    prompt = gr.Textbox(label="Prompt", placeholder="Ask a question...", lines=8)
    with gr.Row():
        max_new_tokens = gr.Slider(64, 512, value=384, step=1, label="Max new tokens")
        temperature = gr.Slider(0, 1, value=0.2, step=0.05, label="Temperature")
    run = gr.Button("Generate", variant="primary")
    output = gr.Textbox(label="Response", lines=10)
    run.click(
        generate,
        inputs=[system_prompt, prompt, max_new_tokens, temperature],
        outputs=output,
        api_name="generate",
        concurrency_limit=1,
    )

demo.queue(default_concurrency_limit=1, max_size=20)

if __name__ == "__main__":
    demo.launch()
