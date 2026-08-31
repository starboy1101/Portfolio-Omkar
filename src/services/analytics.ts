export type AnalyticsConsent = 'granted' | 'denied';

type AnalyticsEventParameters = Record<string, string | number | boolean | undefined>;

const CONSENT_STORAGE_KEY = 'omkar-portfolio-analytics-consent-v1';
const COOKIE_PREFERENCES_OPEN_EVENT = 'portfolio:cookie-preferences-open';
const COOKIE_PREFERENCES_VISIBILITY_EVENT = 'portfolio:cookie-preferences-visibility';
const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();

let analyticsInitialized = false;
let analyticsInitialization: Promise<boolean> | null = null;

const ensureGtag = () => {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });
};

const applyConsent = (consent: AnalyticsConsent) => {
  ensureGtag();
  window.gtag?.('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: consent,
  });
};

const clearAnalyticsCookies = () => {
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim();
    if (!name || !/^_ga(?:_|$)/.test(name)) return;
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  });
};

export const getAnalyticsConsent = (): AnalyticsConsent | null => {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
};

export const initializeAnalytics = (): Promise<boolean> => {
  if (!measurementId || getAnalyticsConsent() !== 'granted') return Promise.resolve(false);
  if (analyticsInitialized) return Promise.resolve(true);
  if (analyticsInitialization) return analyticsInitialization;

  analyticsInitialization = new Promise<boolean>((resolve) => {
    ensureGtag();
    window.gtag?.('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    applyConsent('granted');
    window.gtag?.('js', new Date());
    window.gtag?.('config', measurementId, {
      anonymize_ip: true,
      send_page_view: false,
    });

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-portfolio-analytics]');
    if (existingScript) {
      analyticsInitialized = true;
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.dataset.portfolioAnalytics = 'true';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.addEventListener('load', () => {
      analyticsInitialized = true;
      resolve(true);
    });
    script.addEventListener('error', () => {
      script.remove();
      analyticsInitialization = null;
      resolve(false);
    });
    document.head.appendChild(script);
  });

  return analyticsInitialization;
};

export const setAnalyticsConsent = (consent: AnalyticsConsent) => {
  const previousConsent = getAnalyticsConsent();

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // Consent remains session-only if browser storage is unavailable.
  }

  if (consent === 'granted') {
    void initializeAnalytics().then((initialized) => {
      if (!initialized || previousConsent === 'granted') return;
      window.gtag?.('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    });
  } else {
    if (window.gtag) applyConsent('denied');
    clearAnalyticsCookies();
  }

  window.dispatchEvent(new CustomEvent('portfolio:analytics-consent-change', { detail: { consent } }));
};

export const trackPageView = async (path: string, title: string) => {
  if (!(await initializeAnalytics())) return;
  window.gtag?.('event', 'page_view', {
    page_title: title,
    page_location: window.location.href,
    page_path: path,
  });
};

export const trackEvent = async (name: string, parameters: AnalyticsEventParameters = {}) => {
  if (!(await initializeAnalytics())) return;
  window.gtag?.('event', name, parameters);
};

export const openCookiePreferences = () => {
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_OPEN_EVENT));
};

export {
  COOKIE_PREFERENCES_OPEN_EVENT,
  COOKIE_PREFERENCES_VISIBILITY_EVENT,
  CONSENT_STORAGE_KEY,
};
