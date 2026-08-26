export type PortfolioActionType =
  | 'NAVIGATE'
  | 'OPEN_PROJECT'
  | 'OPEN_RESUME'
  | 'DOWNLOAD_RESUME'
  | 'OPEN_GITHUB'
  | 'OPEN_LINKEDIN'
  | 'OPEN_CONTACT'
  | 'FILTER_PROJECTS'
  | 'HIGHLIGHT_SKILL'
  | 'SEND_RESUME_EMAIL'
  | 'SHOW_EXPERIENCE'
  | 'SHOW_CERTIFICATIONS'
  | 'ANALYZE_JD'
  | 'START_TOUR';

export interface PortfolioAction {
  type: PortfolioActionType;
  target?: string;
  label?: string;
  url?: string;
  payload?: Record<string, unknown>;
}

export interface SourceReference {
  type:
    | 'profile'
    | 'resume'
    | 'project'
    | 'experience'
    | 'education'
    | 'skill'
    | 'skills'
    | 'certification'
    | 'achievement'
    | 'contact';
  id: string;
  label?: string;
  title?: string;
  snippet?: string;
  url?: string;
  score?: number;
}

export interface MatchEvidence {
  requirement: string;
  evidence: string[];
  sourceIds?: string[];
}

export interface JobMatchResult {
  overallMatch: number;
  strongMatches: MatchEvidence[];
  partialMatches: MatchEvidence[];
  notFound: string[];
  relevantProjects: string[];
  summary: string;
  methodology?: string;
}

export interface AssistantResponse {
  message: string;
  sources: SourceReference[];
  actions: PortfolioAction[];
  suggestions: string[];
  match?: JobMatchResult;
  grounded?: boolean;
  fallbackUsed?: boolean;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ConversationTurn[];
  context?: {
    projectId?: string;
    skillId?: string;
    sectionId?: string;
  };
}

export interface StreamDeltaEvent {
  type: 'delta';
  delta: string;
}

export interface StreamCompleteEvent {
  type: 'complete';
  response: AssistantResponse;
}

export interface StreamErrorEvent {
  type: 'error';
  message: string;
}

export type ChatStreamEvent = StreamDeltaEvent | StreamCompleteEvent | StreamErrorEvent;

export interface ResumeEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  company?: string;
  website?: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  company?: string;
  role?: string;
  subject?: string;
  message: string;
  website?: string;
}

export interface ApiMessage {
  accepted?: boolean;
  message: string;
}
