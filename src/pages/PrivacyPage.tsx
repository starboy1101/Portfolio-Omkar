import { BarChart3, LockKeyhole, Mail, MapPin, ShieldCheck } from 'lucide-react';
import Seo from '../components/Seo';
import { portfolio } from '../data/portfolio';
import { openCookiePreferences } from '../services/analytics';

const sectionClassName = 'mt-10';
const headingClassName = 'text-xl font-bold text-foreground sm:text-2xl';
const copyClassName = 'mt-3 leading-7 text-muted-foreground';

const PrivacyPage = () => {
  const { profile } = portfolio;

  return (
    <>
      <Seo
        title="Privacy Policy | Omkar Mahabdi"
        description="Learn how Omkar Mahabdi's portfolio handles contact details, AI questions, browser preferences, and optional analytics."
        path="/privacy"
      />
      <main id="portfolio-content" className="bg-background pb-24 pt-32 sm:pb-28 sm:pt-40">
        <div className="section-shell">
          <div className="mx-auto max-w-4xl">
            <a href="/" className="inline-flex min-h-11 items-center font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Back to portfolio
            </a>
            <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">
              <div className="flex items-center gap-3 text-brand-600 dark:text-brand-400">
                <ShieldCheck className="size-7" aria-hidden="true" />
                <p className="section-kicker">Privacy</p>
              </div>
              <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Privacy policy
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">Last updated: August 31, 2026</p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                This notice explains what this portfolio collects, why it is used, and the choices
                available to visitors. Please do not submit confidential, sensitive, or proprietary
                information through the contact form or AI assistant.
              </p>

              <section className={sectionClassName} aria-labelledby="privacy-information">
                <h2 id="privacy-information" className={headingClassName}>Information handled by this portfolio</h2>
                <ul className="mt-4 space-y-4 text-muted-foreground">
                  <li className="flex gap-3">
                    <Mail className="mt-1 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                    <span><strong className="text-foreground">Contact submissions:</strong> name, email address, company, role, subject, and message when voluntarily provided.</span>
                  </li>
                  <li className="flex gap-3">
                    <LockKeyhole className="mt-1 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                    <span><strong className="text-foreground">AI interactions:</strong> questions sent to the portfolio assistant are processed by the Render backend and may be sent to the configured Hugging Face model Space to generate an answer.</span>
                  </li>
                  <li className="flex gap-3">
                    <BarChart3 className="mt-1 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                    <span><strong className="text-foreground">Optional analytics:</strong> Google Analytics loads only after consent and may collect page, device, approximate location, and interaction information according to Google's policies.</span>
                  </li>
                </ul>
              </section>

              <section className={sectionClassName} aria-labelledby="privacy-purpose">
                <h2 id="privacy-purpose" className={headingClassName}>How information is used</h2>
                <p className={copyClassName}>
                  Information is used to respond to genuine enquiries, operate and protect the site,
                  apply abuse and rate-limit controls, answer portfolio questions, and—with consent—
                  understand aggregate site usage. It is not sold by this portfolio.
                </p>
              </section>

              <section className={sectionClassName} aria-labelledby="privacy-storage">
                <h2 id="privacy-storage" className={headingClassName}>Browser storage and analytics choice</h2>
                <p className={copyClassName}>
                  Local browser storage remembers theme and cookie-preference choices. Analytics
                  storage is denied until it is explicitly allowed. You can change your choice at any
                  time; declining analytics does not prevent access to the portfolio.
                </p>
                <button type="button" className="button-secondary mt-5" onClick={openCookiePreferences}>
                  Review cookie preferences
                </button>
              </section>

              <section className={sectionClassName} aria-labelledby="privacy-providers">
                <h2 id="privacy-providers" className={headingClassName}>Service providers and retention</h2>
                <p className={copyClassName}>
                  Render hosts the website and API, Hugging Face hosts the model Space, and Google
                  provides analytics only after consent. Email delivery, if enabled, uses the configured
                  mail provider. These providers may process technical logs under their own terms.
                  Contact information is kept only as reasonably needed to respond, maintain records,
                  resolve abuse, or meet applicable obligations.
                </p>
              </section>

              <section className={sectionClassName} aria-labelledby="privacy-contact">
                <h2 id="privacy-contact" className={headingClassName}>Privacy questions</h2>
                <p className={copyClassName}>
                  To ask a privacy question or request access, correction, or deletion of information
                  you submitted, contact Omkar using the details below. Requests may require reasonable
                  verification before action is taken.
                </p>
                <address className="mt-5 grid gap-3 not-italic sm:grid-cols-2">
                  <a href={`mailto:${profile.contact.email}`} className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-background p-4 font-medium text-foreground hover:border-brand-400">
                    <Mail className="size-5 shrink-0 text-brand-500" aria-hidden="true" />
                    <span className="min-w-0 break-all">{profile.contact.email}</span>
                  </a>
                  <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-background p-4 font-medium text-foreground">
                    <MapPin className="size-5 shrink-0 text-brand-500" aria-hidden="true" />
                    <span>{profile.location.city}, {profile.location.state} {profile.location.postal_code}, {profile.location.country}</span>
                  </div>
                </address>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PrivacyPage;
