import React from 'react';

interface LogoProps {
  variant?: 'full' | 'monogram';
  theme?: 'dark' | 'light';
  height?: number;
  className?: string;
}

/**
 * FORGEOS Official Brand Logo Component
 * Matches the official ForgeOS Brand Identity & typography:
 * - Monogram "F" with Upper Blade (#FA611A), Locking Crossbar, and Lower Wedge (#FA611A)
 * - Eurostile Bold typography: "orge" (Carbide Black / Daylight White) + "OS" (#FA611A)
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'light',
  height = 32,
  className = ''
}) => {
  const isDark = theme === 'dark';
  const crossbarColor = isDark ? '#FFFFFF' : '#0A0D12';
  const orange = '#FA611A';

  if (variant === 'monogram') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <svg
          height={height}
          viewBox="104.75 121.47 37.79 36.93"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
          aria-label="FORGEOS Monogram"
        >
          {/* Upper Blade - sheared chamfer */}
          <polygon
            points="142.54 121.47 134.63 129.05 117.6 129.05 104.75 141.9 104.75 132.79 116.08 121.47 142.54 121.47"
            fill={orange}
          />
          {/* Central Locking Crossbar */}
          <polygon
            points="132.02 132.36 125.64 139.35 117.97 139.45 115.03 142.28 106.4 142.24 116.28 132.36 132.02 132.36"
            fill={crossbarColor}
          />
          {/* Lower Wedge */}
          <path
            d="M106.9 143.5h8.19l4.15 4.15 1 10.75-14.12-14.12s.95-.78.78-.78Z"
            fill={orange}
          />
        </svg>
      </div>
    );
  }

  // Full Wordmark Logo with official Eurostile typography
  const logoSrc = isDark ? '/forgeos-logo-dark.png' : '/forgeos-logo-light.png';
  const aspectRatio = 503 / 147;
  const width = Math.round(height * aspectRatio);

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="FORGEOS"
        height={height}
        width={width}
        style={{ height: `${height}px`, width: `${width}px` }}
        className="object-contain flex-shrink-0"
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
