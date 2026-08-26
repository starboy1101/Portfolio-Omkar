import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useEffect } from 'react';
import {
  ASSISTANT_OPEN_EVENT,
  TOUR_CONTROL_EVENT,
  navigatePortfolio,
  type AssistantOpenDetail,
  type TourControlDetail,
} from '../data/assistantEvents';
import { TOUR_SECTION_IDS } from '../data/portfolio';
import type { PortfolioSectionId } from '../data/portfolio';
import {
  analyzeJobDescription,
  sendResumeEmail as requestResumeEmail,
  streamChat,
} from '../services/aiApi';
import {
  analyzeJobDescriptionLocally,
  DEFAULT_ASSISTANT_SUGGESTIONS,
  getLocalAssistantResponse,
} from '../services/localAssistant';
import {
  executePortfolioAction,
  shouldAutoExecuteAction,
} from '../components/ai/actionExecutor';
import type {
  AssistantResponse,
  ChatRequest,
  ConversationTurn,
  JobMatchResult,
  PortfolioAction,
  ResumeEmailRequest,
} from '../types/assistant';

export type AssistantMode = 'chat' | 'recruiter';
export type AssistantConnectionState =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'offline'
  | 'error';
export type AssistantMessageStatus = 'complete' | 'streaming' | 'stopped' | 'error';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: AssistantMessageStatus;
  response?: AssistantResponse;
  delivery?: 'live' | 'local';
}

export interface RecruiterAnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: JobMatchResult;
  error?: string;
  usedFallback: boolean;
}

export interface ResumeEmailState {
  status: 'idle' | 'sending' | 'success' | 'error';
  message?: string;
}

export interface TourState {
  active: boolean;
  index: number;
}

export interface AssistantContextValue {
  isOpen: boolean;
  mode: AssistantMode;
  messages: AssistantMessage[];
  draft: string;
  activeContext?: ChatRequest['context'];
  isStreaming: boolean;
  connectionState: AssistantConnectionState;
  error?: string;
  suggestions: string[];
  recruiterAnalysis: RecruiterAnalysisState;
  resumeEmailVisible: boolean;
  resumeEmailState: ResumeEmailState;
  tour: TourState;
  openAssistant: (detail?: AssistantOpenDetail) => void;
  closeAssistant: () => void;
  setMode: (mode: AssistantMode) => void;
  setDraft: (value: string) => void;
  sendMessage: (message?: string, context?: ChatRequest['context']) => Promise<void>;
  retryLast: () => Promise<void>;
  abortResponse: () => void;
  clearConversation: () => void;
  executeAction: (action: PortfolioAction) => boolean;
  runJobAnalysis: (jobDescription: string) => Promise<void>;
  abortJobAnalysis: () => void;
  clearJobAnalysis: () => void;
  showResumeEmail: () => void;
  hideResumeEmail: () => void;
  sendResumeEmail: (request: ResumeEmailRequest) => Promise<void>;
  resetResumeEmailState: () => void;
  startTour: (stepIndex?: number) => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  stopTour: () => void;
}

const welcomeResponse: AssistantResponse = {
  message:
    "Hi! I’m Omkar’s AI Portfolio Assistant. Ask about his AI/ML work, Python experience, projects, certifications, or resume. I can also navigate the portfolio or compare verified evidence with a job description.",
  sources: [],
  actions: [],
  suggestions: DEFAULT_ASSISTANT_SUGGESTIONS,
  grounded: true,
};

const welcomeMessage: AssistantMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content: welcomeResponse.message,
  status: 'complete',
  response: welcomeResponse,
  delivery: 'local',
};

const initialRecruiterState: RecruiterAnalysisState = {
  status: 'idle',
  usedFallback: false,
};

const initialResumeEmailState: ResumeEmailState = { status: 'idle' };
const MAX_HISTORY_TURNS = 10;
let fallbackId = 0;

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  fallbackId += 1;
  return `${prefix}-${Date.now()}-${fallbackId}`;
};

const toConversationHistory = (messages: AssistantMessage[]): ConversationTurn[] =>
  messages
    .filter(
      (message) =>
        message.id !== welcomeMessage.id &&
        message.content.trim().length > 0 &&
        message.status !== 'error',
    )
    .slice(-MAX_HISTORY_TURNS)
    .map(({ role, content }) => ({ role, content }));

const messageFromError = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

const AssistantContext = createContext<AssistantContextValue | null>(null);

interface AssistantProviderProps {
  children: ReactNode;
}

export const AssistantProvider = ({ children }: AssistantProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setModeState] = useState<AssistantMode>('chat');
  const [messages, setMessages] = useState<AssistantMessage[]>([welcomeMessage]);
  const [draft, setDraft] = useState('');
  const [activeContext, setActiveContext] = useState<ChatRequest['context']>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionState, setConnectionState] = useState<AssistantConnectionState>('idle');
  const [error, setError] = useState<string>();
  const [recruiterAnalysis, setRecruiterAnalysis] =
    useState<RecruiterAnalysisState>(initialRecruiterState);
  const [resumeEmailVisible, setResumeEmailVisible] = useState(false);
  const [resumeEmailState, setResumeEmailState] =
    useState<ResumeEmailState>(initialResumeEmailState);
  const [tour, setTour] = useState<TourState>({ active: false, index: 0 });

  const messagesRef = useRef(messages);
  const chatAbortRef = useRef<AbortController>();
  const analysisAbortRef = useRef<AbortController>();
  const emailAbortRef = useRef<AbortController>();
  const requestSequenceRef = useRef(0);
  const lastRequestRef = useRef<{
    prompt: string;
    context?: ChatRequest['context'];
    assistantMessageId: string;
  }>();

  const updateMessages = useCallback(
    (
      updater:
        | AssistantMessage[]
        | ((current: AssistantMessage[]) => AssistantMessage[]),
    ) => {
      setMessages((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater;
        messagesRef.current = next;
        return next;
      });
    },
    [],
  );

  const openAssistant = useCallback((detail: AssistantOpenDetail = {}) => {
    setTour((current) => ({ ...current, active: false }));
    setIsOpen(true);
    if (detail.mode) setModeState(detail.mode);
    if (detail.context) setActiveContext(detail.context);
    if (typeof detail.prompt === 'string') setDraft(detail.prompt.slice(0, 4_000));
  }, []);

  const closeAssistant = useCallback(() => setIsOpen(false), []);
  const setMode = useCallback((nextMode: AssistantMode) => setModeState(nextMode), []);
  const showResumeEmail = useCallback(() => {
    setResumeEmailVisible(true);
    setResumeEmailState(initialResumeEmailState);
    setIsOpen(true);
    setModeState('chat');
  }, []);
  const hideResumeEmail = useCallback(() => {
    if (resumeEmailState.status === 'sending') emailAbortRef.current?.abort();
    setResumeEmailVisible(false);
    setResumeEmailState(initialResumeEmailState);
  }, [resumeEmailState.status]);
  const showRecruiterMode = useCallback(() => {
    setIsOpen(true);
    setModeState('recruiter');
  }, []);
  const prepareForNavigation = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const isSmallScreen = window.matchMedia('(max-width: 639px)').matches;
    if (isSmallScreen) setIsOpen(false);
    return isSmallScreen;
  }, []);

  const goToTourStep = useCallback((stepIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(stepIndex, TOUR_SECTION_IDS.length - 1));
    const sectionId = TOUR_SECTION_IDS[boundedIndex];
    setTour({ active: true, index: boundedIndex });
    setIsOpen(false);
    navigatePortfolio({ sectionId, highlight: true });
  }, []);

  const startTour = useCallback(
    (stepIndex = 0) => goToTourStep(Number.isFinite(stepIndex) ? stepIndex : 0),
    [goToTourStep],
  );
  const nextTourStep = useCallback(() => {
    if (!tour.active) {
      startTour(0);
      return;
    }
    if (tour.index >= TOUR_SECTION_IDS.length - 1) {
      setTour((current) => ({ ...current, active: false }));
      return;
    }
    goToTourStep(tour.index + 1);
  }, [goToTourStep, startTour, tour]);
  const previousTourStep = useCallback(() => {
    if (!tour.active) return;
    goToTourStep(Math.max(0, tour.index - 1));
  }, [goToTourStep, tour]);
  const stopTour = useCallback(
    () => setTour((current) => ({ ...current, active: false })),
    [],
  );

  const executeAction = useCallback(
    (portfolioAction: PortfolioAction) =>
      executePortfolioAction(portfolioAction, {
        showResumeEmail,
        showRecruiterMode,
        startTour,
        prepareForNavigation,
      }),
    [prepareForNavigation, showRecruiterMode, showResumeEmail, startTour],
  );

  const performRequest = useCallback(
    async (
      prompt: string,
      context: ChatRequest['context'] | undefined,
      appendUser: boolean,
    ) => {
      const trimmedPrompt = prompt.trim().slice(0, 4_000);
      if (!trimmedPrompt) return;

      const baseHistory = toConversationHistory(messagesRef.current);
      const latestHistoryTurn = baseHistory[baseHistory.length - 1];
      const history =
        !appendUser &&
        latestHistoryTurn?.role === 'user' &&
        latestHistoryTurn.content === trimmedPrompt
          ? baseHistory.slice(0, -1)
          : baseHistory;
      const userMessage: AssistantMessage = {
        id: createId('user'),
        role: 'user',
        content: trimmedPrompt,
        status: 'complete',
      };
      const assistantMessageId = createId('assistant');
      const assistantMessage: AssistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        status: 'streaming',
      };

      updateMessages((current) => [
        ...current,
        ...(appendUser ? [userMessage] : []),
        assistantMessage,
      ]);
      lastRequestRef.current = { prompt: trimmedPrompt, context, assistantMessageId };
      setDraft('');
      setError(undefined);
      setConnectionState('connecting');
      setIsStreaming(true);

      chatAbortRef.current?.abort();
      const controller = new AbortController();
      chatAbortRef.current = controller;
      requestSequenceRef.current += 1;
      const sequence = requestSequenceRef.current;
      let completedResponse: AssistantResponse | undefined;
      let streamError: string | undefined;
      let receivedDelta = false;

      const request: ChatRequest = {
        message: trimmedPrompt,
        history,
        ...(context ? { context } : {}),
      };

      try {
        await streamChat(
          request,
          (event) => {
            if (sequence !== requestSequenceRef.current || controller.signal.aborted) return;

            if (event.type === 'delta') {
              receivedDelta = true;
              setConnectionState('streaming');
              updateMessages((current) =>
                current.map((message) =>
                  message.id === assistantMessageId
                    ? { ...message, content: `${message.content}${event.delta}` }
                    : message,
                ),
              );
              return;
            }

            if (event.type === 'error') {
              streamError = event.message;
              return;
            }

            completedResponse = event.response;
            updateMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: event.response.message || message.content,
                      status: 'complete',
                      response: event.response,
                      delivery: 'live',
                    }
                  : message,
              ),
            );
          },
          controller.signal,
        );

        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        if (streamError) throw new Error(streamError);
        if (!completedResponse && !receivedDelta) {
          throw new Error('The live assistant returned an empty response.');
        }

        if (!completedResponse && receivedDelta) {
          updateMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, status: 'complete', delivery: 'live' }
                : message,
            ),
          );
        }

        setConnectionState('idle');
        setError(undefined);
        const automaticAction = completedResponse?.actions.find((item) =>
          shouldAutoExecuteAction(item.type),
        );
        if (automaticAction) executeAction(automaticAction);
      } catch (requestError) {
        if (isAbortError(requestError) || controller.signal.aborted) {
          updateMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: message.content || 'Response stopped.',
                    status: 'stopped',
                  }
                : message,
            ),
          );
          setConnectionState('idle');
          return;
        }

        try {
          const localResponse = getLocalAssistantResponse(request);
          updateMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: localResponse.message,
                    status: 'complete',
                    response: localResponse,
                    delivery: 'local',
                  }
                : message,
            ),
          );
          setConnectionState('offline');
          setError('Live AI is unavailable. Verified local answers remain available.');
          const automaticAction = localResponse.actions.find((item) =>
            shouldAutoExecuteAction(item.type),
          );
          if (automaticAction) executeAction(automaticAction);
        } catch (localError) {
          const readableError = messageFromError(
            localError,
            'The assistant could not answer. Please try again.',
          );
          updateMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: readableError,
                    status: 'error',
                  }
                : message,
            ),
          );
          setConnectionState('error');
          setError(readableError);
        }
      } finally {
        if (sequence === requestSequenceRef.current) {
          setIsStreaming(false);
          chatAbortRef.current = undefined;
        }
      }
    },
    [executeAction, updateMessages],
  );

  const sendMessage = useCallback(
    async (message?: string, context?: ChatRequest['context']) => {
      if (isStreaming) return;
      await performRequest(message ?? draft, context ?? activeContext, true);
    },
    [activeContext, draft, isStreaming, performRequest],
  );

  const retryLast = useCallback(async () => {
    const lastRequest = lastRequestRef.current;
    if (!lastRequest || isStreaming) return;
    updateMessages((current) =>
      current.filter((message) => message.id !== lastRequest.assistantMessageId),
    );
    await performRequest(lastRequest.prompt, lastRequest.context, false);
  }, [isStreaming, performRequest, updateMessages]);

  const abortResponse = useCallback(() => chatAbortRef.current?.abort(), []);

  const clearConversation = useCallback(() => {
    requestSequenceRef.current += 1;
    chatAbortRef.current?.abort();
    analysisAbortRef.current?.abort();
    emailAbortRef.current?.abort();
    chatAbortRef.current = undefined;
    analysisAbortRef.current = undefined;
    emailAbortRef.current = undefined;
    lastRequestRef.current = undefined;
    updateMessages([welcomeMessage]);
    setDraft('');
    setActiveContext(undefined);
    setIsStreaming(false);
    setConnectionState('idle');
    setError(undefined);
    setRecruiterAnalysis(initialRecruiterState);
    setResumeEmailVisible(false);
    setResumeEmailState(initialResumeEmailState);
  }, [updateMessages]);

  const runJobAnalysis = useCallback(async (jobDescription: string) => {
    const trimmedDescription = jobDescription.trim().slice(0, 12_000);
    if (trimmedDescription.length < 40) {
      setRecruiterAnalysis({
        status: 'error',
        error: 'Paste at least 40 characters so the evidence comparison is meaningful.',
        usedFallback: false,
      });
      return;
    }

    analysisAbortRef.current?.abort();
    const controller = new AbortController();
    analysisAbortRef.current = controller;
    setRecruiterAnalysis({ status: 'loading', usedFallback: false });

    try {
      const result = await analyzeJobDescription(trimmedDescription, controller.signal);
      if (controller.signal.aborted) return;
      setRecruiterAnalysis({ status: 'success', result, usedFallback: false });
    } catch (analysisError) {
      if (isAbortError(analysisError) || controller.signal.aborted) {
        setRecruiterAnalysis(initialRecruiterState);
        return;
      }
      const localResult = analyzeJobDescriptionLocally(trimmedDescription);
      setRecruiterAnalysis({
        status: 'success',
        result: localResult,
        error: 'Live analysis is unavailable; this report uses a transparent local keyword comparison.',
        usedFallback: true,
      });
    } finally {
      if (analysisAbortRef.current === controller) analysisAbortRef.current = undefined;
    }
  }, []);

  const abortJobAnalysis = useCallback(() => analysisAbortRef.current?.abort(), []);
  const clearJobAnalysis = useCallback(() => {
    analysisAbortRef.current?.abort();
    setRecruiterAnalysis(initialRecruiterState);
  }, []);

  const sendResumeEmail = useCallback(async (request: ResumeEmailRequest) => {
    const recipientEmail = request.recipientEmail.trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);
    if (!validEmail || recipientEmail.length > 254) {
      setResumeEmailState({
        status: 'error',
        message: 'Enter a valid recipient email address.',
      });
      return;
    }

    emailAbortRef.current?.abort();
    const controller = new AbortController();
    emailAbortRef.current = controller;
    setResumeEmailState({ status: 'sending' });

    try {
      const result = await requestResumeEmail(
        {
          recipientEmail,
          ...(request.recipientName?.trim()
            ? { recipientName: request.recipientName.trim().slice(0, 100) }
            : {}),
          ...(request.company?.trim() ? { company: request.company.trim().slice(0, 120) } : {}),
          ...(request.website ? { website: request.website } : {}),
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setResumeEmailState({ status: 'success', message: result.message });
    } catch (emailError) {
      if (isAbortError(emailError) || controller.signal.aborted) {
        setResumeEmailState(initialResumeEmailState);
        return;
      }
      setResumeEmailState({
        status: 'error',
        message: messageFromError(
          emailError,
          'The resume could not be sent. Please try again when the backend is available.',
        ),
      });
    } finally {
      if (emailAbortRef.current === controller) emailAbortRef.current = undefined;
    }
  }, []);

  const resetResumeEmailState = useCallback(
    () => setResumeEmailState(initialResumeEmailState),
    [],
  );

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<AssistantOpenDetail>).detail ?? {};
      openAssistant(detail);
      if (detail.autoSend && detail.prompt && !isStreaming) {
        window.setTimeout(() => void sendMessage(detail.prompt, detail.context), 0);
      }
    };

    window.addEventListener(ASSISTANT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, handleOpen);
  }, [isStreaming, openAssistant, sendMessage]);

  useEffect(() => {
    const handleTourControl = (event: Event) => {
      const detail = (event as CustomEvent<TourControlDetail>).detail;
      if (!detail) return;
      if (detail.action === 'start') startTour(detail.stepIndex);
      if (detail.action === 'next') nextTourStep();
      if (detail.action === 'previous') previousTourStep();
      if (detail.action === 'stop') stopTour();
    };

    window.addEventListener(TOUR_CONTROL_EVENT, handleTourControl);
    return () => window.removeEventListener(TOUR_CONTROL_EVENT, handleTourControl);
  }, [nextTourStep, previousTourStep, startTour, stopTour]);

  useEffect(
    () => () => {
      chatAbortRef.current?.abort();
      analysisAbortRef.current?.abort();
      emailAbortRef.current?.abort();
    },
    [],
  );

  const suggestions = useMemo(() => {
    const latestSuggestions = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant' && message.response?.suggestions.length)
      ?.response?.suggestions;
    return (latestSuggestions ?? DEFAULT_ASSISTANT_SUGGESTIONS).slice(0, 4);
  }, [messages]);

  const value = useMemo<AssistantContextValue>(
    () => ({
      isOpen,
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
      resumeEmailState,
      tour,
      openAssistant,
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
      showResumeEmail,
      hideResumeEmail,
      sendResumeEmail,
      resetResumeEmailState,
      startTour,
      nextTourStep,
      previousTourStep,
      stopTour,
    }),
    [
      abortJobAnalysis,
      abortResponse,
      activeContext,
      clearConversation,
      clearJobAnalysis,
      closeAssistant,
      connectionState,
      draft,
      error,
      executeAction,
      hideResumeEmail,
      isOpen,
      isStreaming,
      messages,
      mode,
      nextTourStep,
      openAssistant,
      previousTourStep,
      recruiterAnalysis,
      resetResumeEmailState,
      resumeEmailState,
      resumeEmailVisible,
      retryLast,
      runJobAnalysis,
      sendMessage,
      sendResumeEmail,
      setMode,
      showResumeEmail,
      startTour,
      stopTour,
      suggestions,
      tour,
    ],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) throw new Error('useAssistant must be used within AssistantProvider.');
  return context;
};

export const getTourSectionId = (tourState: TourState): PortfolioSectionId =>
  TOUR_SECTION_IDS[tourState.index] ?? 'home';
