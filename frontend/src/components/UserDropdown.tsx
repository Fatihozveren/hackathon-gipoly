'use client';

import { useState, useRef, useEffect } from 'react';

interface UserDropdownProps {
  user: any;
  onLogout: () => void;
  onShowSettings: () => void;
  language: string;
}

export function UserDropdown({ user, onLogout, onShowSettings, language }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      settings: "Settings",
      changePassword: "Change Password",
      editProfile: "Edit Profile",
      logout: "Logout"
    },
    tr: {
      settings: "Ayarlar",
      changePassword: "Şifre Değiştir",
      editProfile: "Profili Düzenle",
      logout: "Çıkış"
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
      >
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-900">
            {user.full_name || user.email}
          </div>
          <div className="text-xs text-gray-500">
            {user.email}
          </div>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{t.settings}</div>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                onShowSettings();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{t.editProfile}</span>
            </button>
            
            <button
              onClick={() => {
                onShowSettings();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>{t.changePassword}</span>
            </button>
          </div>
          
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 