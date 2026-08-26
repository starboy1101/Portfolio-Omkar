import { ArrowRight, Bot, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { portfolio } from '../data/portfolio';

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
} as const;

const focusAreas = ['Python', 'RAG', 'FAISS', 'FastAPI', 'PyTorch'];

const Hero = () => {
  const { profile } = portfolio;

  return (
    <section id="home" className="relative isolate overflow-hidden bg-background pb-20 pt-36 sm:pb-28 sm:pt-44">
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-40 dark:opacity-25"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgb(99 102 241 / 0.14) 1px, transparent 1px), linear-gradient(90deg, rgb(99 102 241 / 0.14) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'linear-gradient(to bottom, black, transparent 82%)',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500/25 to-violet-500/25 blur-3xl sm:h-[38rem] sm:w-[38rem]"
        aria-hidden="true"
      />

      <div className="section-shell grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div>
          <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-200 bg-brand-50/90 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            {profile.headline}
          </div>

          <h1 className="mt-7 max-w-4xl text-balance text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
            Building intelligent applications with{' '}
            <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Python, RAG and real-time LLM workflows.
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {profile.positioning} Explore verified experience, portfolio-backed AI work, and the systems behind each project.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="button-primary"
              onClick={() =>
                openPortfolioAssistant({
                  prompt: 'Tell me about Omkar and the work most relevant to an AI or Python engineering role.',
                  autoSend: true,
                  context: { sectionId: 'home' },
                })
              }
            >
              <Bot className="size-5" aria-hidden="true" />
              Ask My AI
            </button>
            <a href="#projects" className="button-secondary">
              View projects
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a href="#resume" className="button-secondary">
              View resume
            </a>
            <a href="#contact" className="button-secondary">
              Contact me
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-brand-500" aria-hidden="true" />
              {profile.location.city}, {profile.location.state}, {profile.location.country}
            </span>
            {profile.social_links
              .filter((link) => link.id === 'github' || link.id === 'linkedin')
              .map((link) => {
                const Icon = socialIcons[link.id as keyof typeof socialIcons];
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 font-medium text-muted-foreground transition hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {link.label}
                  </a>
                );
              })}
            <a
              href={`mailto:${profile.contact.email}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 font-medium text-muted-foreground transition hover:text-brand-600 dark:hover:text-brand-400"
            >
              <Mail className="size-4" aria-hidden="true" />
              Email
            </a>
          </div>
        </div>

        <aside className="surface-card relative overflow-hidden p-6 sm:p-8" aria-label="Recruiter quick scan">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500" />
          <p className="section-kicker">Recruiter quick scan</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">Production AI delivery with measurable retrieval performance.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Hands-on work spans document ingestion, semantic search, model improvement, FastAPI applications,
            Supabase-backed sessions, and real-time LLM response streaming.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Focus technologies">
            {focusAreas.map((area) => (
              <li key={area} className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                {area}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            onClick={() => openPortfolioAssistant({ mode: 'recruiter' })}
          >
            Start recruiter mode
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </aside>
      </div>
    </section>
  );
};

export default Hero;
