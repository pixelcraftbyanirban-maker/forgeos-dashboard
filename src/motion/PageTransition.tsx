import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASINGS, DURATIONS } from './tokens';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  className = 'w-full',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 8,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.05 : DURATIONS.page,
        ease: EASINGS.easeOut,
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -6,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.16,
        ease: EASINGS.easeIn,
      },
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
