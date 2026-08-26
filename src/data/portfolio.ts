import portfolioRaw from '../../data/portfolio.json?raw';
import aiChatImage from '../assets/AIchat.png';
import bikeImage from '../assets/Bikeimg.png';
import dataScienceBadge from '../assets/Datascience.png';
import generativeAiBadge from '../assets/Genai.png';
import loanImage from '../assets/LOS.png';
import portfolioImage from '../assets/Portfolioimg.png';
import profilePortrait from '../assets/Person.png';
import resumeUrl from '../assets/Resume.pdf';
import vectorSearchBadge from '../assets/vector.png';
import weatherImage from '../assets/Weatherimg.png';
import aiFoundationsBadge from '../assets/associate.jpeg';

export interface SocialLink {
  id: 'github' | 'linkedin' | 'instagram' | string;
  label: string;
  url: string;
  source_level?: string;
}

export interface PortfolioProfile {
  id: string;
  full_name: string;
  display_name: string;
  headline: string;
  positioning: string;
  summary: string;
  location: {
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  contact: {
    email: string;
    phone_display: string;
    phone_e164: string;
  };
  social_links: SocialLink[];
  portfolio_url: string;
}

export interface PortfolioExperience {
  id: string;
  employer: string;
  title: string;
  location: string;
  work_mode: string;
  start_date: string;
  end_date: string | null;
  period_label: string;
  status_note?: string;
  highlights: string[];
  technologies: string[];
  source: string;
}

export interface PortfolioEducation {
  id: string;
  institution: string;
  location: string;
  qualification: string;
  completion_year: number;
  score: string;
  needs_confirmation?: boolean;
  note?: string;
  source: string;
}

export interface PortfolioAchievement {
  id: string;
  title: string;
  description: string;
  source: string;
}

export interface PortfolioSkill {
  name: string;
  evidence: string[];
}

export interface PortfolioSkillCategory {
  id: string;
  label: string;
  skills: PortfolioSkill[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  aliases?: string[];
  short_description: string;
  highlights: string[];
  technologies: string[];
  categories: string[];
  links: {
    github?: string;
    live?: string;
  };
  source: string;
  source_note?: string;
}

export interface PortfolioCertification {
  id: string;
  title: string;
  issuer: string;
  year: number;
  asset: string;
  verification_status: string;
  verification_note: string;
}

export interface PortfolioData {
  schema_version: string;
  last_verified_from_sources: string;
  source_policy: {
    primary: string;
    secondary: string[];
    rules: string[];
  };
  profile: PortfolioProfile;
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
  achievements: PortfolioAchievement[];
  skill_categories: PortfolioSkillCategory[];
  projects: PortfolioProject[];
  certifications: PortfolioCertification[];
  known_unknowns: string[];
}

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
}

const parsedPortfolio = JSON.parse(portfolioRaw) as PortfolioData;

if (parsedPortfolio.schema_version !== '1.0.0') {
  throw new Error(`Unsupported portfolio schema: ${parsedPortfolio.schema_version}`);
}

export const portfolio = parsedPortfolio;

export type PortfolioSectionId =
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'certifications'
  | 'resume'
  | 'contact';

export const SECTION_LINKS: ReadonlyArray<{ id: PortfolioSectionId; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'resume', label: 'Resume' },
  { id: 'contact', label: 'Contact' },
];

export const TOUR_SECTION_IDS: readonly PortfolioSectionId[] = [
  'home',
  'experience',
  'skills',
  'projects',
  'certifications',
  'resume',
  'contact',
];

export const PROJECT_CATEGORIES = [
  'All',
  ...Array.from(new Set(portfolio.projects.flatMap((project) => project.categories))),
];

export const RESUME_URL = resumeUrl;
export const PROFILE_PORTRAIT: ImageAsset = { src: profilePortrait, width: 426, height: 586 };

const projectImages: Record<string, ImageAsset> = {
  'ai-chat-application': { src: aiChatImage, width: 1919, height: 903 },
  'portfolio-website': { src: portfolioImage, width: 1891, height: 931 },
  'weather-dashboard': { src: weatherImage, width: 1917, height: 1074 },
  'rideasy-bike-booking': { src: bikeImage, width: 940, height: 529 },
  'loan-onboarding-system': { src: loanImage, width: 1892, height: 882 },
};

const certificationAssets: Record<string, ImageAsset> = {
  'src/assets/Genai.png': { src: generativeAiBadge, width: 255, height: 276 },
  'src/assets/Datascience.png': { src: dataScienceBadge, width: 253, height: 276 },
  'src/assets/vector.png': { src: vectorSearchBadge, width: 249, height: 276 },
  'src/assets/associate.jpeg': { src: aiFoundationsBadge, width: 265, height: 276 },
};

export const getProjectImage = (projectId: string): ImageAsset | undefined => projectImages[projectId];

export const getCertificationAsset = (assetPath: string): ImageAsset | undefined => certificationAssets[assetPath];

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getSkillId = (name: string) => slugify(name);
