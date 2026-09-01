import {
  filterPortfolioProjects,
  highlightPortfolioSkill,
  navigatePortfolio,
} from '../../data/assistantEvents';
import {
  getSkillId,
  portfolio,
  PROJECT_CATEGORIES,
  RESUME_URL,
  SECTION_LINKS,
} from '../../data/portfolio';
import type { PortfolioSectionId } from '../../data/portfolio';
import type { PortfolioAction, PortfolioActionType } from '../../types/assistant';

export interface ActionExecutorCallbacks {
  showResumeEmail: () => void;
  showRecruiterMode: () => void;
  startTour: () => void;
  prepareForNavigation: () => boolean;
}

const projectIds = new Set(portfolio.projects.map((project) => project.id));
const skillIds = new Set(
  portfolio.skill_categories.flatMap((category) =>
    category.skills.map((skill) => getSkillId(skill.name)),
  ),
);
const sectionIds = new Set<PortfolioSectionId>(SECTION_LINKS.map((section) => section.id));

const getPayloadString = (action: PortfolioAction, key: string) => {
  const value = action.payload?.[key];
  return typeof value === 'string' ? value : undefined;
};

const trustedSocialUrl = (socialId: 'github' | 'linkedin') =>
  portfolio.profile.social_links.find((social) => social.id === socialId)?.url;

const openTrustedUrl = (url: string | undefined) => {
  if (!url || typeof window === 'undefined') return false;
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (opened) opened.opener = null;
  return true;
};

const downloadTrustedResume = () => {
  if (typeof document === 'undefined') return false;
  const link = document.createElement('a');
  link.href = RESUME_URL;
  link.download = 'OmkarMahabdi_AIML.pdf';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
};

const runNavigation = (callback: () => void, defer: boolean) => {
  if (!defer || typeof window === 'undefined') {
    callback();
    return;
  }

  // Wait for a mobile sheet to unmount and/or a filtered card to render,
  // then make the destination heading the final visible/focused target.
  window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
};

const resolveProjectId = (action: PortfolioAction) =>
  action.target ?? getPayloadString(action, 'projectId');

const resolveSkillId = (action: PortfolioAction) => {
  const candidate = action.target ?? getPayloadString(action, 'skillId');
  return candidate ? getSkillId(candidate) : undefined;
};

const resolveSectionId = (action: PortfolioAction): PortfolioSectionId | undefined => {
  const candidate = action.target ?? getPayloadString(action, 'sectionId');
  return candidate && sectionIds.has(candidate as PortfolioSectionId)
    ? (candidate as PortfolioSectionId)
    : undefined;
};

const resolveCategory = (action: PortfolioAction) => {
  const candidate = action.target ?? getPayloadString(action, 'category');
  if (!candidate) return undefined;
  return PROJECT_CATEGORIES.find(
    (category) => category.toLowerCase() === candidate.toLowerCase(),
  );
};

export const isExecutableAction = (action: PortfolioAction) => {
  switch (action.type) {
    case 'OPEN_PROJECT':
      return projectIds.has(resolveProjectId(action) ?? '');
    case 'FILTER_PROJECTS':
      return Boolean(resolveCategory(action) || projectIds.has(resolveProjectId(action) ?? ''));
    case 'HIGHLIGHT_SKILL':
      return skillIds.has(resolveSkillId(action) ?? '');
    case 'NAVIGATE':
      return Boolean(resolveSectionId(action));
    case 'OPEN_RESUME':
    case 'DOWNLOAD_RESUME':
    case 'OPEN_GITHUB':
    case 'OPEN_LINKEDIN':
    case 'OPEN_CONTACT':
    case 'SEND_RESUME_EMAIL':
    case 'SHOW_EXPERIENCE':
    case 'SHOW_CERTIFICATIONS':
    case 'ANALYZE_JD':
    case 'START_TOUR':
      return true;
    default:
      return false;
  }
};

export const shouldAutoExecuteAction = (type: PortfolioActionType) =>
  [
    'NAVIGATE',
    'OPEN_PROJECT',
    'OPEN_CONTACT',
    'FILTER_PROJECTS',
    'HIGHLIGHT_SKILL',
    'SEND_RESUME_EMAIL',
    'SHOW_EXPERIENCE',
    'SHOW_CERTIFICATIONS',
    'ANALYZE_JD',
    'START_TOUR',
  ].includes(type);

export const executePortfolioAction = (
  action: PortfolioAction,
  callbacks: ActionExecutorCallbacks,
): boolean => {
  if (!isExecutableAction(action)) return false;

  switch (action.type) {
    case 'NAVIGATE': {
      const sectionId = resolveSectionId(action);
      if (!sectionId) return false;
      runNavigation(
        () => navigatePortfolio({ sectionId, highlight: true }),
        callbacks.prepareForNavigation(),
      );
      return true;
    }
    case 'OPEN_PROJECT': {
      const projectId = resolveProjectId(action);
      if (!projectId || !projectIds.has(projectId)) return false;
      const project = portfolio.projects.find((item) => item.id === projectId);
      callbacks.prepareForNavigation();
      if (project?.status === 'in-development' && typeof window !== 'undefined') {
        window.location.assign(`/projects/${project.id}`);
        return true;
      }
      filterPortfolioProjects({ projectId });
      runNavigation(
        () =>
          navigatePortfolio({
            sectionId: 'projects',
            targetId: `project-${projectId}`,
            highlight: true,
          }),
        true,
      );
      return true;
    }
    case 'FILTER_PROJECTS': {
      const projectId = resolveProjectId(action);
      const category = resolveCategory(action);
      if (projectId && projectIds.has(projectId)) {
        callbacks.prepareForNavigation();
        filterPortfolioProjects({ projectId });
        runNavigation(
          () =>
            navigatePortfolio({
              sectionId: 'projects',
              targetId: `project-${projectId}`,
              highlight: true,
            }),
          true,
        );
        return true;
      }
      if (!category) return false;
      filterPortfolioProjects({ category });
      runNavigation(
        () => navigatePortfolio({ sectionId: 'projects', highlight: true }),
        callbacks.prepareForNavigation(),
      );
      return true;
    }
    case 'HIGHLIGHT_SKILL': {
      const skillId = resolveSkillId(action);
      if (!skillId || !skillIds.has(skillId)) return false;
      highlightPortfolioSkill(skillId);
      runNavigation(
        () =>
          navigatePortfolio({
            sectionId: 'skills',
            targetId: `skill-${skillId}`,
            highlight: true,
          }),
        callbacks.prepareForNavigation(),
      );
      return true;
    }
    case 'OPEN_RESUME':
      return openTrustedUrl(RESUME_URL);
    case 'DOWNLOAD_RESUME':
      return downloadTrustedResume();
    case 'OPEN_GITHUB':
      return openTrustedUrl(trustedSocialUrl('github'));
    case 'OPEN_LINKEDIN':
      return openTrustedUrl(trustedSocialUrl('linkedin'));
    case 'OPEN_CONTACT':
      runNavigation(
        () => navigatePortfolio({ sectionId: 'contact', highlight: true }),
        callbacks.prepareForNavigation(),
      );
      return true;
    case 'SEND_RESUME_EMAIL':
      callbacks.showResumeEmail();
      return true;
    case 'SHOW_EXPERIENCE':
      runNavigation(
        () => navigatePortfolio({ sectionId: 'experience', highlight: true }),
        callbacks.prepareForNavigation(),
      );
      return true;
    case 'SHOW_CERTIFICATIONS':
      runNavigation(
        () => navigatePortfolio({ sectionId: 'certifications', highlight: true }),
        callbacks.prepareForNavigation(),
      );
      return true;
    case 'ANALYZE_JD':
      callbacks.showRecruiterMode();
      return true;
    case 'START_TOUR':
      callbacks.startTour();
      return true;
    default:
      return false;
  }
};

const ACTION_LABELS: Record<PortfolioActionType, string> = {
  NAVIGATE: 'Open section',
  OPEN_PROJECT: 'Show project',
  OPEN_RESUME: 'View resume',
  DOWNLOAD_RESUME: 'Download resume',
  OPEN_GITHUB: 'Open GitHub',
  OPEN_LINKEDIN: 'Open LinkedIn',
  OPEN_CONTACT: 'Open contact',
  FILTER_PROJECTS: 'Filter projects',
  HIGHLIGHT_SKILL: 'Show skill evidence',
  SEND_RESUME_EMAIL: 'Email resume',
  SHOW_EXPERIENCE: 'Show experience',
  SHOW_CERTIFICATIONS: 'Show certifications',
  ANALYZE_JD: 'Analyze a job description',
  START_TOUR: 'Start guided tour',
};

export const getTrustedActionLabel = (action: PortfolioAction) => {
  if (action.type === 'OPEN_PROJECT') {
    const project = portfolio.projects.find((item) => item.id === resolveProjectId(action));
    if (project) return `Show ${project.title}`;
  }
  return ACTION_LABELS[action.type];
};
