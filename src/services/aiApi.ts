import type {
  ApiMessage,
  AssistantResponse,
  ChatRequest,
  ChatStreamEvent,
  ContactRequest,
  JobMatchResult,
  ResumeEmailRequest,
} from '../types/assistant';

const configuredApiUrl = (import.meta.env.VITE_AI_API_URL as string | undefined)?.trim();
const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, '')
  : import.meta.env.DEV
    ? 'http://localhost:7860'
    : '';

const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { detail?: string; message?: string };
    return payload.detail ?? payload.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const postJson = async <T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Omkar AI is waking up or temporarily unavailable.');
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
};

const parseEventBlock = (block: string): ChatStreamEvent | null => {
  const data = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');

  if (!data || data === '[DONE]') return null;

  try {
    return JSON.parse(data) as ChatStreamEvent;
  } catch {
    return null;
  }
};

export const streamChat = async (
  request: ChatRequest,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(apiUrl('/api/chat/stream'), {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Omkar AI is waking up or temporarily unavailable.');
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (!response.body) {
    const fallback = await postJson<AssistantResponse>('/api/chat', request, signal);
    onEvent({ type: 'complete', response: fallback });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });

    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? '';

    blocks.forEach((block) => {
      const event = parseEventBlock(block);
      if (event) onEvent(event);
    });

    if (done) break;
  }

  const finalEvent = parseEventBlock(buffer);
  if (finalEvent) onEvent(finalEvent);
};

export const sendChat = (request: ChatRequest, signal?: AbortSignal) =>
  postJson<AssistantResponse>('/api/chat', request, signal);

export const analyzeJobDescription = (jobDescription: string, signal?: AbortSignal) =>
  postJson<JobMatchResult>('/api/jd/analyze', { jobDescription }, signal);

export const sendResumeEmail = (request: ResumeEmailRequest, signal?: AbortSignal) =>
  postJson<ApiMessage>('/api/resume/email', request, signal);

export const sendContact = (request: ContactRequest, signal?: AbortSignal) =>
  postJson<ApiMessage>('/api/contact', request, signal);

export const getApiBaseUrl = () => API_BASE_URL;
