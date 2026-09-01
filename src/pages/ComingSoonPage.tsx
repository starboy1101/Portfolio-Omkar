import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  Bike,
  Boxes,
  BrainCircuit,
  ChartNoAxesCombined,
  CircleDashed,
  Github,
  Layers3,
  ShieldAlert,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import Seo from '../components/Seo';
import {
  GITHUB_PROFILE_URL,
  getProjectById,
  type PortfolioProject,
} from '../data/portfolio';

interface ComingSoonPageProps {
  projectId: string;
}

interface ProjectVisual {
  icon: LucideIcon;
  kicker: string;
  modules: readonly [string, string, string];
  gradient: string;
  glow: string;
  border: string;
  softSurface: string;
}

const projectVisuals: Record<string, ProjectVisual> = {
  'multimodal-image-text-classifier': {
    icon: BrainCircuit,
    kicker: 'Multimodal intelligence',
    modules: ['Visual encoder', 'Text encoder', 'Fusion & review'],
    gradient: 'from-fuchsia-500 via-violet-500 to-indigo-500',
    glow: 'bg-fuchsia-500/25',
    border: 'border-fuchsia-400/35',
    softSurface: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
  },
  'rideasy-bike-booking': {
    icon: Bike,
    kicker: 'Full-stack booking experience',
    modules: ['Ride discovery', 'Booking flow', 'Service API'],
    gradient: 'from-cyan-500 via-sky-500 to-indigo-500',
    glow: 'bg-cyan-500/25',
    border: 'border-cyan-400/35',
    softSurface: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  },
  'flipkart-price-analysis': {
    icon: ChartNoAxesCombined,
    kicker: 'Commerce analytics',
    modules: ['Data ingestion', 'SQL analysis', 'Decision dashboard'],
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    glow: 'bg-orange-500/25',
    border: 'border-orange-400/35',
    softSurface: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  },
  'supply-chain-inventory-analytics': {
    icon: Boxes,
    kicker: 'Operations intelligence',
    modules: ['Inventory health', 'Supplier signals', 'Fulfilment view'],
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glow: 'bg-emerald-500/25',
    border: 'border-emerald-400/35',
    softSurface: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
};

const fallbackVisual: ProjectVisual = {
  icon: Workflow,
  kicker: 'Product in development',
  modules: ['Discover', 'Build', 'Validate'],
  gradient: 'from-brand-500 via-violet-500 to-fuchsia-500',
  glow: 'bg-brand-500/25',
  border: 'border-brand-400/35',
  softSurface: 'bg-brand-500/10 text-brand-700 dark:text-brand-300',
};

const buildStages = [
  {
    title: 'Blueprint',
    copy: 'Clarify the problem, users, data, and success criteria before implementation.',
    icon: Layers3,
  },
  {
    title: 'Build',
    copy: 'Turn the approved direction into a testable end-to-end implementation.',
    icon: Workflow,
  },
  {
    title: 'Validate',
    copy: 'Test the experience, verify results, and publish only production-ready evidence.',
    icon: ShieldAlert,
  },
] as const;

const getRevealVariants = (reduceMotion: boolean): Variants => ({
  hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduceMotion
      ? { duration: 0 }
      : { type: 'spring', stiffness: 130, damping: 20, mass: 0.8 },
  },
});

const getContainerVariants = (reduceMotion: boolean): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: reduceMotion ? 0 : 0.08, delayChildren: reduceMotion ? 0 : 0.06 },
  },
});

const ProjectSignal = ({ project, visual }: { project: PortfolioProject; visual: ProjectVisual }) => {
  const reduceMotion = Boolean(useReducedMotion());
  const Icon = visual.icon;

  return (
    <motion.aside
      initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.94, y: reduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 100, damping: 18, mass: 0.9, delay: 0.12 }
      }
      className={`relative min-h-[30rem] overflow-hidden rounded-[2rem] border ${visual.border} bg-slate-950 text-white shadow-[0_30px_100px_-35px_rgba(15,23,42,0.75)]`}
      aria-label={`${project.title} development signal`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
          maskImage: 'linear-gradient(to bottom, black, transparent 86%)',
        }}
        aria-hidden="true"
      />
      <div className={`pointer-events-none absolute -right-20 -top-20 size-64 rounded-full blur-3xl ${visual.glow}`} aria-hidden="true" />
      <div className="relative z-10 flex min-h-[30rem] flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 backdrop-blur-md">
            <span className="relative flex size-2" aria-hidden="true">
              {!reduceMotion && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-emerald-300"
                  animate={{ opacity: [0.2, 0.75, 0.2], scale: [1, 1.8, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <span className="relative size-2 rounded-full bg-emerald-300" />
            </span>
            Build signal active
          </div>
          <CircleDashed className="size-5 text-slate-400" aria-hidden="true" />
        </div>

        <div className="relative my-auto grid min-h-64 place-items-center" aria-hidden="true">
          <motion.div
            className="absolute size-52 rounded-full border border-dashed border-white/25"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            <span className={`absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r ${visual.gradient} shadow-[0_0_18px_rgba(255,255,255,0.55)]`} />
            <span className="absolute bottom-3 right-3 size-2 rounded-full bg-white/70" />
          </motion.div>
          <div className={`absolute size-36 rounded-full bg-gradient-to-br ${visual.gradient} opacity-25 blur-2xl`} />
          <div className={`relative grid size-28 place-items-center rounded-[2rem] bg-gradient-to-br ${visual.gradient} shadow-2xl shadow-black/35`}>
            <Icon className="size-12" strokeWidth={1.6} />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {visual.modules.map((module, index) => (
            <motion.div
              key={module}
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.32 + index * 0.07 }}
              className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 backdrop-blur-md"
            >
              <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
                0{index + 1}
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-100">{module}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};

const ComingSoonPage = ({ projectId }: ComingSoonPageProps) => {
  const reduceMotion = Boolean(useReducedMotion());
  const project = getProjectById(projectId);

  if (!project) return null;

  const visual = projectVisuals[project.id] ?? fallbackVisual;
  const revealVariants = getRevealVariants(reduceMotion);
  const containerVariants = getContainerVariants(reduceMotion);
  const statusNote =
    project.status_note ??
    'Concept preview: imagery and project details reflect the current plan, not a finished product. The production version may differ as development continues.';

  return (
    <>
      <Seo
        title={`${project.title} — Coming Soon | Omkar Mahabdi`}
        description={`${project.title} is currently in development. Preview the project direction and follow Omkar Mahabdi on GitHub for production updates.`}
        path={`/projects/${project.id}`}
        imageAlt={`${project.title} concept project preview`}
      />

      <main id="portfolio-content" className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_18%_18%,rgba(99,102,241,0.18),transparent_33%),radial-gradient(circle_at_82%_24%,rgba(168,85,247,0.13),transparent_31%)]"
          aria-hidden="true"
        />

        <section className="section-shell relative" aria-labelledby="coming-soon-title">
          <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="min-w-0"
            >
              <motion.a
                variants={revealVariants}
                href="/#projects"
                className="group mb-6 flex min-h-11 w-fit items-center gap-2 rounded-full px-1 pr-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:mb-8"
              >
                <span className="grid size-9 place-items-center rounded-full border border-border bg-surface transition-colors group-hover:border-brand-400">
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                </span>
                Back to selected work
              </motion.a>

              <motion.div
                variants={revealVariants}
                className={`mb-5 flex w-fit max-w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase leading-5 tracking-[0.18em] ${visual.softSurface}`}
              >
                <Sparkles className="size-4 shrink-0" aria-hidden="true" />
                {visual.kicker}
              </motion.div>

              <motion.p variants={revealVariants} className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                In development · Coming soon
              </motion.p>

              <motion.h1
                id="coming-soon-title"
                variants={revealVariants}
                className="max-w-4xl text-balance text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl"
              >
                {project.title}
                <span className={`mt-2 block bg-gradient-to-r ${visual.gradient} bg-clip-text text-transparent`}>
                  is taking shape.
                </span>
              </motion.h1>

              <motion.p variants={revealVariants} className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {project.short_description} The work is still pre-release, and verified production
                details will be published as the build matures.
              </motion.p>

              <motion.div variants={revealVariants} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {GITHUB_PROFILE_URL && (
                  <a
                    href={GITHUB_PROFILE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="button-primary group w-full sm:w-auto"
                  >
                    <Github className="size-5" aria-hidden="true" />
                    Follow the build on GitHub
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                )}
                <a href="/#projects" className="button-secondary w-full sm:w-auto">
                  Explore live projects
                </a>
              </motion.div>

              <motion.div
                variants={revealVariants}
                role="note"
                aria-label="Concept preview notice"
                className="mt-8 flex max-w-2xl gap-3 rounded-2xl border border-amber-400/45 bg-amber-50/90 p-4 text-amber-950 shadow-sm dark:bg-amber-400/10 dark:text-amber-100"
              >
                <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-bold">Concept preview — not a finished product</p>
                  <p className="mt-1 text-sm leading-6 opacity-90">{statusNote}</p>
                </div>
              </motion.div>
            </motion.div>

            <ProjectSignal project={project} visual={visual} />
          </div>
        </section>

        <section className="section-shell relative mt-24 sm:mt-32" aria-labelledby="planned-scope-title">
          <div className="grid gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:gap-16">
            <div>
              <p className="section-kicker">Transparent by design</p>
              <h2 id="planned-scope-title" className="section-title">
                A plan now. Verified evidence when it ships.
              </h2>
              <p className="section-copy">
                This page separates product intent from delivered work. Until the implementation is
                production-ready, every feature, visual, and technical choice below should be read as
                planned scope.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              {buildStages.map((stage, index) => {
                const StageIcon = stage.icon;
                return (
                  <motion.article key={stage.title} variants={revealVariants} className="surface-card relative overflow-hidden p-5 sm:p-6">
                    <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                      0{index + 1}
                    </span>
                    <div className="mt-6 grid size-11 place-items-center rounded-2xl bg-muted text-foreground">
                      <StageIcon className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-foreground">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{stage.copy}</p>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="section-shell relative mt-24 sm:mt-32" aria-labelledby="project-direction-title">
          <div className="surface-card overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-end">
              <div>
                <p className="section-kicker">Project direction</p>
                <h2 id="project-direction-title" className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  The proposed focus for this build.
                </h2>
                <ul className="mt-7 space-y-4" aria-label="Planned project outcomes">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-base leading-7 text-muted-foreground">
                      <span className={`mt-2.5 size-2 shrink-0 rounded-full bg-gradient-to-r ${visual.gradient}`} aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-border bg-muted/60 p-5 sm:p-6">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Planned technology stack
                </p>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${project.title} planned technologies`}>
                  {project.technologies.map((technology) => (
                    <li key={technology} className="rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground shadow-sm">
                      {technology}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  Stack choices may change after prototyping, testing, and production constraints are evaluated.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell relative mt-24 sm:mt-32" aria-labelledby="github-updates-title">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-2xl shadow-slate-950/20 sm:px-10 sm:py-16 lg:px-16">
            <div className={`pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br ${visual.gradient} opacity-25 blur-3xl`} aria-hidden="true" />
            <div className="relative z-10 max-w-3xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
                Progress lives in public
              </p>
              <h2 id="github-updates-title" className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Want to see the final product, not just the promise?
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Follow Omkar on GitHub for implementation updates, validated results, source code,
                and the production release when it is ready.
              </p>
              {GITHUB_PROFILE_URL && (
                <a
                  href={GITHUB_PROFILE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <Github className="size-5" aria-hidden="true" />
                  Follow @starboy1101
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ComingSoonPage;
