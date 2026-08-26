import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Bot } from 'lucide-react';
import mockup from '../assets/mockup.png';
import {
  openPortfolioAssistant,
  PROJECTS_FILTER_EVENT,
  type ProjectsFilterDetail,
} from '../data/assistantEvents';
import {
  getProjectImage,
  portfolio,
  PROJECT_CATEGORIES,
  slugify,
} from '../data/portfolio';
import SplitText from './SplitText';

const PROJECT_ORDER = [
  'portfolio-website',
  'weather-dashboard',
  'ai-chat-application',
  'loan-onboarding-system',
  'rideasy-bike-booking',
] as const;

const PROJECT_RANK = new Map<string, number>(
  PROJECT_ORDER.map((projectId, index) => [projectId, index] as const),
);

const normalizeCategory = (value: string) =>
  PROJECT_CATEGORIES.find((category) => slugify(category) === slugify(value));

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 transition-all group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

const LiveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 2S8 6 8 10a4 4 0 0 0 8 0c0-4-4-8-4-8ZM6 14a6 6 0 0 0 12 0c0-3-3-6-3-6s1 3-3 6a6 6 0 0 1-6 0Z" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 .5C5.37.5 0 5.87 0 12.5a12 12 0 0 0 8.21 11.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.86 2.84 1.32 3.54 1.01.11-.78.42-1.32.76-1.63-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.16 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.64.24 2.86.12 3.16.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.65-5.47 5.95.43.38.81 1.12.81 2.26v3.35c0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
  </svg>
);

const Projects = () => {
  const headingRef = useRef(null);
  const isInView = useInView(headingRef, { once: true, margin: '-100px' });
  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState('All');
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const clearHighlightTimer = useRef<number | null>(null);

  const visibleProjects = useMemo(() => {
    const filtered =
      activeCategory === 'All'
        ? portfolio.projects
        : portfolio.projects.filter((project) => project.categories.includes(activeCategory));

    return [...filtered].sort(
      (first, second) =>
        (PROJECT_RANK.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
        (PROJECT_RANK.get(second.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [activeCategory]);

  useEffect(() => {
    const handleProjectFilter = (event: Event) => {
      const { category, projectId } = (event as CustomEvent<ProjectsFilterDetail>).detail;
      const project = projectId
        ? portfolio.projects.find((item) => item.id === projectId.replace(/^project-/, ''))
        : undefined;
      const requestedCategory = category ? normalizeCategory(category) : undefined;

      if (project) {
        setActiveCategory(
          requestedCategory &&
            (requestedCategory === 'All' || project.categories.includes(requestedCategory))
            ? requestedCategory
            : 'All',
        );
        setPendingProjectId(project.id);
      } else if (requestedCategory) {
        setActiveCategory(requestedCategory);
        document.getElementById('projects')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    };

    window.addEventListener(PROJECTS_FILTER_EVENT, handleProjectFilter);
    return () => window.removeEventListener(PROJECTS_FILTER_EVENT, handleProjectFilter);
  }, []);

  useEffect(() => {
    if (!pendingProjectId) return;

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(`project-${pendingProjectId}`);
      if (!target) return;

      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      });
      target.classList.add('portfolio-highlight');
      const title = target.querySelector<HTMLElement>('h3');
      if (title) {
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
      }

      if (clearHighlightTimer.current) window.clearTimeout(clearHighlightTimer.current);
      clearHighlightTimer.current = window.setTimeout(
        () => target.classList.remove('portfolio-highlight'),
        1900,
      );
      setPendingProjectId(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeCategory, pendingProjectId]);

  useEffect(
    () => () => {
      if (clearHighlightTimer.current) window.clearTimeout(clearHighlightTimer.current);
    },
    [],
  );

  const containerVariants = {
    hidden: { opacity: reduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.6 },
    },
  };

  return (
    <section
      id="projects"
      className="bg-surface py-20 sm:py-28"
      aria-labelledby="projects-heading"
    >
      <div className="section-shell">
        <div ref={headingRef} className="max-w-3xl">
          <p className="section-kicker">Selected work</p>
          <h2 id="projects-heading" className="section-title">
            Projects that connect software foundations with applied AI.
          </h2>
          <p className="section-copy">
            Filter by domain, inspect the implementation evidence, or ask the portfolio assistant
            for the project most relevant to a role.
          </p>
        </div>

        <div
          className="mb-14 mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects by category"
        >
          {PROJECT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              data-project-filter={slugify(category)}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeCategory === category
                  ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'border-border bg-background text-muted-foreground hover:border-brand-400 hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {activeCategory !== 'All' && (
          <div className="mb-10 flex justify-center" aria-live="polite">
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <span>
                Showing {visibleProjects.length} {activeCategory}{' '}
                {visibleProjects.length === 1 ? 'project' : 'projects'}
              </span>
              <button
                type="button"
                data-project-filter="all"
                onClick={() => setActiveCategory('All')}
                className="min-h-11 rounded-full px-3 font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
              >
                Show all
              </button>
            </div>
          </div>
        )}

        {visibleProjects.map((project, index) => {
          const screenshot = getProjectImage(project.id);

          return (
            <motion.article
              key={project.id}
              id={`project-${project.id}`}
              data-project-id={project.id}
              data-project-categories={project.categories.map(slugify).join(' ')}
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative mb-20"
            >
              <motion.div
                variants={itemVariants}
                className="grid items-start gap-10 md:grid-cols-12"
              >
                <div className="relative mb-6 flex justify-center md:col-span-5 md:mb-0 md:justify-start">
                  {screenshot && (
                    <div className="absolute left-1/2 top-1 h-[74%] w-[80%] -translate-x-1/2 overflow-hidden rounded-md sm:left-4 sm:top-1 sm:h-[70%] sm:w-[82%] sm:translate-x-0 md:left-[10%] md:top-[2%] md:h-[72%] md:w-[81%]">
                      <img
                        src={screenshot.src}
                        width={screenshot.width}
                        height={screenshot.height}
                        alt={`Screenshot of ${project.title}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <img
                    src={mockup}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none relative z-10 h-auto w-[450px] select-none"
                  />
                </div>

                <div className="flex flex-col justify-start px-3 md:col-span-7 md:px-0">
                  <SplitText
                    tag="h3"
                    text={project.title}
                    className="mb-4 inline-block text-2xl font-semibold text-gray-900 dark:text-white"
                    textAlign="left"
                    delay={reduceMotion ? 0 : 100}
                    duration={reduceMotion ? 0 : 0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="-100px"
                  />

                  <ul className="mb-6 max-w-full list-outside list-disc space-y-6 pl-8 text-lg text-muted-foreground dark:text-gray-300">
                    {project.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>

                  <ul
                    className="mb-7 flex flex-wrap gap-4"
                    aria-label={`${project.title} technologies`}
                  >
                    {project.technologies.map((technology) => (
                      <li
                        key={technology}
                        className="rounded-full bg-gray-100 px-7 py-3 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >
                        {technology}
                      </li>
                    ))}
                  </ul>

                  {project.source_note && (
                    <p className="-mt-3 mb-6 text-sm leading-6 text-muted-foreground dark:text-gray-400">
                      {project.source_note}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4">
                    {project.links.live && (
                      <a
                        href={project.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex min-h-11 items-center justify-center gap-2 rounded-full border-2 bg-black px-5 py-2.5 text-base font-medium text-white transition-all hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-white dark:text-black"
                      >
                        <LiveIcon />
                        View Live
                        <ArrowIcon />
                      </a>
                    )}

                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex min-h-11 items-center justify-center gap-2 rounded-full border-2 bg-white px-5 py-2.5 text-base font-medium text-black transition-all hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-black dark:text-white"
                      >
                        <GitHubIcon />
                        View Code
                        <ArrowIcon />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        openPortfolioAssistant({
                          prompt: `Explain Omkar's ${project.title} project, including the architecture and his verified contribution.`,
                          autoSend: true,
                          context: { projectId: project.id, sectionId: 'projects' },
                        })
                      }
                      className="group/link flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-base font-medium text-white transition-all hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <Bot className="size-5 shrink-0" aria-hidden="true" />
                      Ask AI about this project
                      <ArrowIcon />
                    </button>
                  </div>
                </div>
              </motion.div>

              {index < visibleProjects.length - 1 && (
                <div className="mt-16 border-t border-gray-200 dark:border-gray-700" />
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default Projects;
