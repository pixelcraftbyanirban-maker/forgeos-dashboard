import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASINGS, DURATIONS } from './tokens';

/**
 * Animated floating tooltip for charts
 */
export const ChartTooltipMotion: React.FC<{
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isVisible, children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 2, scale: 0.96 }}
          transition={{ duration: shouldReduceMotion ? 0.05 : DURATIONS.micro, ease: EASINGS.easeOut }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Vertical bar with smooth upward scale animation
 */
export const AnimatedVerticalBar: React.FC<{
  heightPercent: number;
  className?: string;
  delay?: number;
  colorClass?: string;
}> = ({ heightPercent, className = '', delay = 0, colorClass = 'bg-forge-orange' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ scaleY: shouldReduceMotion ? 1 : 0 }}
      animate={{ scaleY: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : 0.6,
        ease: EASINGS.easeOut,
        delay: shouldReduceMotion ? 0 : delay,
      }}
      style={{
        height: `${heightPercent}%`,
        transformOrigin: 'bottom',
      }}
      className={`w-full transition-colors ${colorClass} ${className}`}
      aria-hidden="true"
    />
  );
};

/**
 * Horizontal bar with smooth left-to-right expansion animation
 */
export const AnimatedHorizontalBar: React.FC<{
  widthPercent: number;
  className?: string;
  delay?: number;
  colorClass?: string;
}> = ({ widthPercent, className = '', delay = 0, colorClass = 'bg-forge-orange' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ scaleX: shouldReduceMotion ? 1 : 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : 0.55,
        ease: EASINGS.easeOut,
        delay: shouldReduceMotion ? 0 : delay,
      }}
      style={{
        width: `${widthPercent}%`,
        transformOrigin: 'left',
      }}
      className={`h-full transition-colors ${colorClass} ${className}`}
      aria-hidden="true"
    />
  );
};

/**
 * Animated SVG line path with progressive pathLength drawing
 */
export const AnimatedChartPath: React.FC<{
  d: string;
  stroke?: string;
  strokeWidth?: number | string;
  className?: string;
  duration?: number;
}> = ({
  d,
  stroke = '#F25C19',
  strokeWidth = 2,
  className = '',
  duration = DURATIONS.chart,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      initial={shouldReduceMotion ? { opacity: 1 } : { pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : duration,
        ease: EASINGS.easeOut,
      }}
      className={className}
    />
  );
};

/**
 * Animated SVG area fill with smooth fade
 */
export const AnimatedChartArea: React.FC<{
  d: string;
  fill?: string;
  className?: string;
  delay?: number;
}> = ({ d, fill, className = '', delay = 0.15 }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.path
      d={d}
      fill={fill}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : 0.5,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASINGS.easeOut,
      }}
      className={className}
    />
  );
};
