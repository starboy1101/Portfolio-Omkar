import { useEffect, useState } from 'react';
import { Bot, Mail } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';
import {
  COOKIE_PREFERENCES_VISIBILITY_EVENT,
  getAnalyticsConsent,
  trackEvent,
} from '../services/analytics';

const MobileCTA = () => {
  const { isOpen, openAssistant, tour } = useAssistant();
  const [cookieBannerOpen, setCookieBannerOpen] = useState(() => getAnalyticsConsent() === null);

  useEffect(() => {
    const handleVisibility = (event: Event) => {
      const detail = (event as CustomEvent<{ open: boolean }>).detail;
      setCookieBannerOpen(Boolean(detail?.open));
    };
    window.addEventListener(COOKIE_PREFERENCES_VISIBILITY_EVENT, handleVisibility);
    return () => window.removeEventListener(COOKIE_PREFERENCES_VISIBILITY_EVENT, handleVisibility);
  }, []);

  if (isOpen || tour.active || cookieBannerOpen) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-[65] grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface/95 p-2 shadow-xl shadow-slate-950/20 backdrop-blur-xl md:hidden"
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      aria-label="Quick actions"
    >
      <button
        type="button"
        className="button-primary min-w-0 px-3"
        onClick={() => {
          void trackEvent('mobile_ai_cta');
          openAssistant();
        }}
      >
        <Bot className="size-4" aria-hidden="true" />
        Ask AI
      </button>
      <a href="/#contact" className="button-secondary min-w-0 px-3">
        <Mail className="size-4" aria-hidden="true" />
        Contact
      </a>
    </div>
  );
};

export default MobileCTA;
