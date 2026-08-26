import type { PortfolioSectionId } from './portfolio';
import { getSkillId, SECTION_LINKS } from './portfolio';

export const ASSISTANT_OPEN_EVENT = 'portfolio:assistant-open';
export const PROJECTS_FILTER_EVENT = 'portfolio:projects-filter';
export const SKILL_HIGHLIGHT_EVENT = 'portfolio:skill-highlight';
export const PORTFOLIO_NAVIGATE_EVENT = 'portfolio:navigate';
export const TOUR_CONTROL_EVENT = 'portfolio:tour-control';

export interface AssistantOpenDetail {
  prompt?: string;
  autoSend?: boolean;
  mode?: 'chat' | 'recruiter';
  context?: {
    projectId?: string;
    skillId?: string;
    sectionId?: PortfolioSectionId;
  };
}

export interface ProjectsFilterDetail {
  category?: string;
  projectId?: string;
}

export interface SkillHighlightDetail {
  skillId: string;
}

export interface PortfolioNavigateDetail {
  sectionId: PortfolioSectionId;
  targetId?: string;
  highlight?: boolean;
}

export interface TourControlDetail {
  action: 'start' | 'next' | 'previous' | 'stop';
  stepIndex?: number;
}

const dispatchPortfolioEvent = <T>(name: string, detail: T) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<T>(name, { detail }));
};

export const openPortfolioAssistant = (detail: AssistantOpenDetail = {}) => {
  dispatchPortfolioEvent(ASSISTANT_OPEN_EVENT, detail);
};

export const filterPortfolioProjects = (detail: ProjectsFilterDetail) => {
  dispatchPortfolioEvent(PROJECTS_FILTER_EVENT, detail);
};

export const highlightPortfolioSkill = (skillId: string) => {
  dispatchPortfolioEvent<SkillHighlightDetail>(SKILL_HIGHLIGHT_EVENT, { skillId: getSkillId(skillId) });
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const temporarilyHighlight = (element: HTMLElement) => {
  element.classList.remove('portfolio-highlight');
  window.requestAnimationFrame(() => {
    element.classList.add('portfolio-highlight');
    window.setTimeout(() => element.classList.remove('portfolio-highlight'), 1800);
  });
};

export const navigatePortfolio = (detail: PortfolioNavigateDetail) => {
  const isKnownSection = SECTION_LINKS.some((section) => section.id === detail.sectionId);
  if (!isKnownSection || typeof document === 'undefined') return;

  const target = document.getElementById(detail.targetId ?? detail.sectionId);
  if (!target) return;

  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  if (detail.highlight !== false) temporarilyHighlight(target);

  const focusTarget = target.matches('section')
    ? target.querySelector<HTMLElement>('h1, h2, [data-section-heading]')
    : target;
  if (focusTarget) {
    if (!focusTarget.matches('a[href], button, input, select, textarea, [tabindex]')) {
      focusTarget.setAttribute('tabindex', '-1');
    }
    focusTarget.focus({ preventScroll: true });
  }

  window.history.replaceState(null, '', `#${detail.sectionId}`);
  dispatchPortfolioEvent(PORTFOLIO_NAVIGATE_EVENT, detail);
};

export const controlPortfolioTour = (detail: TourControlDetail) => {
  dispatchPortfolioEvent(TOUR_CONTROL_EVENT, detail);
};
