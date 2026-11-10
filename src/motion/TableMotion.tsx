import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASINGS, DURATIONS } from './tokens';

/**
 * Expandable table row wrapper with smooth height and opacity animation
 */
export const ExpandableRowMotion: React.FC<{
  isExpanded: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isExpanded, children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.05 : DURATIONS.fast,
            ease: EASINGS.easeOut,
          }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Animated sorting indicator with subtle rotational flip
 */
export const AnimatedSortIcon: React.FC<{
  direction?: 'asc' | 'desc';
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ direction = 'asc', isActive = false, children, className = 'inline-flex items-center' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      animate={{
        rotate: direction === 'desc' ? 180 : 0,
        opacity: isActive ? 1 : 0.4,
      }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : DURATIONS.micro,
        ease: EASINGS.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.span>
  );
};

/**
 * Filterable grid item motion container with layout animation for smooth repositioning
 */
export const FilterableGridItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
}> = ({ children, className = '', layoutId }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout={!shouldReduceMotion}
      layoutId={layoutId}
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : DURATIONS.fast,
        ease: EASINGS.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
