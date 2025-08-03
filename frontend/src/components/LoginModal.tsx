import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLogin: (email: string, password: string) => void;
  language: 'en' | 'tr';
  isLoading?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose, onSwitchToRegister, onLogin, language, isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const translations = {
    en: {
      title: 'Welcome Back',
      email: 'Email',
      password: 'Password',
      loginButton: 'Sign In',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      loading: 'Signing in...'
    },
    tr: {
      title: 'Hoş Geldiniz',
      email: 'E-posta',
      password: 'Şifre',
      loginButton: 'Giriş Yap',
      noAccount: 'Hesabınız yok mu?',
      signUp: 'Kayıt Ol',
      loading: 'Giriş yapılıyor...'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    if (!email.trim()) {
      setError(language === 'tr' ? 'E-posta adresi gerekli' : 'Email is required');
      return;
    }
    
    if (!password.trim()) {
      setError(language === 'tr' ? 'Şifre gerekli' : 'Password is required');
      return;
    }
    
    setError('');
    onLogin(email, password);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-white/60" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t.title}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 mx-auto rounded-full" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t.email}
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 backdrop-blur-sm"
                placeholder="your@email.com"
                autoComplete="email"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-sky-500/0 to-fuchsia-500/0 opacity-0 focus-within:opacity-10 transition-opacity duration-200 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t.password}
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 backdrop-blur-sm"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-sky-500/0 to-fuchsia-500/0 opacity-0 focus-within:opacity-10 transition-opacity duration-200 pointer-events-none" />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 text-white py-3 px-4 rounded-xl font-medium hover:from-cyan-500 hover:via-sky-600 hover:to-fuchsia-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            {isLoading ? t.loading : t.loginButton}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <span className="text-gray-600">
            {t.noAccount}{' '}
          </span>
          <button
            onClick={onSwitchToRegister}
            className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
          >
            {t.signUp}
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-gradient-to-br from-cyan-400/5 via-sky-500/5 to-fuchsia-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </div>
  );
}; 