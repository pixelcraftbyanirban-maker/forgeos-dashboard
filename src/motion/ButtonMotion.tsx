import React from 'react';
import { motion, useReducedMotion, HTMLMotionProps } from 'framer-motion';
import { SPRINGS } from './tokens';

export interface MotionButtonProps extends HTMLMotionProps<'button'> {
  isLoading?: boolean;
}

/**
 * High-precision button micro-interaction wrapper.
 * Subtle, restrained press feedback (scale: 0.98) and hover response.
 */
export const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  className = '',
  disabled,
  isLoading,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={
        !isDisabled && !shouldReduceMotion
          ? { scale: 1.012, transition: SPRINGS.snappy }
          : undefined
      }
      whileTap={
        !isDisabled && !shouldReduceMotion
          ? { scale: 0.98, transition: SPRINGS.snappy }
          : undefined
      }
      disabled={isDisabled}
      className={`transition-colors select-none ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Icon button micro-interaction wrapper (e.g. for refresh, close, search buttons)
 */
export const MotionIconButton: React.FC<MotionButtonProps> = ({
  children,
  className = '',
  disabled,
  isLoading,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={
        !isDisabled && !shouldReduceMotion
          ? { scale: 1.06, transition: SPRINGS.snappy }
          : undefined
      }
      whileTap={
        !isDisabled && !shouldReduceMotion
          ? { scale: 0.94, transition: SPRINGS.snappy }
          : undefined
      }
      disabled={isDisabled}
      className={`transition-colors select-none ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
