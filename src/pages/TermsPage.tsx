import { AlertTriangle, Bot, ExternalLink, FileCheck2, Mail } from 'lucide-react';
import Seo from '../components/Seo';
import { portfolio } from '../data/portfolio';

const sectionClassName = 'mt-10';
const headingClassName = 'text-xl font-bold text-foreground sm:text-2xl';
const copyClassName = 'mt-3 leading-7 text-muted-foreground';

const TermsPage = () => {
  const { profile } = portfolio;

  return (
    <>
      <Seo
        title="Terms of Use | Omkar Mahabdi"
        description="Terms for using Omkar Mahabdi's professional portfolio, AI assistant, project links, and contact features."
        path="/terms"
      />
      <main id="portfolio-content" className="bg-background pb-24 pt-32 sm:pb-28 sm:pt-40">
        <div className="section-shell">
          <div className="mx-auto max-w-4xl">
            <a href="/" className="inline-flex min-h-11 items-center font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Back to portfolio
            </a>
            <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">
              <div className="flex items-center gap-3 text-brand-600 dark:text-brand-400">
                <FileCheck2 className="size-7" aria-hidden="true" />
                <p className="section-kicker">Terms</p>
              </div>
              <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Terms of use
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">Last updated: August 31, 2026</p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                By using this portfolio, you agree to use it lawfully and understand that its content
                presents professional work, experience, and demonstrations for informational purposes.
              </p>

              <section className={sectionClassName} aria-labelledby="terms-content">
                <h2 id="terms-content" className={headingClassName}>Portfolio content</h2>
                <p className={copyClassName}>
                  Reasonable care is taken to keep professional information accurate and current.
                  Project descriptions may summarize larger systems, and availability, links, metrics,
                  and technologies can change. Nothing on this site is an employment guarantee,
                  commercial offer, or professional advisory service.
                </p>
              </section>

              <section className={sectionClassName} aria-labelledby="terms-ai">
                <h2 id="terms-ai" className={`${headingClassName} flex items-center gap-2`}>
                  <Bot className="size-5 text-brand-500" aria-hidden="true" />
                  AI assistant limitations
                </h2>
                <p className={copyClassName}>
                  The assistant is designed to answer questions from audited portfolio information,
                  but generated responses can be incomplete or incorrect. Verify important decisions
                  against the displayed résumé, project links, or direct communication. Do not use the
                  assistant for confidential information, legal advice, medical advice, financial
                  advice, emergencies, or automated hiring decisions.
                </p>
              </section>

              <section className={sectionClassName} aria-labelledby="terms-use">
                <h2 id="terms-use" className={headingClassName}>Acceptable use</h2>
                <p className={copyClassName}>
                  Do not attempt to disrupt the service, bypass rate limits, extract secrets or system
                  prompts, introduce malicious input, impersonate another person, or use contact tools
                  for spam, harassment, or unlawful activity. Access may be restricted when necessary
                  to protect the site and its visitors.
                </p>
              </section>

              <section className={sectionClassName} aria-labelledby="terms-links">
                <h2 id="terms-links" className={`${headingClassName} flex items-center gap-2`}>
                  <ExternalLink className="size-5 text-brand-500" aria-hidden="true" />
                  External links and services
                </h2>
                <p className={copyClassName}>
                  GitHub, LinkedIn, project deployments, Render, Hugging Face, and other external
                  services operate under their own terms and privacy practices. Their availability and
                  content are outside this portfolio's control.
                </p>
              </section>

              <section className={sectionClassName} aria-labelledby="terms-rights">
                <h2 id="terms-rights" className={headingClassName}>Intellectual property</h2>
                <p className={copyClassName}>
                  Unless stated otherwise, original portfolio copy, presentation, and custom code are
                  protected by applicable intellectual-property rules. Third-party names, marks,
                  libraries, screenshots, and linked repositories remain subject to their respective
                  owners and licenses. Viewing the site does not transfer ownership rights.
                </p>
              </section>

              <section className={sectionClassName} aria-labelledby="terms-availability">
                <h2 id="terms-availability" className={`${headingClassName} flex items-center gap-2`}>
                  <AlertTriangle className="size-5 text-brand-500" aria-hidden="true" />
                  Availability and responsibility
                </h2>
                <p className={copyClassName}>
                  The site is provided on an as-available basis. Free hosting, third-party APIs, and
                  ZeroGPU capacity can introduce delays or downtime. To the extent permitted by
                  applicable law, no responsibility is accepted for indirect loss resulting solely
                  from reliance on this informational portfolio or unavailable external services.
                </p>
              </section>

              <section className={sectionClassName} aria-labelledby="terms-contact">
                <h2 id="terms-contact" className={headingClassName}>Questions and updates</h2>
                <p className={copyClassName}>
                  These terms may be updated when site features or providers change. Questions can be
                  sent to the public contact address below.
                </p>
                <a href={`mailto:${profile.contact.email}`} className="button-secondary mt-5">
                  <Mail className="size-4" aria-hidden="true" />
                  {profile.contact.email}
                </a>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TermsPage;
