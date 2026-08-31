import { Bot, Download, ExternalLink, FileText, Mail } from 'lucide-react';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { portfolio, RESUME_URLS } from '../data/portfolio';

const Resume = () => (
  <section id="resume" className="bg-background py-20 sm:py-28" aria-labelledby="resume-heading">
    <div className="section-shell">
      <div className="surface-card relative overflow-hidden p-6 sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/15 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/20">
              <FileText className="size-7" aria-hidden="true" />
            </span>
            <p className="section-kicker mt-6">Role-specific résumés</p>
            <h2 id="resume-heading" className="section-title">
              Choose the résumé that matches the role you are hiring for.
            </h2>
            <p className="section-copy">
              Choose the role-specific résumé that matches your hiring track, ask a focused question, or request the
              primary AI/ML copy through the portfolio assistant.
            </p>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Portfolio content was last updated from the supplied sources on {portfolio.last_verified_from_sources}.
            </p>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3 lg:w-80">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Primary profile</p>
              <h3 className="mt-1 font-semibold text-foreground">AI/ML Engineer résumé</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <a href={RESUME_URLS.aiMl} target="_blank" rel="noreferrer" className="button-primary">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  View AI/ML résumé
                </a>
                <a href={RESUME_URLS.aiMl} download="OmkarMahabdi_AIML.pdf" className="button-secondary">
                  <Download className="size-4" aria-hidden="true" />
                  Download AI/ML résumé
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Secondary profile</p>
              <h3 className="mt-1 font-semibold text-foreground">Data Analyst résumé</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <a href={RESUME_URLS.dataAnalyst} target="_blank" rel="noreferrer" className="button-secondary">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  View Data résumé
                </a>
                <a href={RESUME_URLS.dataAnalyst} download="OmkarMahabdi_Data_Analyst_Resume.pdf" className="button-secondary">
                  <Download className="size-4" aria-hidden="true" />
                  Download Data résumé
                </a>
              </div>
            </div>
            <button
              type="button"
              className="button-secondary"
              onClick={() =>
                openPortfolioAssistant({
                  prompt: 'Summarize Omkar’s AI/ML-first profile and secondary data analytics evidence for a recruiter.',
                  autoSend: true,
                  context: { sectionId: 'resume' },
                })
              }
            >
              <Bot className="size-4" aria-hidden="true" />
              Ask about the résumé
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() =>
                openPortfolioAssistant({
                  prompt: 'I would like Omkar’s résumé emailed to me.',
                  autoSend: true,
                  context: { sectionId: 'resume' },
                })
              }
            >
              <Mail className="size-4" aria-hidden="true" />
              Request AI/ML résumé by email
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Resume;
