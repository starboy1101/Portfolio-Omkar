import { ArrowRight, Award, BarChart3, CheckCircle2, MapPin } from 'lucide-react';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { portfolio, PROFILE_PORTRAIT } from '../data/portfolio';

const About = () => {
  const { profile, achievements } = portfolio;

  return (
    <section id="about" className="bg-surface py-20 sm:py-28" aria-labelledby="about-heading">
      <div className="section-shell">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="relative mx-auto w-full max-w-md">
            <div
              className="absolute inset-8 rounded-[2.5rem] bg-gradient-to-br from-brand-500/30 to-fuchsia-500/30 blur-3xl"
              aria-hidden="true"
            />
            <div className="surface-card relative overflow-hidden bg-gradient-to-b from-brand-50 to-violet-100 p-5 dark:from-slate-800 dark:to-slate-900">
              <img
                src={PROFILE_PORTRAIT.src}
                srcSet={PROFILE_PORTRAIT.srcSet}
                sizes={PROFILE_PORTRAIT.sizes}
                width={PROFILE_PORTRAIT.width}
                height={PROFILE_PORTRAIT.height}
                alt={`Portrait of ${profile.full_name}`}
                loading="lazy"
                decoding="async"
                className="mx-auto h-auto w-full max-w-sm object-contain"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/30 bg-slate-950/80 p-4 text-white shadow-xl backdrop-blur">
                <p className="font-semibold">{profile.display_name}</p>
                <p className="mt-1 text-sm text-slate-200">{profile.headline}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-300">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {profile.location.city}, {profile.location.state}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="section-kicker">About</p>
            <h2 id="about-heading" className="section-title">
              Production-oriented AI engineering from document ingestion to real-time answers.
            </h2>
            <p className="section-copy">{profile.summary}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-500/30 dark:bg-brand-500/10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-foreground">Measured AI outcomes</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Reduced document retrieval latency from 45 seconds to under 500 milliseconds and improved
                      semantic retrieval accuracy to 92%+.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-500/30 dark:bg-violet-500/10">
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-foreground">Secondary analytics track</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Applies Python, SQL, Pandas, DuckDB, Tableau, and Streamlit to data preparation, EDA,
                      dashboarding, and business insight generation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <article key={achievement.id} className="rounded-2xl border border-border bg-background p-5">
                  <Award className="size-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold text-foreground">{achievement.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{achievement.description}</p>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="button-secondary mt-8"
              onClick={() =>
                openPortfolioAssistant({
                  prompt: 'Tell me about Omkar’s background using verified portfolio and résumé information.',
                  autoSend: true,
                  context: { sectionId: 'about' },
                })
              }
            >
              Ask AI about my background
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
