import { Award, Bot, Info } from 'lucide-react';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { getCertificationAsset, portfolio } from '../data/portfolio';

const Certification = () => (
  <section id="certifications" className="bg-surface py-20 sm:py-28" aria-labelledby="certifications-heading">
    <div className="section-shell">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="section-kicker">Continued learning</p>
          <h2 id="certifications-heading" className="section-title">
            AI and data certification badges represented in the portfolio.
          </h2>
          <p className="section-copy">
            These records are backed by badge assets in this repository. Credential IDs and public verification links are not currently available, so the cards state that limitation directly.
          </p>
        </div>
        <button
          type="button"
          className="button-secondary w-fit"
          onClick={() =>
            openPortfolioAssistant({
              prompt: 'Explain what Omkar’s listed AI and data certification badges cover, while preserving their verification limitations.',
              autoSend: true,
              context: { sectionId: 'certifications' },
            })
          }
        >
          <Bot className="size-4" aria-hidden="true" />
          Ask AI about badges
        </button>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {portfolio.certifications.map((certification) => {
          const asset = getCertificationAsset(certification.asset);
          return (
            <article
              key={certification.id}
              id={`certification-${certification.id}`}
              className="surface-card flex flex-col p-5"
            >
              <div className="grid min-h-52 place-items-center rounded-2xl bg-muted/70 p-4">
                {asset ? (
                  <img
                    src={asset.src}
                    width={asset.width}
                    height={asset.height}
                    alt={`${certification.title} badge`}
                    loading="lazy"
                    decoding="async"
                    className="h-44 w-auto object-contain"
                  />
                ) : (
                  <Award className="size-16 text-brand-500" aria-hidden="true" />
                )}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {certification.issuer} · {certification.year}
              </p>
              <h3 className="mt-2 text-lg font-bold leading-6 text-foreground">{certification.title}</h3>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {certification.verification_note}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default Certification;
