import { ArrowLeft, ArrowRight, Bot, FileText, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getTourSectionId, useAssistant } from '../../contexts/AssistantContext';
import { SECTION_LINKS, TOUR_SECTION_IDS, type PortfolioSectionId } from '../../data/portfolio';

const TOUR_COPY: Record<PortfolioSectionId, string> = {
  home: 'Start with Omkar’s AI/ML and Python engineering focus.',
  about: 'Review the verified profile, education, and working style.',
  skills: 'Explore programming, AI/ML, data, database, application, processing, and developer-tool skills.',
  projects: 'See the strongest hands-on evidence, led by the RAG-based AI Chat Application.',
  experience: 'Review selected AI engineering and data-analysis outcomes from the professional timeline.',
  certifications: 'Browse certifications across AI, data, Python, and cloud technologies.',
  resume: 'Open the verified resume or ask the assistant to email it securely.',
  contact: 'Finish with trusted ways to contact Omkar and view his social profiles.',
};

export const GuidedTour = () => {
  const {
    tour,
    nextTourStep,
    previousTourStep,
    stopTour,
    executeAction,
  } = useAssistant();
  const reduceMotion = useReducedMotion();
  const sectionId = getTourSectionId(tour);
  const sectionLabel = SECTION_LINKS.find((section) => section.id === sectionId)?.label ?? 'Portfolio';
  const isLast = tour.index === TOUR_SECTION_IDS.length - 1;

  return (
    <AnimatePresence>
      {tour.active && (
        <motion.aside
          key="guided-tour"
          role="region"
          aria-label="AI guided portfolio tour"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
          className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-md rounded-2xl border border-blue-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-blue-900 dark:bg-gray-900/95 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:mx-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <Bot aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Step {tour.index + 1} of {TOUR_SECTION_IDS.length}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-gray-950 dark:text-white">
                    {sectionLabel}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={stopTour}
                  aria-label="Stop guided tour"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                {TOUR_COPY[sectionId]}
              </p>
            </div>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" aria-hidden="true">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-[width] duration-200 motion-reduce:transition-none"
              style={{ width: `${((tour.index + 1) / TOUR_SECTION_IDS.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={previousTourStep}
              disabled={tour.index === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Previous
            </button>

            <div className="flex flex-wrap justify-end gap-2">
              {sectionId === 'resume' && (
                <button
                  type="button"
                  onClick={() => executeAction({ type: 'OPEN_RESUME' })}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-300 px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-950"
                >
                  <FileText aria-hidden="true" className="h-4 w-4" />
                  View resume
                </button>
              )}
              <button
                type="button"
                onClick={nextTourStep}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                {isLast ? 'Finish' : 'Next'}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default GuidedTour;
