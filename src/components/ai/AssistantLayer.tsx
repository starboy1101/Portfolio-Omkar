import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAssistant } from '../../contexts/AssistantContext';
import AssistantTrigger from './AssistantTrigger';
import GuidedTour from './GuidedTour';

const LazyAssistantPanel = lazy(() => import('./AssistantPanel'));

const PanelLoadingFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="fixed bottom-20 right-4 z-[80] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:right-6"
  >
    Opening Ask Omkar AI…
  </div>
);

export const AssistantLayer = () => {
  const { isOpen } = useAssistant();

  return (
    <>
      <AssistantTrigger />
      <AnimatePresence mode="wait">
        {isOpen && (
          <Suspense fallback={<PanelLoadingFallback />}>
            <LazyAssistantPanel key="assistant-panel" />
          </Suspense>
        )}
      </AnimatePresence>
      <GuidedTour />
    </>
  );
};

export default AssistantLayer;
