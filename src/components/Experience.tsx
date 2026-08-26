import { Bot, BriefcaseBusiness, GraduationCap, MapPin } from 'lucide-react';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { portfolio } from '../data/portfolio';

const Experience = () => (
  <section id="experience" className="bg-background py-20 sm:py-28" aria-labelledby="experience-heading">
    <div className="section-shell">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="section-kicker">Professional timeline</p>
          <h2 id="experience-heading" className="section-title">
            Professional experience and education.
          </h2>
          <p className="section-copy">
            Selected highlights focus on measurable AI engineering outcomes, production workflows,
            and data-analysis impact.
          </p>
        </div>
        <button
          type="button"
          className="button-secondary w-fit"
          onClick={() =>
            openPortfolioAssistant({
              prompt: 'Summarize Omkar’s verified professional experience and connect it to relevant projects.',
              autoSend: true,
              context: { sectionId: 'experience' },
            })
          }
        >
          <Bot className="size-4" aria-hidden="true" />
          Ask AI about experience
        </button>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h3 className="flex items-center gap-3 text-xl font-bold text-foreground">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </span>
            Experience
          </h3>
          <ol className="relative mt-7 space-y-6 border-l border-border pl-6 sm:pl-8">
            {portfolio.experience.map((experience) => (
              <li key={experience.id} id={`experience-${experience.id}`} className="relative">
                <span className="absolute -left-[1.86rem] top-7 size-3 rounded-full border-2 border-background bg-brand-500 ring-4 ring-brand-500/15 sm:-left-[2.36rem]" aria-hidden="true" />
                <article className="surface-card p-6 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xl font-bold text-foreground">{experience.title}</h4>
                      <p className="mt-1 font-semibold text-brand-600 dark:text-brand-400">{experience.employer}</p>
                    </div>
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Experience
                    </span>
                  </div>
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <MapPin className="size-4" aria-hidden="true" />
                    {experience.location} · {experience.work_mode}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">{experience.period_label}</p>

                  <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                    {experience.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${experience.title} technologies`}>
                    {experience.technologies.map((technology) => (
                      <li key={technology} className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        {technology}
                      </li>
                    ))}
                  </ul>

                  {experience.status_note && <p className="mt-5 text-xs leading-5 text-muted-foreground">{experience.status_note}</p>}
                </article>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="flex items-center gap-3 text-xl font-bold text-foreground">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            Education
          </h3>
          <div className="mt-7 space-y-5">
            {portfolio.education.map((education) => (
              <article key={education.id} id={`education-${education.id}`} className="surface-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-foreground">{education.qualification}</h4>
                    <p className="mt-1 text-sm font-semibold text-violet-600 dark:text-violet-400">{education.institution}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-muted-foreground">{education.completion_year}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {education.location} · {education.score}
                </p>
                {education.needs_confirmation && education.note && (
                  <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                    Source note: {education.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Experience;
