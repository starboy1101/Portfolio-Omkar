import {
  AlertCircle,
  ArrowUp,
  Bot,
  BriefcaseBusiness,
  CircleStop,
  FileText,
  Loader2,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  useAssistant,
  type AssistantMessage,
  type AssistantMode,
} from '../../contexts/AssistantContext';
import { getSkillId, portfolio } from '../../data/portfolio';
import type { PortfolioAction, SourceReference } from '../../types/assistant';
import {
  getTrustedActionLabel,
  isExecutableAction,
} from './actionExecutor';
import JobMatchCard from './JobMatchCard';
import ResumeEmailForm from './ResumeEmailForm';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const allSkills = portfolio.skill_categories.flatMap((category) => category.skills);

const sourceAction = (source: SourceReference): PortfolioAction | undefined => {
  if (source.type === 'project') return { type: 'OPEN_PROJECT', target: source.id };
  if (source.type === 'skill' || source.type === 'skills') {
    return { type: 'HIGHLIGHT_SKILL', target: source.id };
  }
  if (source.type === 'experience') return { type: 'SHOW_EXPERIENCE' };
  if (source.type === 'certification') return { type: 'SHOW_CERTIFICATIONS' };
  if (source.type === 'resume') return { type: 'OPEN_RESUME' };
  if (source.type === 'contact') return { type: 'OPEN_CONTACT' };
  if (source.type === 'education' || source.type === 'achievement' || source.type === 'profile') {
    return { type: 'NAVIGATE', target: 'about' };
  }
  return undefined;
};

const sourceLabel = (source: SourceReference) => {
  if (source.type === 'project') {
    return (
      portfolio.projects.find((project) => project.id === source.id)?.title ??
      source.label ??
      source.title ??
      'Project evidence'
    );
  }
  if (source.type === 'skill' || source.type === 'skills') {
    return (
      allSkills.find((skill) => getSkillId(skill.name) === getSkillId(source.id))?.name ??
      source.label ??
      source.title ??
      'Skill evidence'
    );
  }
  return source.label ?? source.title ?? `${source.type[0].toUpperCase()}${source.type.slice(1)}`;
};

interface MessageBubbleProps {
  message: AssistantMessage;
  onAction: (action: PortfolioAction) => void;
  onRetry: () => void;
}

const MessageBubble = ({ message, onAction, onRetry }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const actions = (message.response?.actions ?? []).filter(isExecutableAction);
  const sources = (message.response?.sources ?? [])
    .map((item) => ({ source: item, action: sourceAction(item) }))
    .filter(
      (item): item is { source: SourceReference; action: PortfolioAction } =>
        Boolean(item.action && isExecutableAction(item.action)),
    );

  return (
    <article className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <Bot aria-hidden="true" className="h-4 w-4" />
        </div>
      )}
      <div className={`min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-3.5 py-3 text-sm leading-6 shadow-sm ${
            isUser
              ? 'rounded-br-md bg-blue-600 text-white'
              : message.status === 'error'
                ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100'
                : 'rounded-bl-md border border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          {message.status === 'streaming' && !message.content ? (
            <span role="status" className="inline-flex items-center gap-1.5" aria-label="Omkar AI is thinking">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 motion-reduce:animate-none" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:120ms] motion-reduce:animate-none" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:240ms] motion-reduce:animate-none" />
              <span className="sr-only">Thinking…</span>
            </span>
          ) : (
            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>
          )}
          {message.status === 'streaming' && message.content && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded bg-blue-500 align-middle motion-reduce:animate-none" aria-hidden="true" />
          )}
        </div>

        {!isUser && message.delivery === 'local' && message.id !== 'assistant-welcome' && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-300">
            <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
            Verified local fallback
          </p>
        )}
        {!isUser && message.status === 'stopped' && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Generation stopped</p>
        )}
        {!isUser && (message.status === 'error' || message.status === 'stopped') && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950"
          >
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            Retry
          </button>
        )}

        {sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Portfolio sources">
            {sources.slice(0, 5).map(({ source, action }, index) => (
              <button
                key={`${source.type}-${source.id}-${index}`}
                type="button"
                onClick={() => onAction(action)}
                className="inline-flex min-h-9 items-center rounded-full border border-gray-300 bg-white px-2.5 py-1 text-left text-xs font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
              >
                {sourceLabel(source)}
              </button>
            ))}
          </div>
        )}

        {actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2" aria-label="Assistant actions">
            {actions.map((action, index) => (
              <button
                key={`${action.type}-${action.target ?? index}`}
                type="button"
                onClick={() => onAction(action)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-left text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-blue-950/60 dark:text-blue-200 dark:hover:bg-blue-900"
              >
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                {getTrustedActionLabel(action)}
              </button>
            ))}
          </div>
        )}

        {message.response?.match && (
          <div className="mt-3">
            <JobMatchCard result={message.response.match} onAction={onAction} />
          </div>
        )}
      </div>
    </article>
  );
};

const connectionLabel = (state: ReturnType<typeof useAssistant>['connectionState']) => {
  if (state === 'connecting') return 'Waking live AI…';
  if (state === 'streaming') return 'Answering…';
  if (state === 'offline') return 'Verified local mode';
  if (state === 'error') return 'Needs attention';
  return 'Ready';
};

const AssistantPanel = () => {
  const {
    mode,
    messages,
    draft,
    activeContext,
    isStreaming,
    connectionState,
    error,
    suggestions,
    recruiterAnalysis,
    resumeEmailVisible,
    closeAssistant,
    setMode,
    setDraft,
    sendMessage,
    retryLast,
    abortResponse,
    clearConversation,
    executeAction,
    runJobAnalysis,
    abortJobAnalysis,
    clearJobAnalysis,
  } = useAssistant();
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const jdInputRef = useRef<HTMLTextAreaElement>(null);
  const recruiterErrorRef = useRef<HTMLParagraphElement>(null);
  const recruiterResultRef = useRef<HTMLDivElement>(null);
  const previousRecruiterStatusRef = useRef(recruiterAnalysis.status);
  const initialModeRef = useRef(mode);
  const logRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const [jobDescription, setJobDescription] = useState('');

  const contextualLabel = useMemo(() => {
    if (activeContext?.projectId) {
      return portfolio.projects.find((project) => project.id === activeContext.projectId)?.title;
    }
    if (activeContext?.skillId) {
      return allSkills.find(
        (skill) => getSkillId(skill.name) === getSkillId(activeContext.skillId ?? ''),
      )?.name;
    }
    return undefined;
  }, [activeContext]);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFrame = window.requestAnimationFrame(() => {
      const initialTarget =
        initialModeRef.current === 'recruiter' ? jdInputRef.current : chatInputRef.current;
      (initialTarget ?? panelRef.current)?.focus();
    });

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAssistant();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null && element.getAttribute('aria-hidden') !== 'true');
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => {
        if (opener?.isConnected) opener.focus();
        else document.querySelector<HTMLElement>('[data-assistant-trigger]')?.focus();
      });
    };
  }, [closeAssistant]);

  useEffect(() => {
    if (!chatInputRef.current) return;
    chatInputRef.current.style.height = 'auto';
    chatInputRef.current.style.height = `${Math.min(chatInputRef.current.scrollHeight, 144)}px`;
  }, [draft]);

  useEffect(() => {
    const previousStatus = previousRecruiterStatusRef.current;
    previousRecruiterStatusRef.current = recruiterAnalysis.status;
    if (mode !== 'recruiter' || previousStatus === recruiterAnalysis.status) return;

    if (recruiterAnalysis.status === 'error') recruiterErrorRef.current?.focus();
    if (recruiterAnalysis.status === 'success') recruiterResultRef.current?.focus();
  }, [mode, recruiterAnalysis.status]);

  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (mode !== 'chat') return;
    if (nearBottomRef.current || lastMessage?.role === 'user') {
      logEndRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'end',
      });
    }
  }, [lastMessage?.content, lastMessage?.role, messages.length, mode, reduceMotion, resumeEmailVisible]);

  const handleLogScroll = () => {
    const log = logRef.current;
    if (!log) return;
    nearBottomRef.current = log.scrollHeight - log.scrollTop - log.clientHeight < 120;
  };

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      if (draft.trim() && !isStreaming) void sendMessage();
    }
  };

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeAssistant();
  };

  const selectMode = (nextMode: AssistantMode) => {
    setMode(nextMode);
    window.requestAnimationFrame(() => {
      (nextMode === 'recruiter' ? jdInputRef.current : chatInputRef.current)?.focus();
    });
  };

  const panel = (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-gray-950/55 p-0 backdrop-blur-sm sm:items-stretch sm:justify-end sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.16 }}
      onMouseDown={handleBackdropMouseDown}
    >
      <motion.section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-dialog-title"
        aria-describedby="assistant-dialog-description"
        tabIndex={-1}
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[94dvh] min-h-[32rem] w-full flex-col overflow-hidden rounded-t-3xl border border-gray-200 bg-gray-50 shadow-2xl focus:outline-none dark:border-gray-700 dark:bg-gray-950 sm:max-h-none sm:min-h-0 sm:w-[min(31rem,calc(100vw-2rem))] sm:rounded-3xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="shrink-0 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-900/20">
              <Bot aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="assistant-dialog-title" className="font-semibold text-gray-950 dark:text-white">
                Ask Omkar AI
              </h2>
              <p id="assistant-dialog-description" className="sr-only">
                Ask questions grounded in Omkar’s portfolio, navigate sections, or compare a job description.
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${
                    connectionState === 'offline'
                      ? 'bg-amber-500'
                      : connectionState === 'error'
                        ? 'bg-red-500'
                        : connectionState === 'connecting' || connectionState === 'streaming'
                          ? 'animate-pulse bg-blue-500 motion-reduce:animate-none'
                          : 'bg-emerald-500'
                  }`}
                />
                {connectionLabel(connectionState)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearConversation}
              aria-label="Clear assistant conversation"
              title="Clear conversation"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={closeAssistant}
              aria-label="Close Ask Omkar AI"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800" role="tablist" aria-label="Assistant mode">
            <button
              id="assistant-chat-tab"
              type="button"
              role="tab"
              aria-selected={mode === 'chat'}
              aria-controls="assistant-chat-panel"
              onClick={() => selectMode('chat')}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                mode === 'chat'
                  ? 'bg-white text-blue-700 shadow-sm dark:bg-gray-900 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              Ask
            </button>
            <button
              id="assistant-recruiter-tab"
              type="button"
              role="tab"
              aria-selected={mode === 'recruiter'}
              aria-controls="assistant-recruiter-panel"
              onClick={() => selectMode('recruiter')}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                mode === 'recruiter'
                  ? 'bg-white text-blue-700 shadow-sm dark:bg-gray-900 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />
              Recruiter
            </button>
          </div>
        </header>

        {mode === 'chat' ? (
          <div
            id="assistant-chat-panel"
            role="tabpanel"
            aria-labelledby="assistant-chat-tab"
            className="flex min-h-0 flex-1 flex-col"
          >
            {error && (
              <div
                role={connectionState === 'error' ? 'alert' : 'status'}
                className={`mx-4 mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 ${
                  connectionState === 'error'
                    ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'
                    : 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
                }`}
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="flex-1">{error}</span>
                {!isStreaming && (
                  <button
                    type="button"
                    onClick={() => void retryLast()}
                    className="min-h-9 shrink-0 rounded-lg px-2 font-semibold underline decoration-transparent underline-offset-2 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  >
                    Retry live
                  </button>
                )}
              </div>
            )}

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-busy={isStreaming}
              aria-label="Conversation"
              onScroll={handleLogScroll}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {contextualLabel && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-900 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-200">
                  Context: <span className="font-semibold">{contextualLabel}</span>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onAction={executeAction}
                  onRetry={() => void retryLast()}
                />
              ))}

              {resumeEmailVisible && <ResumeEmailForm />}

              {!isStreaming && suggestions.length > 0 && (
                <section aria-labelledby="assistant-suggestions-heading">
                  <h3 id="assistant-suggestions-heading" className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Try asking
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => void sendMessage(suggestion)}
                        className="min-h-11 rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-xs font-medium leading-5 text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:bg-blue-950"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <div ref={logEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} className="shrink-0 border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
              <label htmlFor="assistant-message" className="sr-only">
                Message Ask Omkar AI
              </label>
              <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-gray-50 p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950">
                <textarea
                  ref={chatInputRef}
                  id="assistant-message"
                  rows={2}
                  maxLength={4_000}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  disabled={isStreaming}
                  placeholder="Ask about Omkar’s AI work…"
                  className="max-h-36 min-h-12 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-base leading-6 text-gray-950 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:text-white dark:placeholder:text-gray-400"
                />
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={abortResponse}
                    aria-label="Stop generating response"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    <CircleStop aria-hidden="true" className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Send message"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:focus-visible:ring-offset-gray-950"
                  >
                    <ArrowUp aria-hidden="true" className="h-5 w-5" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 px-1 text-xs text-gray-500 dark:text-gray-400">
                Enter to send · Shift+Enter for a new line
              </p>
            </form>
          </div>
        ) : (
          <div
            id="assistant-recruiter-panel"
            role="tabpanel"
            aria-labelledby="assistant-recruiter-tab"
            aria-busy={recruiterAnalysis.status === 'loading'}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
          >
            <div className="mb-4 rounded-2xl border border-purple-200 bg-purple-50/70 p-4 dark:border-purple-900 dark:bg-purple-950/30">
              <h3 className="flex items-center gap-2 font-semibold text-gray-950 dark:text-white">
                <FileText aria-hidden="true" className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Compare a job description
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-200">
                Results use only verified portfolio and resume evidence. Missing requirements stay explicitly marked as not found.
              </p>
            </div>

            <label htmlFor="assistant-job-description" className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Job description
            </label>
            <textarea
              ref={jdInputRef}
              id="assistant-job-description"
              rows={8}
              maxLength={12_000}
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              disabled={recruiterAnalysis.status === 'loading'}
              aria-invalid={recruiterAnalysis.status === 'error'}
              aria-describedby={
                recruiterAnalysis.status === 'error'
                  ? 'assistant-jd-help assistant-jd-error'
                  : 'assistant-jd-help'
              }
              placeholder="Paste the role responsibilities and required skills here…"
              className="min-h-48 w-full resize-y rounded-2xl border border-gray-300 bg-white px-3 py-3 text-base leading-6 text-gray-950 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
            />
            <div id="assistant-jd-help" className="mt-1.5 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>At least 40 characters</span>
              <span className="tabular-nums">{jobDescription.length.toLocaleString()} / 12,000</span>
            </div>

            {recruiterAnalysis.error && (
              <p
                ref={recruiterErrorRef}
                id="assistant-jd-error"
                role={recruiterAnalysis.status === 'error' ? 'alert' : 'status'}
                aria-atomic="true"
                tabIndex={-1}
                className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${
                  recruiterAnalysis.status === 'error'
                    ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'
                    : 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
                }`}
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                {recruiterAnalysis.error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {recruiterAnalysis.status === 'loading' ? (
                <button
                  type="button"
                  onClick={abortJobAnalysis}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 dark:focus-visible:ring-offset-gray-950"
                >
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                  Stop analysis
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void runJobAnalysis(jobDescription)}
                  disabled={jobDescription.trim().length < 40}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-950"
                >
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                  Analyze evidence
                </button>
              )}
              {(jobDescription || recruiterAnalysis.result) && recruiterAnalysis.status !== 'loading' && (
                <button
                  type="button"
                  onClick={() => {
                    setJobDescription('');
                    clearJobAnalysis();
                    jdInputRef.current?.focus();
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            {recruiterAnalysis.status === 'success' && recruiterAnalysis.result && (
              <div
                ref={recruiterResultRef}
                role="region"
                aria-labelledby="assistant-job-results-heading"
                tabIndex={-1}
                className="mt-5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
              >
                <h3 id="assistant-job-results-heading" className="sr-only">
                  Job analysis complete
                </h3>
                <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                  Evidence comparison results are ready.
                </p>
                <JobMatchCard
                  result={recruiterAnalysis.result}
                  usedFallback={recruiterAnalysis.usedFallback}
                  onAction={executeAction}
                />
              </div>
            )}
          </div>
        )}
      </motion.section>
    </motion.div>
  );

  return createPortal(panel, document.body);
};

export default AssistantPanel;
