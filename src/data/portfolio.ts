import portfolioRaw from '../../data/portfolio.json?raw';
import aiChatImage480 from '../assets/AIchat-480.webp';
import aiChatImage960 from '../assets/AIchat-960.webp';
import bikeImage470 from '../assets/Bikeimg-470.webp';
import bikeImage940 from '../assets/Bikeimg-940.webp';
import loanImage480 from '../assets/LOS-480.webp';
import loanImage960 from '../assets/LOS-960.webp';
import portfolioImage480 from '../assets/Portfolioimg-480.webp';
import portfolioImage960 from '../assets/Portfolioimg-960.webp';
import profilePortrait426 from '../assets/Person-426.webp';
import profilePortrait768 from '../assets/Person-768.webp';
import resumeUrl from '../assets/Resume.pdf';
import weatherImage480 from '../assets/Weatherimg-480.webp';
import weatherImage960 from '../assets/Weatherimg-960.webp';

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
  year: number | null;
  asset: string;
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
  srcSet: string;
  sizes: string;
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
export const PROFILE_PORTRAIT: ImageAsset = {
  src: profilePortrait426,
  srcSet: `${profilePortrait426} 426w, ${profilePortrait768} 768w`,
  sizes: '(min-width: 640px) 384px, calc(100vw - 72px)',
  width: 426,
  height: 539,
};

const PROJECT_IMAGE_SIZES =
  '(min-width: 1280px) 380px, (min-width: 768px) 32vw, 80vw';

const projectImages: Record<string, ImageAsset> = {
  'ai-chat-application': {
    src: aiChatImage480,
    srcSet: `${aiChatImage480} 480w, ${aiChatImage960} 960w`,
    sizes: PROJECT_IMAGE_SIZES,
    width: 480,
    height: 226,
  },
  'portfolio-website': {
    src: portfolioImage480,
    srcSet: `${portfolioImage480} 480w, ${portfolioImage960} 960w`,
    sizes: PROJECT_IMAGE_SIZES,
    width: 480,
    height: 236,
  },
  'weather-dashboard': {
    src: weatherImage480,
    srcSet: `${weatherImage480} 480w, ${weatherImage960} 960w`,
    sizes: PROJECT_IMAGE_SIZES,
    width: 480,
    height: 269,
  },
  'rideasy-bike-booking': {
    src: bikeImage470,
    srcSet: `${bikeImage470} 470w, ${bikeImage940} 940w`,
    sizes: PROJECT_IMAGE_SIZES,
    width: 470,
    height: 264,
  },
  'loan-onboarding-system': {
    src: loanImage480,
    srcSet: `${loanImage480} 480w, ${loanImage960} 960w`,
    sizes: PROJECT_IMAGE_SIZES,
    width: 480,
    height: 224,
  },
};

const certificationAssets: Readonly<Record<string, ImageAsset>> = {};

export const getProjectImage = (projectId: string): ImageAsset | undefined => projectImages[projectId];

export const getCertificationAsset = (assetPath: string): ImageAsset | undefined => certificationAssets[assetPath];

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getSkillId = (name: string) => slugify(name);
