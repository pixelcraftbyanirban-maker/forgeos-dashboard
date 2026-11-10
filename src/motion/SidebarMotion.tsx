import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRINGS, DURATIONS } from './tokens';

interface SidebarActiveIndicatorProps {
  layoutId?: string;
  className?: string;
}

/**
 * Shared layout indicator that smoothly glides between active nav items
 */
export const SidebarActiveIndicator: React.FC<SidebarActiveIndicatorProps> = ({
  layoutId = 'sidebarActiveIndicator',
  className = 'absolute inset-0 bg-forge-orange shadow-md -z-0',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layoutId={shouldReduceMotion ? undefined : layoutId}
      className={className}
      transition={SPRINGS.snappy}
      aria-hidden="true"
    />
  );
};

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Mobile navigation off-canvas drawer with smooth backdrop fade and drawer slide
 */
export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 z-40 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.05 : DURATIONS.fast }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: shouldReduceMotion ? 0 : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: shouldReduceMotion ? 0 : '-100%' }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 36,
            }}
            className="relative z-50 flex-1 max-w-xs w-full bg-forge-black shadow-2xl h-full"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
