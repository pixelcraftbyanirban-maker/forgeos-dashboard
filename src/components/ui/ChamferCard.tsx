import React from 'react';

interface ChamferCardProps {
  children: React.ReactNode;
  title?: string;
  tag?: string;
  action?: React.ReactNode;
  chamfer?: 'top-right' | 'bottom-right' | 'none';
  variant?: 'white' | 'alabaster' | 'dark';
  className?: string;
  headerBorder?: boolean;
}

export const ChamferCard: React.FC<ChamferCardProps> = ({
  children,
  title,
  tag,
  action,
  chamfer = 'none',
  variant = 'white',
  className = '',
  headerBorder = true
}) => {
  const bgClass =
    variant === 'dark'
      ? 'bg-forge-black text-white border-forge-steel/30'
      : variant === 'alabaster'
      ? 'bg-forge-alabaster text-forge-black border-forge-aluminum'
      : 'bg-white text-forge-black border-forge-aluminum';

  // Chamfer polygon style for 45-degree cut
  const chamferClass =
    chamfer === 'top-right'
      ? '[clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]'
      : chamfer === 'bottom-right'
      ? '[clip-path:polygon(0_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%)]'
      : '';

  return (
    <div
      className={`border relative transition-colors ${bgClass} ${chamferClass} ${className}`}
    >
      {/* Corner crosshairs for technical drafting aesthetic */}
      <span className="absolute -top-1.5 -left-1.5 text-forge-aluminum font-mono text-[10px] select-none pointer-events-none">+</span>
      <span className="absolute -bottom-1.5 -right-1.5 text-forge-aluminum font-mono text-[10px] select-none pointer-events-none">+</span>

      {(title || tag || action) && (
        <div
          className={`flex items-center justify-between px-4 py-2.5 ${
            headerBorder ? (variant === 'dark' ? 'border-b border-forge-steel/30' : 'border-b border-forge-aluminum/60') : ''
          }`}
        >
          <div className="flex items-center gap-2">
            {tag && (
              <span className="font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 bg-forge-aluminum/30 text-forge-steel font-semibold border border-forge-aluminum">
                {tag}
              </span>
            )}
            {title && (
              <h3 className="font-display font-semibold text-xs tracking-wider uppercase text-forge-black">
                {title}
              </h3>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div className="p-4">{children}</div>
    </div>
  );
};
