'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { GradientHeading } from '@/components/GradientHeading';
import { ToolCard } from '@/components/ToolCard';

import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { WorkspaceModal } from '@/components/WorkspaceModal';
import { UserDropdown } from '@/components/UserDropdown';
import { UserSettingsModal } from '@/components/UserSettingsModal';
import { Notification } from '@/components/Notification';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import api from '@/services/api';

export default function Home() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { user, login, register, logout } = useAuth();

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const loadWorkspaces = async () => {
    try {
      const response = await api.get('/api/workspaces/');
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  };

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleFeatures, setVisibleFeatures] = useState([false, false, false]);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      const featuresSection = document.getElementById('features-section');
      if (featuresSection) {
        const rect = featuresSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.8 && !visibleFeatures[0]) {
          setTimeout(() => setVisibleFeatures([true, false, false]), 0);
          setTimeout(() => setVisibleFeatures([true, true, false]), 500);
          setTimeout(() => setVisibleFeatures([true, true, true]), 1000);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleFeatures]);

  const translations = {
    en: {
      hero: {
        title: "AI-powered tools for e-commerce sellers",
        subtitle: "Make a difference right now with our AI-powered tools"
      },
      tools: {
        trendAgent: {
          title: "TrendAgent",
          description: "Discover what to sell and at what price based on trends"
        },
        seoStrategist: {
          title: "SEO Strategist",
          description: "Start SEO analysis of your product content or URL instantly"
        },
        adCreative: {
          title: "AdCreative",
          description: "Create advanced and effective campaigns for your products"
        }
      },
      features: {
        title: "Why Choose Gipoly?",
        subtitle: "Advanced AI technology meets e-commerce expertise",
        feature1: {
          title: "Real-time Analytics",
          description: "Get instant insights into market trends and consumer behavior"
        },
        feature2: {
          title: "Smart Recommendations",
          description: "AI-powered suggestions for optimal pricing and product selection"
        },
        feature3: {
          title: "Automated Optimization",
          description: "Let our AI handle your SEO and ad copy optimization"
        }
      },

      auth: {
        loginSignup: "Login / Sign Up",
        welcome: "Welcome",
        logout: "Logout",
        selectWorkspace: "Select Workspace"
      },
      footer: {
        copyright: "© 2025 Gipoly. All rights reserved."
      }
    },
    tr: {
      hero: {
        title: "E-ticaret satıcıları için yapay zeka destekli araçlar",
        subtitle: "Yapay zeka odaklı araçlarımızla hemen şimdi fark yarat"
      },
      tools: {
        trendAgent: {
          title: "TrendAgent",
          description: "Trendlere göre ne satacağını ve hangi fiyata satacağını keşfet"
        },
        seoStrategist: {
          title: "SEO Strategist",
          description: "Ürünün içeriği veya url üzerinden SEO analizini hemen başlat"
        },
        adCreative: {
          title: "AdCreative",
          description: "Ürünlerin için geliştirilmiş ve etkili kampanyalar oluştur"
        }
      },
      features: {
        title: "Neden Gipoly?",
        subtitle: "Gelişmiş AI teknolojisi e-ticaret uzmanlığıyla buluşuyor",
        feature1: {
          title: "Gerçek Zamanlı Analitik",
          description: "Pazar trendleri ve tüketici davranışları hakkında anında içgörüler alın"
        },
        feature2: {
          title: "Akıllı Öneriler",
          description: "Uygun fiyatlandırma ve ürün seçimi için yapay zeka destekli öneriler"
        },
        feature3: {
          title: "Otomatik Optimizasyon",
          description: "SEO ve detaylı reklam optimizasyonunu bize bırakın"
        }
      },

      auth: {
        loginSignup: "Giriş / Kayıt",
        welcome: "Hoş geldin",
        logout: "Çıkış",
        selectWorkspace: "Çalışma Alanı Seç"
      },
      footer: {
        copyright: "© 2025 Gipoly. Tüm hakları saklıdır."
      }
    }
  };

  const t = translations[language];

  const handleWorkspaceCreated = (workspace: any) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('gipoly-current-workspace', JSON.stringify(workspace));
    
    // Also update the workspaces array if it's a new workspace
    setWorkspaces(prevWorkspaces => {
      const exists = prevWorkspaces.find(w => w.id === workspace.id);
      if (!exists) {
        return [...prevWorkspaces, workspace];
      }
      return prevWorkspaces;
    });
  };

  const handleShowSettings = () => {
    setShowSettingsModal(true);
  };

  // Load workspaces when user is authenticated
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  // Update current workspace when workspaces change
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      const savedWorkspace = localStorage.getItem('gipoly-current-workspace');
      if (savedWorkspace) {
        try {
          const workspace = JSON.parse(savedWorkspace);
          // Check if saved workspace still exists in user's workspaces
          const exists = workspaces.find((w: any) => w.id === workspace.id);
          if (exists) {
            setCurrentWorkspace(workspace);
          } else {
            // If saved workspace doesn't exist, select the first available one
            setCurrentWorkspace(workspaces[0]);
            localStorage.setItem('gipoly-current-workspace', JSON.stringify(workspaces[0]));
          }
        } catch (error) {
          // If JSON parsing fails, select the first available workspace
          setCurrentWorkspace(workspaces[0]);
          localStorage.setItem('gipoly-current-workspace', JSON.stringify(workspaces[0]));
        }
      } else {
        // No saved workspace, select the first available one
        setCurrentWorkspace(workspaces[0]);
        localStorage.setItem('gipoly-current-workspace', JSON.stringify(workspaces[0]));
      }
    }
  }, [workspaces]); // Removed currentWorkspace from dependency array

  const handleUserUpdated = (updatedUser: any) => {
    // Update user in auth context
    // This will be implemented when user settings are fully functional
  };

  const handleToolClick = (tool: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Check if user has any workspaces
    if (workspaces.length === 0) {
      setShowWorkspaceModal(true);
      return;
    }
    
    // Check if a workspace is selected
    if (!currentWorkspace) {
      setShowWorkspaceModal(true);
      return;
    }
    
    // Tool'a göre yönlendirme
    if (tool.id === 'trendagent') {
      router.push('/trend-agent');
    } else if (tool.id === 'seo') {
      router.push('/seo-strategist');
    } else if (tool.id === 'adcreative') {
      router.push('/adcreative');
    } else {
      // Handle other tools here
    }
  };

  const tools = [
    {
      id: 'trendagent',
      title: t.tools.trendAgent.title,
      description: t.tools.trendAgent.description,
      icon: '📈',
      endpoint: '/tools/trend-agent/suggest'
    },
    {
      id: 'seo',
      title: t.tools.seoStrategist.title,
      description: t.tools.seoStrategist.description,
      icon: '🔍',
      endpoint: '/tools/seo/optimize'
    },
    {
      id: 'adcreative',
      title: t.tools.adCreative.title,
      description: t.tools.adCreative.description,
      icon: '🎨',
      endpoint: '/tools/adcreative/generate'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-300/20 to-sky-400/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-fuchsia-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div 
            className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl px-8 py-6 flex justify-between items-center shadow-lg"
            style={{ 
              width: '1330px', 
              height: '90px', 
              margin: '0 auto',
              maxWidth: '1330px'
            }}
          >
            <div className="flex items-center space-x-8">
              <GradientHeading className="text-4xl font-bold">Gipoly</GradientHeading>
              
              {user && (
                <>
                  <UserDropdown 
                    user={user}
                    onLogout={() => {
                      logout();
                      showNotification(
                        language === 'tr' ? 'Çıkış yapıldı. Tekrar görüşmek üzere!' : 'Logged out successfully. See you again!',
                        'info'
                      );
                    }}
                    onShowSettings={handleShowSettings}
                    language={language}
                  />
                  
                  {/* Mağaza Bilgileri */}
                  {(user.website_url || user.store_platform) && (
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="text-sm">
                        {user.website_url && (
                          <div className="text-blue-800 font-medium">
                            {language === 'tr' ? 'Mağaza:' : 'Store:'} 
                            <a href={user.website_url} target="_blank" rel="noopener noreferrer" 
                               className="ml-1 underline hover:text-blue-600">
                              {user.website_url.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                        {user.store_platform && (
                          <div className="text-blue-600 text-xs">
                            {language === 'tr' ? 'Platform:' : 'Platform:'} {user.store_platform}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  {/* Workspace Selector */}
                  <button
                    onClick={() => setShowWorkspaceModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 hover:border-cyan-300 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm font-medium text-cyan-700">
                      {currentWorkspace ? currentWorkspace.name : t.auth.selectWorkspace}
                    </span>
                    <svg className="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  

                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="group relative px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-sky-500 backdrop-blur-sm border border-cyan-400/20 rounded-lg hover:from-cyan-600 hover:to-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-sky-500/0 to-fuchsia-500/0 group-hover:from-cyan-400/20 group-hover:via-sky-500/20 group-hover:to-fuchsia-500/20 transition-all duration-300" />
                  <span className="relative z-10">{t.auth.loginSignup}</span>
                </button>
              )}
              
              <LanguageToggle language={language} onLanguageChange={setLanguage} />
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto text-center">
          <h1 
            className="font-bold mb-8 leading-tight text-gray-900"
            style={{fontSize: 'clamp(2.2rem, 2.2rem + ((1vw - 0.2rem) * 3.5), 4.5rem)'}}
          >
            {t.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            {t.hero.subtitle}
          </p>
          
          <div 
            className="flex justify-center gap-5 mt-16"
            style={{ 
              width: '1330px', 
              margin: '0 auto',
              maxWidth: '1330px'
            }}
          >
            {tools.map((tool, index) => (
              <div
                key={tool.id}
                style={{ 
                  animationDelay: `${index * 0.2}s`
                }}
                className="animate-fade-in-up"
              >
                <ToolCard
                  tool={tool}
                  language={language}
                  isAuthenticated={!!user}
                  hasWorkspace={!!currentWorkspace}
                  onClick={() => handleToolClick(tool)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>



      <section id="features-section" className="px-6 py-20 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
              {t.features.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="space-y-16">
            <div 
              className={`flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-12 group transition-all duration-1000 ease-out ${
                visibleFeatures[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              }`}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                <svg className="w-12 h-12 text-white group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-sky-500 group-hover:to-fuchsia-500 transition-all duration-300">
                  {t.features.feature1.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg max-w-2xl">
                  {t.features.feature1.description}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 rounded-full opacity-30"></div>
            </div>
            
            <div 
              className={`flex flex-col md:flex-row-reverse items-center md:items-start space-y-6 md:space-y-0 md:space-x-reverse md:space-x-12 group transition-all duration-1000 ease-out ${
                visibleFeatures[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              }`}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-sky-500 via-fuchsia-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                <svg className="w-12 h-12 text-white group-hover:-rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-center md:text-right">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-sky-500 group-hover:to-fuchsia-500 transition-all duration-300">
                  {t.features.feature2.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg max-w-2xl">
                  {t.features.feature2.description}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 rounded-full opacity-30"></div>
            </div>
            
            <div 
              className={`text-center group transition-all duration-1000 ease-out ${
                visibleFeatures[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              }`}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-fuchsia-500 via-cyan-400 to-sky-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mx-auto mb-8">
                <svg className="w-16 h-16 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-sky-500 group-hover:to-fuchsia-500 transition-all duration-300">
                {t.features.feature3.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg max-w-3xl mx-auto">
                {t.features.feature3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-8">
            <GradientHeading className="text-2xl font-bold mb-4">Gipoly</GradientHeading>
            <p className="text-gray-600">
              {t.footer.copyright}
            </p>
          </div>
          
          {/* Social Media Links - Positioned absolutely */}
          <div className="absolute bottom-0 right-0 flex items-center space-x-4">
            <a
              href="https://www.linkedin.com/in/fatihozveren/"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label="LinkedIn Profile"
            >
              <svg className="w-5 h-5 text-white group-hover:rotate-3 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            
            <a
              href="https://github.com/Fatihozveren"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-900 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label="GitHub Profile"
            >
              <svg className="w-5 h-5 text-white group-hover:rotate-3 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
          }}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
          onLogin={(email: string, password: string) => {
            setLoginLoading(true);
            login(email, password)
              .then(async () => {
                await loadWorkspaces();
                showNotification(
                  language === 'tr' ? 'Giriş başarılı! Hoş geldiniz.' : 'Login successful! Welcome.',
                  'success'
                );
                setShowLoginModal(false);
              })
              .catch((error: any) => {
                console.error('Login error:', error);
                const errorMessage = error.message || (language === 'tr' ? 'Giriş başarısız. Lütfen tekrar deneyin.' : 'Login failed. Please try again.');
                showNotification(errorMessage, 'error');
              })
              .finally(() => {
                setLoginLoading(false);
              });
          }}
          isLoading={loginLoading}
          language={language}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
          onRegister={register}
          language={language}
          isLoading={false}
        />
      )}

      {showWorkspaceModal && (
        <WorkspaceModal
          isOpen={showWorkspaceModal}
          onClose={() => setShowWorkspaceModal(false)}
          onWorkspaceCreated={handleWorkspaceCreated}
          language={language}
        />
      )}

      {showSettingsModal && (
        <UserSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={user}
          language={language}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
} 