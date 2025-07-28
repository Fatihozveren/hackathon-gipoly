import React from 'react';

interface GradientHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientHeading: React.FC<GradientHeadingProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <span 
      className={`bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-500 text-transparent bg-clip-text font-bold drop-shadow-lg ${className}`}
    >
      {children}
    </span>
  );
}; 