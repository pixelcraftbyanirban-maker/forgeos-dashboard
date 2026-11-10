import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASINGS, DURATIONS, SPRINGS } from './tokens';

interface ModalMotionProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

/**
 * Standard modal dialog with smooth backdrop fade and 0.96 -> 1.0 scale transition
 */
export const ModalMotion: React.FC<ModalMotionProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  backdropClassName = 'fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-mono',
  role = 'dialog',
  ariaLabel,
  ariaLabelledBy,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.05 : DURATIONS.fast, ease: EASINGS.easeOut }}
          className={backdropClassName}
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          onClick={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.96,
              y: shouldReduceMotion ? 0 : 8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.96,
              y: shouldReduceMotion ? 0 : 6,
            }}
            transition={shouldReduceMotion ? { duration: 0.05 } : SPRINGS.smooth}
            className={className}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface DrawerMotionProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  position?: 'right' | 'left';
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

/**
 * Slide-over inspector drawer with smooth backdrop and spring slide
 */
export const DrawerMotion: React.FC<DrawerMotionProps> = ({
  isOpen,
  onClose,
  children,
  className = 'w-full max-w-full sm:max-w-xl lg:max-w-2xl bg-white border-l border-forge-aluminum h-full shadow-2xl flex flex-col justify-between',
  backdropClassName = 'fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end',
  position = 'right',
  role = 'dialog',
  ariaLabel,
  ariaLabelledBy,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const slideOffset = position === 'right' ? '100%' : '-100%';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.05 : DURATIONS.fast, ease: EASINGS.easeOut }}
          className={backdropClassName}
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          onClick={onClose}
        >
          <motion.div
            initial={{ x: shouldReduceMotion ? 0 : slideOffset }}
            animate={{ x: 0 }}
            exit={{ x: shouldReduceMotion ? 0 : slideOffset }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 34,
            }}
            className={className}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
