import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const [language, setLanguage] = useState<'en' | 'tr'>('en');

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('gipoly-language') as 'en' | 'tr';
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: 'en' | 'tr') => {
    setLanguage(newLanguage);
    localStorage.setItem('gipoly-language', newLanguage);
  };

  return {
    language,
    setLanguage: changeLanguage,
  };
}; 