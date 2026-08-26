import React from 'react';
import logoImg from '../../assets/images/kolmeks-logo.png';

export interface KolmeksLogoProps {
  className?: string;
  variant?: 'default' | 'light' | 'dark-bg';
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const KolmeksLogo: React.FC<KolmeksLogoProps> = ({
  className = '',
  variant = 'default',
  showSubtitle = false,
  size = 'md',
}) => {
  const heightClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12',
    xl: 'h-12 sm:h-16',
  };

  const selectedHeight = heightClasses[size];

  // On dark backgrounds, we wrap the logo in a clean white rounded container if variant is 'dark-bg' or 'light'
  if (variant === 'dark-bg' || variant === 'light') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <div className="bg-white px-2.5 py-1 rounded-lg shadow-sm flex items-center shrink-0">
          <img
            src={logoImg}
            alt="KOLMEKS Logo"
            className={`${selectedHeight} w-auto object-contain`}
          />
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase block font-mono">
            Manufacturing & Engineering
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={logoImg}
        alt="KOLMEKS Logo"
        className={`${selectedHeight} w-auto object-contain`}
      />
      {showSubtitle && (
        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block font-mono">
          Manufacturing & Engineering
        </span>
      )}
    </div>
  );
};
