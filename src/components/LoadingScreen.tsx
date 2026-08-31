import { LoaderCircle, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const LoadingScreen = () => {
  const reduceMotion = useReducedMotion();

  return (
    <main
      id="portfolio-content"
      className="grid min-h-dvh place-items-center bg-background px-5 pb-24 pt-28 text-foreground"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto grid size-20 place-items-center rounded-3xl border border-brand-200 bg-surface shadow-xl shadow-brand-950/10 dark:border-brand-500/30">
          <span className="bg-gradient-to-br from-brand-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent">
            OM
          </span>
          <Sparkles className="absolute -right-2 -top-2 size-6 text-brand-500" aria-hidden="true" />
        </div>
        <h1 className="mt-7 text-2xl font-bold tracking-tight sm:text-3xl">Preparing Omkar's portfolio</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Loading verified experience, project evidence, and the portfolio assistant.
        </p>
        <div className="mx-auto mt-7 flex w-fit items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted-foreground">
          <motion.span
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={reduceMotion ? undefined : { duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <LoaderCircle className="size-5 text-brand-500" aria-hidden="true" />
          </motion.span>
          Loading securely…
        </div>
      </div>
    </main>
  );
};

export default LoadingScreen;
