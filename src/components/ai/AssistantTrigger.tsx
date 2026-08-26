import { Bot, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useAssistant } from '../../contexts/AssistantContext';

export const AssistantTrigger = () => {
  const { isOpen, openAssistant, tour } = useAssistant();
  const reduceMotion = useReducedMotion();
  const isHidden = isOpen || tour.active;

  return (
    <motion.button
      type="button"
      data-assistant-trigger
      onClick={() => openAssistant()}
      aria-label="Open Ask Omkar AI portfolio assistant"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-hidden={isHidden}
      tabIndex={isHidden ? -1 : 0}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: isHidden ? 0 : 1, y: 0, scale: isHidden ? 0.96 : 1 }}
      whileHover={reduceMotion || isHidden ? undefined : { y: -2 }}
      whileTap={reduceMotion || isHidden ? undefined : { scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className={`fixed bottom-5 right-4 z-[70] inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 sm:bottom-6 sm:right-6 ${
        isHidden ? 'pointer-events-none' : 'hover:shadow-2xl'
      }`}
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <Bot aria-hidden="true" className="h-6 w-6" />
        <Sparkles
          aria-hidden="true"
          className="absolute -right-1 -top-1 h-3 w-3 text-blue-100"
        />
      </span>
      <span className="hidden sm:inline">Ask Omkar AI</span>
    </motion.button>
  );
};

export default AssistantTrigger;
