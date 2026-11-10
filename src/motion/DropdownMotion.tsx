import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASINGS, DURATIONS } from './tokens';

interface DropdownMotionProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  origin?: 'top-right' | 'top-left' | 'top';
}

/**
 * Dropdown menu container with smooth fade and slide down
 */
export const DropdownMotion: React.FC<DropdownMotionProps> = ({
  isOpen,
  children,
  className = 'absolute right-0 top-full mt-1 bg-white border border-forge-aluminum shadow-lg z-30 py-1 font-mono text-xs',
  origin = 'top-right',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const originClass =
    origin === 'top-right'
      ? 'origin-top-right'
      : origin === 'top-left'
      ? 'origin-top-left'
      : 'origin-top';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : -6,
            scale: shouldReduceMotion ? 1 : 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : -4,
            scale: shouldReduceMotion ? 1 : 0.98,
          }}
          transition={{
            duration: shouldReduceMotion ? 0.04 : DURATIONS.micro,
            ease: EASINGS.easeOut,
          }}
          className={`${className} ${originClass}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
