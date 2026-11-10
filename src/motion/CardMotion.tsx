import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { EASINGS, DURATIONS } from './tokens';

/**
 * Animated numerical counter that smoothly counts up to target values.
 * Parses prefixes, suffixes, decimals, and fractions (e.g., "78.4%", "₹ 1,200", "16 / 24").
 * Avoids unnecessary repeated animations.
 */
interface AnimatedCounterProps {
  value: string | number;
  className?: string;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = '',
  duration = DURATIONS.counter,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState<string>(() => String(value));
  const prevTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayText(String(value));
      return;
    }

    const strVal = String(value).trim();

    // Check if value matches pattern like: "16 / 24" (fraction)
    const fractionMatch = strVal.match(/^(\d+(?:\.\d+)?)\s*(\/\s*.*)$/);
    let targetNum: number;
    let prefix = '';
    let suffix = '';
    let decimalPlaces = 0;
    let hasCommas = false;

    if (fractionMatch) {
      targetNum = parseFloat(fractionMatch[1]);
      suffix = ` ${fractionMatch[2]}`;
    } else {
      // Match prefix (like ₹, $, +), number with decimals, and suffix (like %, pcs, etc.)
      const regex = /^([^\d\-+.]*?)([-+]?\d+(?:,\d+)*(?:\.\d+)?)(.*)$/;
      const match = strVal.match(regex);

      if (!match) {
        // Not a recognized number format, render directly
        setDisplayText(strVal);
        return;
      }

      prefix = match[1] || '';
      const numRaw = match[2].replace(/,/g, '');
      suffix = match[3] || '';
      targetNum = parseFloat(numRaw);

      if (isNaN(targetNum)) {
        setDisplayText(strVal);
        return;
      }

      decimalPlaces = numRaw.includes('.') ? numRaw.split('.')[1].length : 0;
      hasCommas = match[2].includes(',');
    }

    // If target hasn't changed, don't re-animate
    if (prevTargetRef.current === targetNum) {
      return;
    }

    const startNum = prevTargetRef.current !== null ? prevTargetRef.current : 0;
    prevTargetRef.current = targetNum;

    let startTime: number | null = null;
    let animationFrameId: number;

    const formatVal = (num: number) => {
      let formattedNum = num.toFixed(decimalPlaces);
      if (hasCommas) {
        const parts = formattedNum.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formattedNum = parts.join('.');
      }
      return `${prefix}${formattedNum}${suffix}`;
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const progress = Math.min(1, elapsed / duration);

      // Custom easeOut curve approximation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = startNum + (targetNum - startNum) * easeProgress;

      setDisplayText(formatVal(currentNum));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayText(formatVal(targetNum));
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, shouldReduceMotion]);

  return <span className={className}>{displayText}</span>;
};

/**
 * Reusable container that staggers appearance of child cards
 */
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.04 }) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Individual card motion wrapper with subtle upward reveal and restrained hover elevation
 */
export const CardMotionItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableHoverElevation?: boolean;
}> = ({ children, className = '', enableHoverElevation = true }) => {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.05 : DURATIONS.normal,
        ease: EASINGS.easeOut,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={
        !shouldReduceMotion && enableHoverElevation
          ? {
              y: -2,
              boxShadow: '0 6px 14px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              transition: { duration: 0.18, ease: EASINGS.easeOut },
            }
          : undefined
      }
      className={className}
    >
      {children}
    </motion.div>
  );
};
