import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';

interface SEOChartsProps {
  segmentScores: any;
  reviewAnalysis?: any;
  performanceMetrics?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const SegmentScoresChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = [
    { name: 'İçerik SEO', value: data.content_seo || 0, color: '#3B82F6' },
    { name: 'Teknik SEO', value: data.technical_seo || 0, color: '#10B981' },
    { name: 'Kullanıcı Deneyimi', value: data.user_experience || 0, color: '#F59E0B' },
    { name: 'Performans', value: data.performance || 0, color: '#EF4444' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Segment Skorları</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartData.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-800">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="text-xs text-gray-500">/100</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${item.value}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {item.value >= 80 ? 'Mükemmel' : 
               item.value >= 60 ? 'İyi' : 
               item.value >= 40 ? 'Orta' : 'İyileştirme Gerekli'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReviewRatingChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = [
    { name: '5 Yıldız', value: data.rating_distribution?.five_star || 0 },
    { name: '4 Yıldız', value: data.rating_distribution?.four_star || 0 },
    { name: '3 Yıldız', value: data.rating_distribution?.three_star || 0 },
    { name: '2 Yıldız', value: data.rating_distribution?.two_star || 0 },
    { name: '1 Yıldız', value: data.rating_distribution?.one_star || 0 },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Yorum Dağılımı</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SentimentChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = [
    { name: 'Pozitif', value: data.sentiment_analysis?.positive_percentage || 0, fill: '#10B981' },
    { name: 'Nötr', value: data.sentiment_analysis?.neutral_percentage || 0, fill: '#6B7280' },
    { name: 'Negatif', value: data.sentiment_analysis?.negative_percentage || 0, fill: '#EF4444' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Duygu Analizi</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PerformanceRadarChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = [
    { 
      name: 'LCP', 
      fullName: 'Largest Contentful Paint',
      description: 'Sayfanın ana içeriğinin yüklenme süresi',
      value: data.core_web_vitals?.lcp_score || 0, 
      color: '#3B82F6' 
    },
    { 
      name: 'CLS', 
      fullName: 'Cumulative Layout Shift',
      description: 'Sayfa yüklenirken içeriğin kayma miktarı',
      value: data.core_web_vitals?.cls_score || 0, 
      color: '#10B981' 
    },
    { 
      name: 'FID', 
      fullName: 'First Input Delay',
      description: 'İlk kullanıcı etkileşimine yanıt süresi',
      value: data.core_web_vitals?.fid_score || 0, 
      color: '#F59E0B' 
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Web Performans Metrikleri</h3>
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <div className="group relative">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      <div className="font-semibold">{item.fullName}</div>
                      <div className="text-gray-300">{item.description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ color: item.color }}>
                {item.value}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${item.value}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions for conditional rendering
const hasValidSegmentScores = (segmentScores: any): boolean => {
  return segmentScores && 
         (segmentScores.content_seo > 0 || 
          segmentScores.technical_seo > 0 || 
          segmentScores.user_experience > 0 || 
          segmentScores.performance > 0);
};

const hasValidPerformance = (performanceMetrics: any): boolean => {
  return performanceMetrics && 
         (performanceMetrics.core_web_vitals?.lcp_score > 0 ||
          performanceMetrics.core_web_vitals?.cls_score > 0 ||
          performanceMetrics.core_web_vitals?.fid_score > 0);
};

export const SEOCharts: React.FC<SEOChartsProps> = ({ segmentScores, reviewAnalysis, performanceMetrics }) => {
  return (
    <div className="space-y-6">
      {hasValidSegmentScores(segmentScores) && <SegmentScoresChart data={segmentScores} />}
      {hasValidPerformance(performanceMetrics) && <PerformanceRadarChart data={performanceMetrics} />}
    </div>
  );
}; 