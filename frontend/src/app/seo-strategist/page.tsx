'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import api from '@/services/api';
import { SEOCharts } from '@/components/SEOCharts';

interface ManualSEORequest {
  product_name: string;
  product_description: string;
  target_keywords?: string;
  language?: string;
}

interface URLSEORequest {
  url: string;
  language?: string;
}

interface SEOAnalysisResult {
  title: string;
  meta_description: string;
  keywords: string[];
  seo_description: string;
  recommendations: string[];
  score: number;
}

interface URLAnalysisResult {
  url: string;
  content_info: any;
  product_analysis: any;
  seo_optimization: any;
  user_experience: any;
  technical_seo: any;
  competitive_analysis: any;
  impact_analysis: any;
  segment_scores: any;
  action_items: any;
  seo_score: number;
}

export default function SEOStrategistPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { language } = useLanguage();
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);
  const [selectedType, setSelectedType] = useState<'manual' | 'url' | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | URLAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manual form state
  const [manualForm, setManualForm] = useState<ManualSEORequest>({
    product_name: '',
    product_description: '',
    target_keywords: '',
    language: language
  });

  // URL form state
  const [urlForm, setUrlForm] = useState<URLSEORequest>({
    url: '',
    language: language
  });

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
      setCurrentWorkspace(JSON.parse(savedWorkspace));
    }
  }, [user, router, isLoading]);

  const handleTypeSelect = (type: 'manual' | 'url') => {
    setSelectedType(type);
    setShowModal(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/tools/seo-strategist/manual?workspace_slug=${currentWorkspace.slug}`, {
        ...manualForm,
        language: language
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'SEO analizi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleURLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/tools/seo-strategist/url?workspace_slug=${currentWorkspace.slug}`, {
        ...urlForm,
        language: language
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'URL analizi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setShowModal(true);
    setResult(null);
    setError(null);
    setManualForm({
      product_name: '',
      product_description: '',
      target_keywords: '',
      language: language
    });
    setUrlForm({
      url: '',
      language: language
    });
  };

  const translations = {
    en: {
      title: "SEO Strategist",
      subtitle: "Optimize your product titles and descriptions for better search rankings",
      manualTitle: "Manual Entry",
      manualDescription: "Enter product name and description manually",
      urlTitle: "Existing Web Page",
      urlDescription: "Provide product URL for AI analysis",
      productName: "Product Name",
      productDescription: "Product Description",
      targetKeywords: "Target Keywords (optional)",
      url: "Product URL",
      analyze: "Analyze",
      back: "Back to Home",
      newAnalysis: "New Analysis",
      loading: "Analyzing...",
      error: "Error occurred",
      seoScore: "SEO Score",
      optimizedTitle: "Optimized Title",
      metaDescription: "Meta Description",
      keywords: "Keywords",
      seoDescription: "SEO Description",
      recommendations: "Recommendations",
      aioAnalysis: "AI Optimization Analysis",
      seoAnalysis: "SEO Analysis",
      contentAnalysis: "Content Analysis",
      technicalAnalysis: "Technical Analysis",
      competitiveAnalysis: "Competitive Analysis",
      actionItems: "Action Items"
    },
    tr: {
      title: "SEO Strategist",
      subtitle: "Ürün başlıklarını ve açıklamalarını daha iyi arama sıralaması için optimize edin",
      manualTitle: "Manuel Giriş",
      manualDescription: "Ürün adı ve açıklamasını manuel olarak girin",
      urlTitle: "Mevcut Web Sayfası",
      urlDescription: "AI analizi için ürün URL'si verin",
      productName: "Ürün Adı",
      productDescription: "Ürün Açıklaması",
      targetKeywords: "Hedef Anahtar Kelimeler (opsiyonel)",
      url: "Ürün URL'si",
      analyze: "Analiz Et",
      back: "Ana Sayfaya Dön",
      newAnalysis: "Yeni Analiz",
      loading: "Analiz ediliyor...",
      error: "Hata oluştu",
      seoScore: "SEO Skoru",
      optimizedTitle: "Optimize Edilmiş Başlık",
      metaDescription: "Meta Açıklama",
      keywords: "Anahtar Kelimeler",
      seoDescription: "SEO Açıklaması",
      recommendations: "Öneriler",
      aioAnalysis: "AI Optimizasyon Analizi",
      seoAnalysis: "SEO Analizi",
      contentAnalysis: "İçerik Analizi",
      technicalAnalysis: "Teknik Analiz",
      competitiveAnalysis: "Rekabet Analizi",
      actionItems: "Aksiyon Maddeleri"
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
                <span className="font-medium">{t.back}</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Workspace: <span className="font-medium text-cyan-600">{currentWorkspace?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-fuchsia-600 bg-clip-text text-transparent mb-8 leading-tight">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Type Selection Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold text-center mb-6">Analiz Türünü Seçin</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manual Entry Card */}
                <button
                  onClick={() => handleTypeSelect('manual')}
                  className="p-6 border-2 border-cyan-200 rounded-xl hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-300 text-left"
                >
                  <div className="text-3xl mb-4">✏️</div>
                  <h3 className="text-xl font-semibold mb-2">{t.manualTitle}</h3>
                  <p className="text-gray-600">{t.manualDescription}</p>
                </button>

                {/* URL Entry Card */}
                <button
                  onClick={() => handleTypeSelect('url')}
                  className="p-6 border-2 border-fuchsia-200 rounded-xl hover:border-fuchsia-400 hover:bg-fuchsia-50 transition-all duration-300 text-left"
                >
                  <div className="text-3xl mb-4">🌐</div>
                  <h3 className="text-xl font-semibold mb-2">{t.urlTitle}</h3>
                  <p className="text-gray-600">{t.urlDescription}</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Form */}
        {selectedType === 'manual' && !result && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productName} *
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.product_name}
                  onChange={(e) => setManualForm({...manualForm, product_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ürün adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productDescription} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={manualForm.product_description}
                  onChange={(e) => setManualForm({...manualForm, product_description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ürün açıklamasını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.targetKeywords}
                </label>
                <input
                  type="text"
                  value={manualForm.target_keywords}
                  onChange={(e) => setManualForm({...manualForm, target_keywords: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Anahtar kelimeleri virgülle ayırarak girin"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white py-3 px-6 rounded-lg hover:from-cyan-700 hover:to-fuchsia-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? t.loading : t.analyze}
              </button>
            </form>
          </div>
        )}

        {/* URL Form */}
        {selectedType === 'url' && !result && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleURLSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.url} *
                </label>
                <input
                  type="url"
                  required
                  value={urlForm.url}
                  onChange={(e) => setUrlForm({...urlForm, url: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                  placeholder="https://example.com/product"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white py-3 px-6 rounded-lg hover:from-fuchsia-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? t.loading : t.analyze}
              </button>
            </form>
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analiz Sonuçları</h2>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t.newAnalysis}
              </button>
            </div>

            {/* Manual SEO Results */}
            {selectedType === 'manual' && 'title' in result && (
              <div className="space-y-6">
                {/* SEO Score */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4">{t.seoScore}</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-cyan-600">{result.score}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimized Title */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4">{t.optimizedTitle}</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{result.title}</p>
                </div>

                {/* Meta Description */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4">{t.metaDescription}</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{result.meta_description}</p>
                </div>

                {/* Keywords */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4">{t.keywords}</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SEO Description */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4">{t.seoDescription}</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{result.seo_description}</p>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4">{t.recommendations}</h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-cyan-500 mt-1">•</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* URL Analysis Results */}
            {selectedType === 'url' && 'product_analysis' in result && (
              <div className="space-y-6">
                {/* Overall SEO Score */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4">Genel SEO Skoru</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-cyan-600">{result.seo_score || 0}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${result.seo_score || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <SEOCharts 
                  segmentScores={result.segment_scores}
                  reviewAnalysis={result.user_experience?.review_analysis}
                  performanceMetrics={result.technical_seo?.performance_metrics}
                />

                {/* Product Analysis */}
                {result.product_analysis && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Ürün Analizi</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Mevcut Ürün Adı</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{result.product_analysis.product_name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Önerilen SEO Ürün Adı</h4>
                        <p className="text-green-600 bg-green-50 p-3 rounded-lg">{result.product_analysis.suggested_product_name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Önerilen Ürün Açıklaması</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{result.product_analysis.suggested_description}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Hedef Anahtar Kelimeler</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.product_analysis.target_keywords?.map((keyword: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">LSI Anahtar Kelimeler</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.product_analysis.lsi_keywords?.map((keyword: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Detaylı Özellikler</h4>
                        <div className="space-y-2">
                          {result.product_analysis.detailed_features?.map((category: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <h5 className="font-medium text-gray-700 mb-1">{category.category}</h5>
                              <ul className="text-sm text-gray-600">
                                {category.features?.map((feature: string, fIndex: number) => (
                                  <li key={fIndex} className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO Optimization */}
                {result.seo_optimization && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">SEO Optimizasyonu</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Mevcut Başlık</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{result.seo_optimization.title_optimization?.current_title}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Önerilen SEO Başlığı</h4>
                        <p className="text-green-600 bg-green-50 p-3 rounded-lg">{result.seo_optimization.title_optimization?.suggested_title}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Önerilen Meta Açıklama</h4>
                        <p className="text-green-600 bg-green-50 p-3 rounded-lg">{result.seo_optimization.meta_description?.suggested_description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Experience Analysis */}
                {result.user_experience && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Kullanıcı Deneyimi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Call-to-Action</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">CTA Etkinliği: {result.user_experience.cta_analysis?.cta_effectiveness}/100</p>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Önerilen CTA'lar:</p>
                            <ul className="text-sm text-gray-600 mt-1">
                              {result.user_experience.cta_analysis?.suggested_ctas?.map((cta: string, index: number) => (
                                <li key={index} className="text-green-600">• {cta}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Güven Unsurları</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Yorumlar: {result.user_experience.trust_elements?.has_reviews ? 'Mevcut' : 'Eksik'}</p>
                          <p className="text-sm text-gray-600">Puanlama: {result.user_experience.trust_elements?.has_ratings ? 'Mevcut' : 'Eksik'}</p>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Önerilen Güven Unsurları:</p>
                            <ul className="text-sm text-gray-600 mt-1">
                              {result.user_experience.trust_elements?.suggested_trust_elements?.map((element: string, index: number) => (
                                <li key={index} className="text-blue-600">• {element}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-700 mb-2">SSS Önerileri</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {result.user_experience.faq_suggestions?.map((faq: string, index: number) => (
                            <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {faq}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Analysis */}
                {result.user_experience?.review_analysis && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Yorum Analizi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Genel İstatistikler</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Toplam Yorum: <span className="font-semibold text-blue-600">{result.user_experience.review_analysis.review_count}</span></p>
                          <p className="text-sm text-gray-600">Ortalama Puan: <span className="font-semibold text-green-600">{result.user_experience.review_analysis.average_rating}/5</span></p>
                          <p className="text-sm text-gray-600">Detaylı Yorumlar: <span className="font-semibold text-purple-600">{result.user_experience.review_analysis.review_quality?.detailed_reviews}</span></p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Duygu Analizi</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Pozitif: <span className="font-semibold text-green-600">{result.user_experience.review_analysis.sentiment_analysis?.positive_percentage}%</span></p>
                          <p className="text-sm text-gray-600">Nötr: <span className="font-semibold text-gray-600">{result.user_experience.review_analysis.sentiment_analysis?.neutral_percentage}%</span></p>
                          <p className="text-sm text-gray-600">Negatif: <span className="font-semibold text-red-600">{result.user_experience.review_analysis.sentiment_analysis?.negative_percentage}%</span></p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Yorum Kalitesi</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Ortalama Uzunluk: <span className="font-semibold text-blue-600">{result.user_experience.review_analysis.review_quality?.review_length_avg} karakter</span></p>
                          <p className="text-sm text-gray-600">Doğrulanmış Alışveriş: <span className="font-semibold text-green-600">{result.user_experience.review_analysis.review_quality?.verified_purchases}</span></p>
                        </div>
                      </div>
                    </div>
                    {result.user_experience.review_analysis.sentiment_analysis?.common_positive_themes && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-700 mb-2">Pozitif Temalar</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.user_experience.review_analysis.sentiment_analysis.common_positive_themes.map((theme: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.user_experience.review_analysis.sentiment_analysis?.common_negative_themes && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Negatif Temalar</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.user_experience.review_analysis.sentiment_analysis.common_negative_themes.map((theme: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                                         )}
                   </div>
                 )}

                {/* Technical SEO */}
                {result.technical_seo && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Teknik SEO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">URL Optimizasyonu</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Mevcut URL: {result.product_analysis.url_analysis?.current_url}</p>
                          <p className="text-sm text-green-600">Önerilen URL: {result.product_analysis.url_analysis?.suggested_url}</p>
                          <p className="text-sm text-gray-600">SEO Uygunluğu: {result.product_analysis.url_analysis?.url_seo_friendliness}/100</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">İçerik Yapısı</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Başlık Hiyerarşisi: {result.technical_seo.content_structure?.heading_hierarchy}</p>
                          <p className="text-sm text-gray-600">Paragraf Yapısı: {result.technical_seo.content_structure?.paragraph_structure}</p>
                          <p className="text-sm text-gray-600">Liste Kullanımı: {result.technical_seo.content_structure?.list_usage}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Görsel Optimizasyonu</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Görsel Sayısı: {result.technical_seo.image_optimization?.image_count}</p>
                          <p className="text-sm text-gray-600">Alt Metin Kalitesi: {result.technical_seo.image_optimization?.alt_text_quality}/100</p>
                          <p className="text-sm text-gray-600">Görsel Formatı: {result.technical_seo.image_optimization?.image_format}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Performans Metrikleri</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Tahmini Yükleme: {result.technical_seo.performance_metrics?.estimated_load_time}</p>
                          <p className="text-sm text-gray-600">LCP Skoru: {result.technical_seo.performance_metrics?.core_web_vitals?.lcp_score}/100</p>
                          <p className="text-sm text-gray-600">CLS Skoru: {result.technical_seo.performance_metrics?.core_web_vitals?.cls_score}/100</p>
                          <p className="text-sm text-gray-600">FID Skoru: {result.technical_seo.performance_metrics?.core_web_vitals?.fid_score}/100</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Mobil Optimizasyon</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Responsive Tasarım: {result.technical_seo.mobile_optimization?.responsive_design ? 'Evet' : 'Hayır'}</p>
                          <p className="text-sm text-gray-600">Mobil Dostu: {result.technical_seo.mobile_optimization?.mobile_friendly ? 'Evet' : 'Hayır'}</p>
                          <p className="text-sm text-gray-600">Touch Hedefleri: {result.technical_seo.mobile_optimization?.touch_targets}</p>
                          <p className="text-sm text-gray-600">Mobil Hız: {result.technical_seo.mobile_optimization?.mobile_speed}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Erişilebilirlik</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Alt Metin Kapsamı: {result.technical_seo.accessibility?.alt_text_coverage}%</p>
                          <p className="text-sm text-gray-600">Renk Kontrastı: {result.technical_seo.accessibility?.color_contrast}</p>
                          <p className="text-sm text-gray-600">Klavye Navigasyonu: {result.technical_seo.accessibility?.keyboard_navigation ? 'Evet' : 'Hayır'}</p>
                          <p className="text-sm text-gray-600">Ekran Okuyucu: {result.technical_seo.accessibility?.screen_reader_compatibility}</p>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-700 mb-2">Önerilen Başlık Yapısı</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {result.technical_seo.content_structure?.suggested_headings?.map((heading: string, index: number) => (
                            <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {heading}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}



                {/* Impact Analysis */}
                {result.impact_analysis && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Tahmini Etki Analizi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Performans Tahminleri</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">CTR Artışı: <span className="text-green-600 font-semibold">{result.impact_analysis.estimated_ctr_increase}</span></p>
                          <p className="text-sm text-gray-600">Dönüşüm Artışı: <span className="text-green-600 font-semibold">{result.impact_analysis.estimated_conversion_increase}</span></p>
                          <p className="text-sm text-gray-600">Sıralama İyileştirmesi: <span className="text-green-600 font-semibold">{result.impact_analysis.estimated_ranking_improvement}</span></p>
                          <p className="text-sm text-gray-600">Sonuç Görme Süresi: <span className="text-blue-600 font-semibold">{result.impact_analysis.time_to_see_results}</span></p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Rekabet Analizi</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Pazar Pozisyonu: <span className="text-purple-600 font-semibold">{result.competitive_analysis?.market_position}</span></p>
                          <p className="text-sm text-gray-600">Rekabet Skoru: <span className="text-orange-600 font-semibold">{result.competitive_analysis?.competitiveness_score}/100</span></p>
                          <p className="text-sm text-gray-600">İyileştirme Potansiyeli: <span className="text-green-600 font-semibold">{result.competitive_analysis?.improvement_potential}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {result.action_items && Object.keys(result.action_items).length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">{t.actionItems}</h3>
                    <div className="space-y-4">
                      {result.action_items.high_priority && (
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2">Yüksek Öncelik</h4>
                          <ul className="space-y-1">
                            {result.action_items.high_priority.map((item: string, index: number) => (
                              <li key={index} className="text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.action_items.medium_priority && (
                        <div>
                          <h4 className="font-semibold text-yellow-600 mb-2">Orta Öncelik</h4>
                          <ul className="space-y-1">
                            {result.action_items.medium_priority.map((item: string, index: number) => (
                              <li key={index} className="text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.action_items.low_priority && (
                        <div>
                          <h4 className="font-semibold text-green-600 mb-2">Düşük Öncelik</h4>
                          <ul className="space-y-1">
                            {result.action_items.low_priority.map((item: string, index: number) => (
                              <li key={index} className="text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 