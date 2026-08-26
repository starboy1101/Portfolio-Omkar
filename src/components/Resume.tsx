import { Bot, Download, ExternalLink, FileText, Mail } from 'lucide-react';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { portfolio, RESUME_URL } from '../data/portfolio';

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
            <p className="section-kicker mt-6">Résumé</p>
            <h2 id="resume-heading" className="section-title">
              Review the source behind Omkar’s experience and education.
            </h2>
            <p className="section-copy">
              Open or download the résumé, ask a focused question about it, or request a copy through the portfolio assistant.
            </p>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Portfolio content was last updated from the supplied sources on {portfolio.last_verified_from_sources}.
            </p>
          </div>

          <div className="flex min-w-64 flex-col gap-3">
            <a href={RESUME_URL} target="_blank" rel="noreferrer" className="button-primary">
              <ExternalLink className="size-4" aria-hidden="true" />
              View résumé PDF
            </a>
            <a href={RESUME_URL} download="Omkar_Mahabdi_Resume.pdf" className="button-secondary">
              <Download className="size-4" aria-hidden="true" />
              Download résumé
            </a>
            <button
              type="button"
              className="button-secondary"
              onClick={() =>
                openPortfolioAssistant({
                  prompt: 'Summarize Omkar’s résumé for a recruiter and cite the most relevant experience and skills.',
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
              Request by email
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Resume;
