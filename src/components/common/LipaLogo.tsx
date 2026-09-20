import React from 'react';

interface LipaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'white' | 'dark';
  variant?: 'badge' | 'plain';
}

export const LipaLogo: React.FC<LipaLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textColor = 'white',
  variant = 'plain'
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const imageSizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`inline-flex items-center space-x-3 shrink-0 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-xl bg-white flex items-center justify-center shadow-xs transition-transform ${
          variant === 'badge' ? 'p-1 ring-1 ring-slate-200' : 'p-0.5'
        } ${sizeClasses[size]}`}
      >
        <img
          src="/logo.png"
          alt="LIPA Logo - Transforming Minds & Institutions"
          className={`object-contain ${imageSizeClasses[size]}`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to /lipa_logo.png if needed
            const target = e.currentTarget;
            if (!target.src.includes('lipa_logo.png')) {
              target.src = '/lipa_logo.png';
            }
          }}
        />
      </div>

      {showText && (
        <div className="truncate text-left">
          <div className="flex items-center space-x-2">
            <span
              className={`font-serif font-bold text-base tracking-tight truncate ${
                textColor === 'white' ? 'text-white' : 'text-slate-900'
              }`}
            >
              LIPA eLearning Center
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-slate-800 text-red-300 rounded border border-red-500/30">
              Est. 1969
            </span>
          </div>
          <div
            className={`text-[11px] truncate italic ${
              textColor === 'white' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Transforming Minds & Institutions
          </div>
        </div>
      )}
    </div>
  );
};
