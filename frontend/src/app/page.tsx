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
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import api from '@/services/api';

export default function Home() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { user, login, register, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [scrollY, setScrollY] = useState(0);
  const [visibleFeatures, setVisibleFeatures] = useState([false, false, false]);

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
        subtitle: "Discover what to sell and at what price with our intelligent platform"
      },
      tools: {
        trendAgent: {
          title: "TrendAgent",
          description: "Discover what to sell and at what price."
        },
        seoStrategist: {
          title: "SEO Strategist",
          description: "Optimize your product titles and descriptions."
        },
        adCreative: {
          title: "AdCreative",
          description: "Generate social media ad copy for your products."
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
      }
    },
    tr: {
      hero: {
        title: "E-ticaret satıcıları için yapay zeka destekli araçlar",
        subtitle: "Ne satacağını ve hangi fiyata satacağını akıllı platformumuzla keşfet"
      },
      tools: {
        trendAgent: {
          title: "TrendAgent",
          description: "Ne satacağını ve hangi fiyata satacağını keşfet."
        },
        seoStrategist: {
          title: "SEO Strategist",
          description: "Ürün başlıklarını ve açıklamalarını optimize et."
        },
        adCreative: {
          title: "AdCreative",
          description: "Ürünlerin için sosyal medya reklam metinleri oluştur."
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
          description: "Optimal fiyatlandırma ve ürün seçimi için AI destekli öneriler"
        },
        feature3: {
          title: "Otomatik Optimizasyon",
          description: "SEO ve reklam metni optimizasyonunu AI'mıza bırakın"
        }
      },

      auth: {
        loginSignup: "Giriş / Kayıt",
        welcome: "Hoş geldin",
        logout: "Çıkış",
        selectWorkspace: "Çalışma Alanı Seç"
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
      const loadWorkspaces = async () => {
        try {
          const response = await api.get('/api/workspaces/');
          setWorkspaces(response.data);
        } catch (error) {
          console.error('Failed to load workspaces:', error);
        }
      };
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
                <UserDropdown 
                  user={user}
                  onLogout={logout}
                  onShowSettings={handleShowSettings}
                  language={language}
                />
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
        <div className="max-w-6xl mx-auto text-center">
          <GradientHeading className="text-2xl font-bold mb-4">Gipoly</GradientHeading>
          <p className="text-gray-600">
            © 2025 Gipoly. All rights reserved.
          </p>
        </div>
      </footer>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
          onLogin={login}
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
    </div>
  );
} 