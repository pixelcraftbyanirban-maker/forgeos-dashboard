import { Transition } from 'framer-motion';

/**
 * ForgeOS Motion Design System Tokens
 * Engineered for high-precision industrial SaaS interfaces.
 * Restrained, fast, and buttery smooth. No cartoonish bounce.
 */

// Custom cubic-bezier easing curves
export const EASINGS = {
  // Ultra-smooth deceleration curve for natural entrances and content reveals
  easeOut: [0.16, 1, 0.3, 1] as const,
  // Snappy ease-in-out for reciprocal transitions (e.g., page exits, drawer toggles)
  easeInOut: [0.65, 0, 0.35, 1] as const,
  // Quick acceleration for exits
  easeIn: [0.4, 0, 1, 1] as const,
  // Precision linear for gauges and continuous spinners
  linear: [0, 0, 1, 1] as const,
};

// Durations calibrated in seconds for Framer Motion
export const DURATIONS = {
  instant: 0.08,
  micro: 0.14,
  fast: 0.2,
  normal: 0.28,
  smooth: 0.36,
  page: 0.26,
  chart: 0.7,
  counter: 0.9,
};

// Calibrated physics spring presets
export const SPRINGS = {
  // Crisp micro-interactions: buttons, pills, active tab indicator
  snappy: {
    type: 'spring',
    stiffness: 420,
    damping: 34,
    mass: 0.8,
  } as Transition,

  // Smooth layout shifts, modals, and slide-over drawers
  smooth: {
    type: 'spring',
    stiffness: 320,
    damping: 30,
    mass: 0.9,
  } as Transition,

  // Soft elevation and floating elements
  gentle: {
    type: 'spring',
    stiffness: 220,
    damping: 24,
    mass: 1,
  } as Transition,
};

// Transition variants for standard transitions
export const TRANSITIONS = {
  page: {
    duration: DURATIONS.page,
    ease: EASINGS.easeOut,
  },
  modal: {
    duration: DURATIONS.fast,
    ease: EASINGS.easeOut,
  },
  dropdown: {
    duration: DURATIONS.micro,
    ease: EASINGS.easeOut,
  },
  chart: {
    duration: DURATIONS.chart,
    ease: EASINGS.easeOut,
  },
};
