import React from 'react';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  endpoint: string;
}

interface ToolCardProps {
  tool: Tool;
  language: 'en' | 'tr';
  isAuthenticated: boolean;
  hasWorkspace: boolean;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ 
  tool, 
  language, 
  isAuthenticated,
  hasWorkspace,
  onClick
}) => {
  const handleClick = () => {
    if (!isAuthenticated) {
      // Show a nice notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-cyan-500 to-sky-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>${language === 'tr' ? 'Lütfen önce giriş yapın' : 'Please login first'}</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
      return;
    }
    
    if (!hasWorkspace) {
      // Show workspace selection notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>${language === 'tr' ? 'Lütfen bir çalışma alanı seçin' : 'Please select a workspace first'}</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
      return;
    }
    
    onClick();
  };

  const getAnimatedIcon = (toolId: string) => {
    switch (toolId) {
      case 'trendagent':
        return (
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-white group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        );
      case 'seo':
        return (
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 via-fuchsia-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-white group-hover:-rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth={2} />
            </svg>
          </div>
        );
      case 'adcreative':
        return (
          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 via-cyan-400 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="group relative bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl p-6 sm:p-8 hover:bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden w-full sm:w-[430px] h-auto sm:h-[305px]"
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-sky-500/0 to-fuchsia-500/0 group-hover:from-cyan-400/5 group-hover:via-sky-500/5 group-hover:to-fuchsia-500/5 transition-all duration-300" />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-start mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            {tool.id === 'trendagent' && (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            {tool.id === 'seo' && (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:-rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth={2} />
              </svg>
            )}
            {tool.id === 'adcreative' && (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            )}
          </div>
        </div>
        
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-3xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-sky-500 group-hover:to-fuchsia-500 transition-all duration-300 leading-tight">
            {tool.title}
          </h3>
        </div>
        
        <p className="text-gray-600 leading-relaxed text-sm sm:text-lg flex-1 mb-4 sm:mb-6 text-center">
          {tool.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm sm:text-base text-cyan-600 font-semibold group-hover:text-cyan-500 transition-colors">
            {language === 'tr' ? 'Kullanmaya başla' : 'Get Started'}
          </span>
          <div className="relative">
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 group-hover:text-cyan-500 group-hover:translate-x-3 transition-all duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
            <svg 
              className="absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}; 