import React from 'react';

interface LogoProps {
  variant?: 'full' | 'monogram';
  theme?: 'dark' | 'light';
  height?: number;
  className?: string;
}

/**
 * FORGEOS Vector Monogram & Wordmark
 * Precise geometric reproduction according to Monogram Anatomy (Page 8-15)
 * - 45° left chamfer on Upper Blade (#F25C19)
 * - Central Locking Crossbar (#0A0D12 / #FFFFFF)
 * - Inverted Lower Wedge (#F25C19)
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'light',
  height = 32,
  className = ''
}) => {
  const isDark = theme === 'dark';
  const crossbarColor = isDark ? '#FFFFFF' : '#0A0D12';
  const forgeTextColor = isDark ? '#FFFFFF' : '#0A0D12';
  const orange = '#F25C19';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Monogram */}
      <svg
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Upper Blade - 45° left chamfer, sheared terminal */}
        <polygon
          points="20,15 90,15 72,37 32,37 18,22"
          fill={orange}
        />
        {/* Locking Crossbar - Central structural polygon */}
        <polygon
          points="18,43 78,43 62,63 26,63"
          fill={crossbarColor}
        />
        {/* Lower Wedge - Inverted base polygon */}
        <polygon
          points="15,69 35,69 42,95 24,95"
          fill={orange}
        />
      </svg>

      {/* Wordmark */}
      {variant === 'full' && (
        <div className="flex items-baseline tracking-tight font-sans font-bold leading-none" style={{ fontSize: `${height * 0.72}px` }}>
          <span style={{ color: forgeTextColor }} className="font-extrabold tracking-tight">
            forge
          </span>
          <span style={{ color: orange }} className="font-extrabold tracking-tight ml-0.5">
            OS
          </span>
        </div>
      )}
    </div>
  );
};
