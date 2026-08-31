import { useEffect, useState } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import {
  COOKIE_PREFERENCES_OPEN_EVENT,
  COOKIE_PREFERENCES_VISIBILITY_EVENT,
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from '../services/analytics';

const CookieBanner = () => {
  const [isOpen, setIsOpen] = useState(() => getAnalyticsConsent() === null);
  const [currentConsent, setCurrentConsent] = useState<AnalyticsConsent | null>(() =>
    getAnalyticsConsent(),
  );

  useEffect(() => {
    const openPreferences = () => setIsOpen(true);
    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_PREFERENCES_OPEN_EVENT, openPreferences);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(COOKIE_PREFERENCES_VISIBILITY_EVENT, { detail: { open: isOpen } }),
    );
  }, [isOpen]);

  const choose = (consent: AnalyticsConsent) => {
    setAnalyticsConsent(consent);
    setCurrentConsent(consent);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-4xl rounded-3xl border border-border bg-surface/95 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:bottom-5 sm:p-6"
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Cookie className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="cookie-banner-title" className="text-lg font-bold text-foreground">
                Your privacy, your choice
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Essential browser storage keeps your theme and consent choice. Optional Google
                Analytics loads only after you allow it and helps improve this portfolio.
              </p>
            </div>
            {currentConsent && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close cookie preferences"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button" className="button-primary" onClick={() => choose('granted')}>
              <ShieldCheck className="size-4" aria-hidden="true" />
              Allow analytics
            </button>
            <button type="button" className="button-secondary" onClick={() => choose('denied')}>
              Use essential only
            </button>
            <a
              href="/privacy"
              className="inline-flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-semibold text-brand-600 underline-offset-4 hover:underline dark:text-brand-400"
            >
              Read the privacy policy
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CookieBanner;
