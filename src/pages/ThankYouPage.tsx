import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Home, Mail } from 'lucide-react';
import Seo from '../components/Seo';
import { portfolio } from '../data/portfolio';

const ThankYouPage = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [confirmation] = useState(() => {
    try {
      const message = window.sessionStorage.getItem('portfolio-contact-success');
      window.sessionStorage.removeItem('portfolio-contact-success');
      return message;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <>
      <Seo
        title="Thank You | Omkar Mahabdi"
        description="Thank you for contacting Omkar Mahabdi about an AI, Python, or software engineering opportunity."
        path="/thank-you"
        noIndex
      />
      <main id="portfolio-content" className="grid min-h-dvh place-items-center bg-background px-4 pb-24 pt-32 sm:pt-40">
        <div className="surface-card w-full max-w-2xl p-7 text-center sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </span>
          <p className="section-kicker mt-6">Message received</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Thank you for reaching out.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground" role="status">
            {confirmation || 'Your interest is appreciated. Omkar will review genuine enquiries and respond using the contact details provided.'}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <a href="/" className="button-primary">
              <Home className="size-4" aria-hidden="true" />
              Return home
            </a>
            <a href="/#projects" className="button-secondary">
              View projects
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a href={`mailto:${portfolio.profile.contact.email}`} className="button-secondary">
              <Mail className="size-4" aria-hidden="true" />
              Email directly
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default ThankYouPage;
