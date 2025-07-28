import React from 'react';

interface LanguageToggleProps {
  language: 'en' | 'tr';
  onLanguageChange: (lang: 'en' | 'tr') => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  language,
  onLanguageChange
}) => {
  return (
    <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 p-1 shadow-lg relative overflow-hidden group">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-sky-500/0 to-fuchsia-500/0 group-hover:from-cyan-400/10 group-hover:via-sky-500/10 group-hover:to-fuchsia-500/10 transition-all duration-300" />
      
      <button
        onClick={() => onLanguageChange('en')}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
          language === 'en'
            ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg scale-105'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-105'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('tr')}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
          language === 'tr'
            ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg scale-105'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-105'
        }`}
      >
        TR
      </button>
    </div>
  );
}; 