'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import api from '@/services/api';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import {
  ProgressBar,
  ConversionBadge,
  TrendBadge,
  PlatformMockup,
  Timeline,
  Checklist,
  BudgetTable,
  ABTestingCards,
  Benchmark
} from '@/components/AdCreativeComponents';

interface AdCreativeRequest {
  lang: string;
  product_name: string;
  product_description: string;
  platform: string;
  goal: string;
  audience: {
    age: string;
    interests: string[];
  };
}

interface Headlines {
  short: string;
  long: string;
}

interface Keyword {
  keyword: string;
  trend_level: string;
  search_volume: string;
}

interface Performance {
  ctr_estimate: string;
  ad_score: number;
  conversion_potential: string;
  estimated_reach: string;
  cost_per_click: string;
  roas_potential: string;
}

interface BudgetRecommendations {
  daily_budget: string;
  campaign_duration: string;
  budget_allocation: string;
}

interface AdCreativeResult {
  headlines: Headlines;
  ad_texts: string[];
  ctas: string[];
  keywords: Keyword[];
  performance: Performance;
  insights: string[];
  platform_tips: string[];
  ab_testing: string[];
  budget_recommendations: BudgetRecommendations;
  campaign_timeline: string[];
  next_steps: string[];
  image_url: string;
}

export default function AdCreativePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { language } = useLanguage();
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdCreativeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousAnalyses, setPreviousAnalyses] = useState<any[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Form state
  const [form, setForm] = useState<AdCreativeRequest>({
    lang: language,
    product_name: '',
    product_description: '',
    platform: 'Instagram',
    goal: 'Sales',
    audience: {
      age: '20-30',
      interests: []
    }
  });

  const [interestInput, setInterestInput] = useState('');

  // Function to format markdown-like content
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');
  };

  // Load previous analyses
  const loadPreviousAnalyses = async () => {
    if (!currentWorkspace) return;
    
    setLoadingAnalyses(true);
    try {
      const response = await api.get(`/tools/adcreative/analyses?workspace_slug=${currentWorkspace.slug}`);
      setPreviousAnalyses(response.data);
    } catch (error) {
      console.error('Failed to load previous analyses:', error);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handleDeleteAnalysis = async () => {
    if (!itemToDelete || !currentWorkspace) return;
    
    try {
      await api.delete(`/tools/adcreative/analyses/${itemToDelete.id}?workspace_slug=${currentWorkspace.slug}`);
      loadPreviousAnalyses();
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }
  };

  // Check authentication and workspace
  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    if (!user) {
      router.push('/');
      return;
    }
    
    // Get current workspace from localStorage
    const savedWorkspace = localStorage.getItem('gipoly-current-workspace');
    if (savedWorkspace) {
      const workspace = JSON.parse(savedWorkspace);
      setCurrentWorkspace(workspace);
      // Load previous analyses immediately when workspace is set
      loadPreviousAnalyses();
    }
  }, [user, router, isLoading]);

  // Load previous analyses when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      loadPreviousAnalyses();
    }
  }, [currentWorkspace]);

  const handleInterestAdd = () => {
    if (interestInput.trim() && !form.audience.interests.includes(interestInput.trim())) {
      setForm({
        ...form,
        audience: {
          ...form.audience,
          interests: [...form.audience.interests, interestInput.trim()]
        }
      });
      setInterestInput('');
    }
  };

  const handleInterestRemove = (index: number) => {
    setForm({
      ...form,
      audience: {
        ...form.audience,
        interests: form.audience.interests.filter((_, i) => i !== index)
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check workspace limit
    if (previousAnalyses.length >= 3) {
      setError(language === 'tr' 
        ? 'Bu çalışma alanı için maksimum 3 kampanya oluşturabilirsiniz. Lütfen eski bir kampanyayı silin.'
        : 'Maximum 3 campaigns allowed per workspace. Please delete an old campaign first.'
      );
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/tools/adcreative/?workspace_slug=${currentWorkspace.slug}`, {
        ...form,
        lang: language
      });
      setResult(response.data);
      // Reload previous analyses after successful generation
      await loadPreviousAnalyses();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Reklam kampanyası oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
    setForm({
      lang: language,
      product_name: '',
      product_description: '',
      platform: 'Instagram',
      goal: 'Sales',
      audience: {
        age: '20-30',
        interests: []
      }
    });
    setInterestInput('');
  };

  const downloadImage = async () => {
    if (result?.image_url && result.image_url !== "IMAGE_GENERATION_FAILED") {
      try {
        // Fetch the image as blob
        const response = await fetch(result.image_url);
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ad-creative-${Date.now()}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback: open in new tab
        window.open(result.image_url, '_blank');
      }
    }
  };

  const downloadPDF = () => {
    // For now, we'll just print the page
    // In a real implementation, you'd use a library like jsPDF or html2pdf
    window.print();
  };

  const translations = {
    en: {
      title: "AdCreative",
      subtitle: "Generate professional advertising campaigns with AI",
      productName: "Product Name",
      productDescription: "Product Description",
      platform: "Platform",
      goal: "Campaign Goal",
      targetAudience: "Target Audience",
      ageRange: "Age Range",
      interests: "Interests",
      addInterest: "Add Interest",
      generate: "Generate Campaign",
      back: "Back to Home",
      newCampaign: "New Campaign",
      loading: "Generating your campaign...",
      error: "Error occurred",
      adContent: "Ad Content",
      headlines: "Headlines",
      shortHeadline: "Short Headline",
      longHeadline: "Long Headline",
      adTexts: "Ad Text Variations",
      ctas: "Call to Action",
      performance: "Performance Estimation",
      ctrEstimate: "CTR Estimate",
      adScore: "Ad Score",
      conversionPotential: "Conversion Potential",
      estimatedReach: "Estimated Reach",
      costPerClick: "Cost per Click",
      roasPotential: "ROAS Potential",
      keywords: "Keywords & Hashtags",
      insights: "AI Insights",
      platformTips: "Platform Tips",
      abTesting: "A/B Testing",
      budgetRecommendations: "Budget Recommendations",
      campaignTimeline: "Campaign Timeline",
      nextSteps: "Next Steps",
      downloadImage: "Download Image",
      downloadPDF: "Download Report",
      platforms: {
        Instagram: "Instagram",
        TikTok: "TikTok",
        Meta: "Meta",
        "Google Ads": "Google Ads"
      },
      goals: {
        Sales: "Sales",
        Traffic: "Traffic",
        Awareness: "Awareness"
      },
      ageRanges: {
        "1-18": "1-18",
        "18-25": "18-25",
        "25-35": "25-35",
        "35-45": "35-45",
        "45-65": "45-65",
        "65+": "65+",
        "all": "all"
      }
    },
    tr: {
      title: "AdCreative",
      subtitle: "AI ile profesyonel reklam kampanyaları oluşturun",
      productName: "Ürün Adı",
      productDescription: "Ürün Açıklaması",
      platform: "Platform",
      goal: "Kampanya Hedefi",
      targetAudience: "Hedef Kitle",
      ageRange: "Yaş Aralığı",
      interests: "İlgi Alanları",
      addInterest: "İlgi Alanı Ekle",
      generate: "Kampanya Oluştur",
      back: "Ana Sayfaya Dön",
      newCampaign: "Yeni Kampanya",
      loading: "Kampanyanız oluşturuluyor...",
      error: "Hata oluştu",
      adContent: "Reklam İçeriği",
      headlines: "Başlıklar",
      shortHeadline: "Kısa Başlık",
      longHeadline: "Uzun Başlık",
      adTexts: "Reklam Metni Varyasyonları",
      ctas: "Harekete Geçirici Metin",
      performance: "Performans Tahmini",
      ctrEstimate: "CTR Tahmini",
      adScore: "Reklam Skoru",
      conversionPotential: "Dönüşüm Potansiyeli",
      estimatedReach: "Tahmini Erişim",
      costPerClick: "Tıklama Başına Maliyet",
      roasPotential: "ROAS Potansiyeli",
      keywords: "Anahtar Kelimeler & Hashtag'ler",
      insights: "AI İçgörüleri",
      platformTips: "Platform İpuçları",
      abTesting: "A/B Test",
      budgetRecommendations: "Bütçe Önerileri",
      campaignTimeline: "Kampanya Zaman Çizelgesi",
      nextSteps: "Sonraki Adımlar",
      downloadImage: "Görseli İndir",
      downloadPDF: "Raporu İndir",
      platforms: {
        Instagram: "Instagram",
        TikTok: "TikTok",
        Meta: "Meta",
        "Google Ads": "Google Ads"
      },
      goals: {
        Sales: "Satış",
        Traffic: "Trafik",
        Awareness: "Farkındalık"
      },
      ageRanges: {
        "1-18": "1-18",
        "18-25": "18-25",
        "25-35": "25-35",
        "35-45": "35-45",
        "45-65": "45-65",
        "65+": "65+",
        "hepsi": "hepsi"
      }
    }
  };

  const t = translations[language as keyof typeof translations];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user || !currentWorkspace) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-cyan-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium text-sm sm:text-base">{t.back}</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs sm:text-sm text-gray-500">
                Workspace: <span className="font-medium text-cyan-600">{currentWorkspace?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16 pt-4 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-fuchsia-600 bg-clip-text text-transparent mb-4 sm:mb-8 leading-tight px-4">
            {t.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            {t.subtitle}
          </p>
        </div>

        {/* Form */}
        {!result && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productName} *
                </label>
                <input
                  type="text"
                  required
                  value={form.product_name}
                  onChange={(e) => setForm({...form, product_name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                  placeholder={language === 'tr' ? 'Ürün adını girin' : 'Enter product name'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productDescription} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.product_description}
                  onChange={(e) => setForm({...form, product_description: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                  placeholder={language === 'tr' ? 'Ürününüzü açıklayın' : 'Describe your product'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.platform} *
                  </label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({...form, platform: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                  >
                    {Object.entries(t.platforms).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.goal} *
                  </label>
                  <select
                    value={form.goal}
                    onChange={(e) => setForm({...form, goal: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                  >
                    {Object.entries(t.goals).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.targetAudience}
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      {t.ageRange}
                    </label>
                    <select
                      value={form.audience.age}
                      onChange={(e) => setForm({
                        ...form, 
                        audience: {...form.audience, age: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {Object.entries(t.ageRanges).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      {t.interests}
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleInterestAdd())}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder={language === 'tr' ? 'İlgi alanı ekle' : 'Add interest'}
                      />
                      <button
                        type="button"
                        onClick={handleInterestAdd}
                        className="px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                      >
                        {t.addInterest}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.audience.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm flex items-center space-x-1"
                        >
                          <span>{interest}</span>
                          <button
                            type="button"
                            onClick={() => handleInterestRemove(index)}
                            className="ml-1 text-cyan-600 hover:text-cyan-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white py-3 px-6 rounded-lg hover:from-cyan-700 hover:to-fuchsia-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? t.loading : t.generate}
              </button>
            </form>
          </div>
        )}

        {/* Previous Analyses */}
        {!result && !loading && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'tr' ? 'Önceki Kampanyalar' : 'Previous Campaigns'}
              </h3>
              
              {loadingAnalyses ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : previousAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {previousAnalyses.slice(0, 3).map((analysis, index) => {
                    // Safely handle request and response data
                    let requestData, responseData;
                    try {
                      requestData = typeof analysis.request_data === 'string' 
                        ? JSON.parse(analysis.request_data) 
                        : analysis.request_data;
                      responseData = typeof analysis.response_data === 'string' 
                        ? JSON.parse(analysis.response_data) 
                        : analysis.response_data;
                    } catch (error) {
                      console.error('Error parsing analysis data:', error);
                      requestData = { product_name: 'Unknown' };
                      responseData = { headlines: { short: 'Data unavailable' } };
                    }
                    return (
                      <div key={analysis.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {requestData?.product_name || 'Unknown Product'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(analysis.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setResult(responseData);
                                // Scroll to results section after a short delay to ensure DOM is updated
                                setTimeout(() => {
                                  const resultsSection = document.getElementById('results-section');
                                  if (resultsSection) {
                                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                              {language === 'tr' ? 'Detayları Görüntüle' : 'View Details'}
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(analysis);
                                setShowDeleteModal(true);
                              }}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
                            >
                              {language === 'tr' ? 'Sil' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {responseData?.headlines?.short || 'No headline available'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>{language === 'tr' ? 'Önceki kampanya bulunamadı' : 'No previous campaigns found'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-xl font-semibold text-gray-700 mb-2">{t.loading}</p>
              <p className="text-gray-500">
                {language === 'tr' 
                  ? 'Kampanyanız 1-2 dakika içerisinde hazır olacaktır'
                  : 'Your campaign will be ready within 1-2 minutes'
                }
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div id="results-section" className="max-w-6xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Kampanya Sonuçları</h2>
              <div className="flex space-x-4">
                <button
                  onClick={downloadPDF}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{t.downloadPDF}</span>
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t.newCampaign}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ad Content Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-4">{t.adContent}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">{t.headlines}</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">{t.shortHeadline}:</span>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{result.headlines.short}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">{t.longHeadline}:</span>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{result.headlines.long}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">{t.adTexts}</h4>
                    <div className="space-y-2">
                      {result.ad_texts.map((text, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-700">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">{t.ctas}</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.ctas.map((cta, index) => (
                        <span key={index} className="px-3 py-1 bg-fuchsia-100 text-fuchsia-800 rounded-full text-sm">
                          {cta}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <h3 className="text-xl font-semibold mb-4">{t.performance}</h3>
                
                <div className="space-y-6">
                  {/* CTR with Benchmark */}
                  <div>
                    <Benchmark 
                      current={result.performance.ctr_estimate}
                      average="2.0%"
                      label="CTR Performance"
                    />
                  </div>
                  
                  {/* Ad Score with Progress Bar */}
                  <div>
                    <ProgressBar 
                      value={result.performance.ad_score}
                      max={100}
                      color="purple"
                      label="Ad Score"
                    />
                  </div>
                  
                  {/* Conversion Potential with Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.conversionPotential}:</span>
                    <ConversionBadge potential={result.performance.conversion_potential} />
                  </div>

                  {/* Estimated Reach */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.estimatedReach}:</span>
                    <span className="font-semibold text-blue-600">{result.performance.estimated_reach}</span>
                  </div>

                  {/* Cost per Click */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.costPerClick}:</span>
                    <span className="font-semibold text-orange-600">{result.performance.cost_per_click}</span>
                  </div>

                  {/* ROAS Potential with Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">{t.roasPotential}:</span>
                      <span className="font-semibold text-green-600">{result.performance.roas_potential}</span>
                    </div>
                    <ProgressBar 
                      value={parseFloat(result.performance.roas_potential.replace(/[^\d.]/g, ''))}
                      max={10}
                      color="green"
                    />
                  </div>
                </div>
              </div>

              {/* Keywords Card */}
              <div className="bg-white rounded-xl p-4 shadow-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <h3 className="text-lg font-semibold mb-3">{t.keywords}</h3>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, index) => (
                      <TrendBadge 
                        key={index}
                        trend={keyword.trend_level}
                        keyword={keyword.keyword}
                        searchVolume={keyword.search_volume}
                      />
                    ))}
                  </div>
                  
                  {/* Additional Keyword Insights */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-2">💡 Keyword Insights:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>High Volume:</span>
                        <span className="font-medium text-green-600">
                          {result.keywords.filter(k => k.trend_level === 'High').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Volume:</span>
                        <span className="font-medium text-yellow-600">
                          {result.keywords.filter(k => k.trend_level === 'Medium').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Competition:</span>
                        <span className="font-medium text-blue-600">
                          {result.keywords.filter(k => k.search_volume.includes('Low')).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Keywords:</span>
                        <span className="font-medium text-purple-600">
                          {result.keywords.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <h3 className="text-xl font-semibold mb-4">{t.insights}</h3>
                
                <ul className="space-y-2">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-cyan-500 mt-1">•</span>
                      <span 
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{ __html: formatContent(insight) }}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Platform Tips Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <h3 className="text-xl font-semibold mb-4">{t.platformTips}</h3>
                
                <ul className="space-y-2">
                  {result.platform_tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">💡</span>
                      <span 
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{ __html: formatContent(tip) }}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* A/B Testing Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <h3 className="text-xl font-semibold mb-4">{t.abTesting}</h3>
                
                <ABTestingCards tests={result.ab_testing} />
              </div>

              {/* Budget Recommendations Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                <h3 className="text-xl font-semibold mb-4">{t.budgetRecommendations}</h3>
                
                <BudgetTable recommendations={result.budget_recommendations} language={language} />
              </div>

              {/* Campaign Timeline Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <h3 className="text-xl font-semibold mb-4">{t.campaignTimeline}</h3>
                
                <Timeline steps={result.campaign_timeline} />
              </div>

              {/* Next Steps Card */}
              <div className="lg:col-span-2 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-orange-800">{t.nextSteps}</h3>
                </div>
                
                <Checklist items={result.next_steps} />
              </div>

              {/* Image Card */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <h3 className="text-xl font-semibold mb-4">Generated Ad Image</h3>
                
                <div className="flex flex-col items-center space-y-4">
                  {result.image_url === "IMAGE_GENERATION_FAILED" ? (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                      <div className="text-red-500 text-6xl mb-4">⚠️</div>
                      <h4 className="text-red-800 font-semibold text-lg mb-2">Resim Oluşturulamadı</h4>
                      <p className="text-red-600">
                        AI resim üretimi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin veya manuel olarak resim ekleyin.
                      </p>
                    </div>
                  ) : (
                    <>
                      <PlatformMockup 
                        platform={form.platform} 
                        imageUrl={result.image_url} 
                        workspaceName={currentWorkspace?.name || 'Your Brand'}
                      />
                      <button
                        onClick={downloadImage}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white rounded-lg hover:from-cyan-700 hover:to-fuchsia-700 transition-all duration-300"
                      >
                        {t.downloadImage}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}      </style>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteAnalysis}
        title={language === 'tr' ? 'Kampanyayı Sil' : 'Delete Campaign'}
        message={language === 'tr' 
          ? 'Bu kampanyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
          : 'Are you sure you want to delete this campaign? This action cannot be undone.'
        }
        confirmText={language === 'tr' ? 'Sil' : 'Delete'}
        cancelText={language === 'tr' ? 'İptal' : 'Cancel'}
        type="danger"
      />
    </div>
  );
} 