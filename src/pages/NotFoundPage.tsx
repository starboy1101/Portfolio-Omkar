import { ArrowLeft, SearchX } from 'lucide-react';
import Seo from '../components/Seo';

const NotFoundPage = () => (
  <>
    <Seo
      title="Page Not Found | Omkar Mahabdi"
      description="The requested page is not available. Return to Omkar Mahabdi's AI and software engineering portfolio."
      path={window.location.pathname}
      noIndex
    />
    <main id="portfolio-content" className="grid min-h-dvh place-items-center bg-background px-4 pb-24 pt-32 sm:pt-40">
      <div className="surface-card w-full max-w-2xl p-7 text-center sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <SearchX className="size-8" aria-hidden="true" />
        </span>
        <p className="section-kicker mt-6">Error 404</p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          This page could not be found.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
          The address may be incorrect or the page may have moved. The portfolio and its verified project information are still available.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/" className="button-primary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Return home
          </a>
          <a href="/#projects" className="button-secondary">Browse projects</a>
        </div>
      </div>
    </main>
  </>
);

export default NotFoundPage;
