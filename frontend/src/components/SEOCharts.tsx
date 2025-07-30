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
    { name: 'İçerik SEO', value: data.content_seo || 0 },
    { name: 'Teknik SEO', value: data.technical_seo || 0 },
    { name: 'Kullanıcı Deneyimi', value: data.user_experience || 0 },
    { name: 'Performans', value: data.performance || 0 },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Segment Skorları</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
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
    { subject: 'LCP', A: data.core_web_vitals?.lcp_score || 0, fullMark: 100 },
    { subject: 'CLS', A: data.core_web_vitals?.cls_score || 0, fullMark: 100 },
    { subject: 'FID', A: data.core_web_vitals?.fid_score || 0, fullMark: 100 },
    { subject: 'Mobil Hız', A: data.page_speed_analysis?.mobile_speed_score || 0, fullMark: 100 },
    { subject: 'Desktop Hız', A: data.page_speed_analysis?.desktop_speed_score || 0, fullMark: 100 },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Performans Metrikleri</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Skor" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SEOCharts: React.FC<SEOChartsProps> = ({ segmentScores, reviewAnalysis, performanceMetrics }) => {
  return (
    <div className="space-y-6">
      {segmentScores && <SegmentScoresChart data={segmentScores} />}
      {reviewAnalysis && reviewAnalysis.review_count > 0 && (
        <>
          <ReviewRatingChart data={reviewAnalysis} />
          <SentimentChart data={reviewAnalysis} />
        </>
      )}
      {performanceMetrics && <PerformanceRadarChart data={performanceMetrics} />}
    </div>
  );
}; 