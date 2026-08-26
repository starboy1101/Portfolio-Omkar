import { useEffect, useRef, useState } from 'react';
import { Braces, BrainCircuit, Code2, Database, Wrench } from 'lucide-react';
import {
  openPortfolioAssistant,
  SKILL_HIGHLIGHT_EVENT,
  type SkillHighlightDetail,
} from '../data/assistantEvents';
import { getSkillId, portfolio } from '../data/portfolio';

const categoryIcons = [Code2, BrainCircuit, Braces, Database, Braces, Code2, Database, Wrench];

const Skills = () => {
  const [highlightedSkillId, setHighlightedSkillId] = useState<string | null>(null);
  const clearHighlightTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleHighlight = (event: Event) => {
      const customEvent = event as CustomEvent<SkillHighlightDetail>;
      const normalizedId = getSkillId(customEvent.detail.skillId.replace(/^skill-/, ''));
      const target = document.getElementById(`skill-${normalizedId}`);
      if (!target) return;

      setHighlightedSkillId(normalizedId);
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      });
      target.focus({ preventScroll: true });

      if (clearHighlightTimer.current) window.clearTimeout(clearHighlightTimer.current);
      clearHighlightTimer.current = window.setTimeout(() => setHighlightedSkillId(null), 2200);
    };

    window.addEventListener(SKILL_HIGHLIGHT_EVENT, handleHighlight);
    return () => {
      window.removeEventListener(SKILL_HIGHLIGHT_EVENT, handleHighlight);
      if (clearHighlightTimer.current) window.clearTimeout(clearHighlightTimer.current);
    };
  }, []);

  return (
    <section id="skills" className="bg-background py-20 sm:py-28" aria-labelledby="skills-heading">
      <div className="section-shell">
        <div className="max-w-3xl">
          <p className="section-kicker">Technical toolkit</p>
          <h2 id="skills-heading" className="section-title">
            Skills organized by the work they support.
          </h2>
          <p className="section-copy">
            Select any skill to ask how Omkar used it and which experience or project supports it.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {portfolio.skill_categories.map((category, categoryIndex) => {
            const Icon = categoryIcons[categoryIndex] ?? Code2;
            return (
              <article key={category.id} id={`skill-category-${category.id}`} className="surface-card p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{category.label}</h3>
                </div>

                <ul className="mt-6 flex flex-wrap gap-2.5" aria-label={`${category.label} skills`}>
                  {category.skills.map((skill) => {
                    const skillId = getSkillId(skill.name);
                    const hasProjectEvidence = skill.evidence.some((evidence) => evidence.startsWith('project:'));
                    return (
                      <li key={skill.name}>
                        <button
                          id={`skill-${skillId}`}
                          type="button"
                          data-skill-id={skillId}
                          className={`relative inline-grid min-h-11 place-items-center rounded-full border px-3.5 py-2 text-center text-sm font-medium transition ${
                            highlightedSkillId === skillId
                              ? 'border-brand-500 bg-brand-100 text-brand-700 ring-4 ring-brand-500/20 dark:bg-brand-500/20 dark:text-brand-300'
                              : 'border-border bg-muted/70 text-foreground hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                          }`}
                          onClick={() =>
                            openPortfolioAssistant({
                              prompt: `Where has Omkar used ${skill.name}? Please cite the relevant experience or projects.`,
                              autoSend: true,
                              context: { skillId, sectionId: 'skills' },
                            })
                          }
                          aria-label={`Ask AI where Omkar used ${skill.name}`}
                        >
                          {skill.name}
                          {hasProjectEvidence && (
                            <span
                              className="absolute right-1.5 size-1.5 rounded-full bg-brand-500"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>

        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />
          Dot-marked skills have direct portfolio-project evidence.
        </p>
      </div>
    </section>
  );
};

export default Skills;
