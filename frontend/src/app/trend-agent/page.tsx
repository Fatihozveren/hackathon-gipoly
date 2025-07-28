'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import api from '@/services/api';

interface TrendRequest {
  category?: string;
  target_country?: string;
  budget_range?: string;
  target_audience?: string;
  additional_notes?: string;
  product_count?: number;
  language?: string;
}

interface ProductSuggestion {
  product_idea: string;
  description: string;
  recommended_price_range: string;
  target_audience: string;
  competition_score: number;
  trend_score: number;
  profit_margin_estimate: string;
  market_opportunity: string;
  risks_and_challenges: string;
  marketing_suggestions: string;
  ecommerce_platforms: string[];
  estimated_demand: string;
}

interface TrendResponse {
  products: ProductSuggestion[];
  trend_analysis: {
    category_analysis: string;
    market_trends: string;
    seasonal_factors: string;
    competitive_landscape: string;
    ai_recommendations: string;
  };
  summary: string;
  next_steps: string[];
  created_at: string;
}

export default function TrendAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isLoading } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendResponse | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [previousSuggestions, setPreviousSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [formData, setFormData] = useState<TrendRequest>({
    category: '',
    target_country: 'TR',
    budget_range: '',
    target_audience: '',
    additional_notes: '',
    product_count: 3,
    language: language
  });

  // Update language when it changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, language }));
  }, [language]);

  const translations = {
    en: {
      title: "TrendAgent - AI Product Trend Analysis",
      subtitle: "Get AI-powered product suggestions based on market trends",
      category: "Product Category",
      categoryPlaceholder: "e.g., Electronics, Fashion, Home & Garden",
      targetCountry: "Target Country",
      budgetRange: "Budget Range",
      budgetOptions: {
        low: "Low Budget",
        medium: "Medium Budget", 
        high: "High Budget"
      },
      targetAudience: "Target Audience",
      audiencePlaceholder: "e.g., Young Adults, Parents, Professionals",
      additionalNotes: "Additional Notes",
      notesPlaceholder: "Any specific requirements or preferences...",
      includeTrends: "Include Google Trends Analysis",
      productCount: "Number of Product Suggestions",
      generateButton: "Generate Suggestions",
      generating: "Generating...",
      backToHome: "Back to Home",
      workspace: "Workspace",
      summary: "Summary",
      nextSteps: "Next Steps",
      marketAnalysis: "Market Analysis",
      categoryAnalysis: "Category Analysis",
      marketTrends: "Market Trends",
      seasonalFactors: "Seasonal Factors",
      competitiveLandscape: "Competitive Landscape",
      aiRecommendations: "AI Recommendations",
      productDetails: "Product Details",
      competitionScore: "Competition Score",
      trendScore: "Trend Score",
      profitMargin: "Profit Margin",
      estimatedDemand: "Estimated Demand",
      recommendedPriceRange: "Recommended Price Range",
      marketingSuggestions: "Marketing Suggestions",
      ecommercePlatforms: "E-commerce Platforms",
      risksAndChallenges: "Risks & Challenges",
      marketOpportunity: "Market Opportunity",
      emptyState: "Fill out the form and generate your first trend analysis",
      loadingDescription: "AI is analyzing market trends and generating recommendations...",
      previousSuggestions: "Previous Suggestions",
      noPreviousSuggestions: "No previous suggestions found",
      viewDetails: "View Details",
      deleteSuggestion: "Delete"
    },
    tr: {
      title: "TrendAgent - AI Ürün Trend Analizi",
      subtitle: "Piyasa trendlerine dayalı AI destekli ürün önerileri alın",
      category: "Ürün Kategorisi",
      categoryPlaceholder: "örn., Elektronik, Moda, Ev & Bahçe",
      targetCountry: "Hedef Ülke",
      budgetRange: "Bütçe Aralığı",
      budgetOptions: {
        low: "Düşük Bütçe",
        medium: "Orta Bütçe",
        high: "Yüksek Bütçe"
      },
      targetAudience: "Hedef Kitle",
      audiencePlaceholder: "örn., Genç Yetişkinler, Ebeveynler, Profesyoneller",
      additionalNotes: "Ek Notlar",
      notesPlaceholder: "Herhangi bir özel gereksinim veya tercih...",
      includeTrends: "Google Trends Analizi Dahil Et",
      productCount: "Ürün Önerisi Sayısı",
      generateButton: "Önerileri Oluştur",
      generating: "Oluşturuluyor...",
      backToHome: "Ana Sayfaya Dön",
      workspace: "Çalışma Alanı",
      summary: "Özet",
      nextSteps: "Sonraki Adımlar",
      marketAnalysis: "Piyasa Analizi",
      categoryAnalysis: "Kategori Analizi",
      marketTrends: "Piyasa Trendleri",
      seasonalFactors: "Mevsimsel Faktörler",
      competitiveLandscape: "Rekabet Ortamı",
      aiRecommendations: "AI Önerileri",
      productDetails: "Ürün Detayları",
      competitionScore: "Rekabet Skoru",
      trendScore: "Trend Skoru",
      profitMargin: "Kar Marjı",
      estimatedDemand: "Tahmini Talep",
      recommendedPriceRange: "Önerilen Fiyat Aralığı",
      marketingSuggestions: "Pazarlama Önerileri",
      ecommercePlatforms: "E-ticaret Platformları",
      risksAndChallenges: "Riskler ve Zorluklar",
      marketOpportunity: "Piyasa Fırsatı",
      emptyState: "Formu doldurun ve ilk trend analizinizi oluşturun",
      loadingDescription: "AI piyasa trendlerini analiz ediyor ve öneriler oluşturuyor...",
      previousSuggestions: "Önceki Öneriler",
      noPreviousSuggestions: "Önceki öneri bulunamadı",
      viewDetails: "Detayları Görüntüle",
      deleteSuggestion: "Sil"
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    // Wait for auth to load
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
      setCurrentWorkspace(JSON.parse(savedWorkspace));
    }

    // Update URL with current language
    const currentLang = searchParams.get('lang') || language;
    if (currentLang !== language) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('lang', language);
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [user, router, language, searchParams, isLoading]);

  // Load previous suggestions when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      loadPreviousSuggestions();
    }
  }, [currentWorkspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentWorkspace) {
      alert(language === 'tr' ? 'Lütfen önce bir çalışma alanı seçin' : 'Please select a workspace first');
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post(`/tools/trend-agent/suggest?workspace_slug=${currentWorkspace.slug}`, formData);
      setResult(response.data);
      // Reload previous suggestions after successful generation
      loadPreviousSuggestions();
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || (language === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TrendRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadPreviousSuggestions = async () => {
    if (!currentWorkspace) return;
    
    setLoadingSuggestions(true);
    try {
      const response = await api.get(`/tools/trend-agent/suggestions?workspace_slug=${currentWorkspace.slug}`);
      setPreviousSuggestions(response.data);
    } catch (error) {
      console.error('Failed to load previous suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-cyan-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">{t.backToHome}</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {t.workspace}: <span className="font-medium text-cyan-600">{currentWorkspace?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-8 leading-tight">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.category}
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder={t.categoryPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.targetCountry}
                </label>
                <select
                  value={formData.target_country}
                  onChange={(e) => handleInputChange('target_country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="TR">Türkiye</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.budgetRange}
                </label>
                <select
                  value={formData.budget_range}
                  onChange={(e) => handleInputChange('budget_range', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select Budget Range</option>
                  <option value="low">{t.budgetOptions.low}</option>
                  <option value="medium">{t.budgetOptions.medium}</option>
                  <option value="high">{t.budgetOptions.high}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.targetAudience}
                </label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder={t.audiencePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.additionalNotes}
                </label>
                <textarea
                  value={formData.additional_notes}
                  onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productCount}
                </label>
                <select
                  value={formData.product_count}
                  onChange={(e) => handleInputChange('product_count', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t.generating}</span>
                  </div>
                ) : (
                  t.generateButton
                )}
              </button>
            </form>
          </div>

          {/* Previous Suggestions */}
          {!loading && (
            <div className="bg-white rounded-2xl p-8 shadow-lg mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.previousSuggestions}
              </h3>
              
              {loadingSuggestions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : previousSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {previousSuggestions.map((suggestion, index) => {
                    // Safely handle request and response data
                    let requestData, responseData;
                    try {
                      requestData = typeof suggestion.request_data === 'string' 
                        ? JSON.parse(suggestion.request_data) 
                        : suggestion.request_data;
                      responseData = typeof suggestion.response_data === 'string' 
                        ? JSON.parse(suggestion.response_data) 
                        : suggestion.response_data;
                    } catch (error) {
                      console.error('Error parsing suggestion data:', error);
                      requestData = { category: 'Unknown' };
                      responseData = { summary: 'Data unavailable' };
                    }
                    return (
                      <div key={suggestion.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {requestData?.category || 'General Analysis'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(suggestion.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setResult(responseData);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                              {t.viewDetails}
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(language === 'tr' ? 'Bu öneriyi silmek istediğinizden emin misiniz?' : 'Are you sure you want to delete this suggestion?')) {
                                  try {
                                    await api.delete(`/tools/trend-agent/suggestions/${suggestion.id}?workspace_slug=${currentWorkspace.slug}`);
                                    loadPreviousSuggestions();
                                  } catch (error) {
                                    console.error('Failed to delete suggestion:', error);
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
                            >
                              {t.deleteSuggestion}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {responseData?.summary || 'No summary available'}
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
                  <p>{t.noPreviousSuggestions}</p>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                <p className="text-lg text-gray-600">{t.generating}</p>
                <p className="text-sm text-gray-500">{t.loadingDescription}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="space-y-8">
                {/* Summary */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 text-cyan-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t.summary}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">{result.summary}</p>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {t.productDetails}
                  </h3>
                  <div className="space-y-6">
                    {result.products.map((product, index) => (
                      <div key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-xl text-gray-900 mb-3 flex items-center">
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                            #{index + 1}
                          </span>
                          {product.product_idea}
                        </h4>
                        <p className="text-gray-700 mb-4 text-lg leading-relaxed">{product.description}</p>
                        
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <span className="font-semibold text-gray-800 text-sm">{t.recommendedPriceRange}</span>
                            <p className="text-gray-900 font-medium mt-1">{product.recommended_price_range}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <span className="font-semibold text-gray-800 text-sm">{t.targetAudience}</span>
                            <p className="text-gray-900 font-medium mt-1">{product.target_audience}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <span className="font-semibold text-gray-800 text-sm">{t.competitionScore}</span>
                            <div className="flex items-center mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{width: `${product.competition_score * 10}%`}}></div>
                              </div>
                              <span className="text-gray-900 font-medium">{product.competition_score}/10</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <span className="font-semibold text-gray-800 text-sm">{t.trendScore}</span>
                            <div className="flex items-center mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: `${product.trend_score * 10}%`}}></div>
                              </div>
                              <span className="text-gray-900 font-medium">{product.trend_score}/10</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <span className="font-semibold text-gray-800 text-sm">{t.profitMargin}</span>
                            <p className="text-gray-900 font-medium mt-1">{product.profit_margin_estimate}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <span className="font-semibold text-gray-800 text-sm">{t.estimatedDemand}</span>
                            <p className="text-gray-900 font-medium mt-1">{product.estimated_demand}</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">{t.marketOpportunity}:</span>
                            <p className="text-gray-600 text-sm">{product.market_opportunity}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t.marketingSuggestions}:</span>
                            <p className="text-gray-600 text-sm">{product.marketing_suggestions}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t.ecommercePlatforms}:</span>
                            <p className="text-gray-600 text-sm">{product.ecommerce_platforms.join(', ')}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t.risksAndChallenges}:</span>
                            <p className="text-gray-600 text-sm">{product.risks_and_challenges}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Analysis */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {t.marketAnalysis}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {t.categoryAnalysis}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{result.trend_analysis.category_analysis}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {t.marketTrends}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{result.trend_analysis.market_trends}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t.seasonalFactors}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{result.trend_analysis.seasonal_factors}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {t.competitiveLandscape}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{result.trend_analysis.competitive_landscape}</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      {t.aiRecommendations}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{result.trend_analysis.ai_recommendations}</p>
                  </div>
                </div>

                {/* Next Steps */}
                {result.next_steps.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg className="w-6 h-6 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {t.nextSteps}
                    </h3>
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                      <div className="space-y-3">
                        {result.next_steps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !result && (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <div className="text-center text-gray-500 py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg">{t.emptyState}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 