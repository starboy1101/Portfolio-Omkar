import { useRef, useState } from 'react';
import { Bot, ChevronRight } from 'lucide-react';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { getCertificationAsset, portfolio } from '../data/portfolio';

const Certification = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const showNextCertification = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cards = Array.from(carousel.querySelectorAll<HTMLElement>('[data-certification-card]'));
    if (cards.length < 2) return;

    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const maximumScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    const maximumIndex = step > 0 ? Math.ceil(maximumScroll / step) : 0;
    const nextIndex = carouselIndex >= maximumIndex ? 0 : carouselIndex + 1;

    setCarouselIndex(nextIndex);
    carousel.scrollTo({
      left: nextIndex === maximumIndex ? maximumScroll : nextIndex * step,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      id="certifications"
      className="bg-surface py-20 sm:py-28"
      aria-labelledby="certifications-heading"
    >
      <div className="section-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-kicker">Continued learning</p>
            <h2 id="certifications-heading" className="section-title">
              Certifications across AI, data, Python, and cloud technologies.
            </h2>
            <p className="section-copy">
              Browse the current certification list. Image spaces are reserved for credential
              artwork that will be added later.
            </p>
          </div>
          <button
            type="button"
            className="button-secondary w-fit"
            onClick={() =>
              openPortfolioAssistant({
                prompt: 'Summarize Omkar’s listed AI, data, Python, and cloud certifications.',
                autoSend: true,
                context: { sectionId: 'certifications' },
              })
            }
          >
            <Bot className="size-4" aria-hidden="true" />
            Ask AI about certifications
          </button>
        </div>

        <div
          className="relative mt-12"
          role="region"
          aria-roledescription="carousel"
          aria-label="Professional certifications"
        >
          <div id="certification-track" ref={carouselRef} className="overflow-hidden">
            <ul className="flex items-stretch gap-5">
              {portfolio.certifications.map((certification) => {
                const asset = getCertificationAsset(certification.asset);
                return (
                  <li
                    key={certification.id}
                    data-certification-card
                    className="min-w-0 shrink-0 basis-full sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-3.75rem)/4)]"
                  >
                    <article
                      id={`certification-${certification.id}`}
                      className="surface-card flex h-full flex-col p-5"
                    >
                      <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-muted/40 p-4">
                        {asset && (
                          <img
                            src={asset.src}
                            width={asset.width}
                            height={asset.height}
                            alt={`${certification.title} certificate`}
                            loading="lazy"
                            decoding="async"
                            className="h-44 w-auto object-contain"
                          />
                        )}
                      </div>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {certification.issuer}
                        {certification.year ? ` · ${certification.year}` : ''}
                      </p>
                      <h3 className="mt-2 text-lg font-bold leading-6 text-foreground">
                        {certification.title}
                      </h3>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>

          {portfolio.certifications.length > 1 && (
            <button
              type="button"
              onClick={showNextCertification}
              aria-label="Show next certification"
              aria-controls="certification-track"
              className="absolute right-2 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-950/25 transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:-right-5"
            >
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Certification;
