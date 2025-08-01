import React from 'react';

// Progress Bar Component
export const ProgressBar = ({ value, max = 100, color = "blue", label }: { 
  value: number; 
  max?: number; 
  color?: string; 
  label?: string;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="w-full">
      {label && <div className="text-sm text-gray-600 mb-1">{label}</div>}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${getColorClasses(color)} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{value}/{max}</div>
    </div>
  );
};

// Conversion Potential Badge
export const ConversionBadge = ({ potential }: { potential: string }) => {
  const getBadgeConfig = (potential: string) => {
    switch (potential.toLowerCase()) {
      case 'high':
      case 'yüksek':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢' };
      case 'medium':
      case 'orta':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡' };
      case 'low':
      case 'düşük':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⚪' };
    }
  };

  const config = getBadgeConfig(potential);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {potential}
    </span>
  );
};

// Trend Level Badge
export const TrendBadge = ({ trend, keyword, searchVolume }: { 
  trend: string; 
  keyword: string; 
  searchVolume: string;
}) => {
  const getTrendConfig = (trend: string) => {
    switch (trend) {
      case '🔥':
        return { bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200' };
      case '⭐':
        return { bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-200' };
      case '📉':
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-200' };
      default:
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-200' };
    }
  };

  const config = getTrendConfig(trend);
  
  return (
    <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <span className="text-lg">{trend}</span>
      <span>{keyword}</span>
      <span className="text-xs opacity-75">({searchVolume})</span>
    </span>
  );
};

// Platform Mockup Component
export const PlatformMockup = ({ platform, imageUrl, workspaceName = 'Your Brand' }: { 
  platform: string; 
  imageUrl: string; 
  workspaceName?: string;
}) => {
  const getMockupConfig = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return {
          containerClass: 'max-w-sm mx-auto',
          frameClass: 'bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden',
          headerClass: 'bg-white p-3 border-b border-gray-100',
          imageClass: 'w-full h-auto',
          showHeader: true,
          headerContent: (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">IG</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{workspaceName}</div>
                  <div className="text-xs text-gray-500">Sponsored</div>
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>
          )
        };
      case 'tiktok':
        return {
          containerClass: 'max-w-sm mx-auto',
          frameClass: 'bg-black rounded-lg shadow-lg overflow-hidden',
          headerClass: 'bg-black p-3',
          imageClass: 'w-full h-auto',
          showHeader: true,
          headerContent: (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black text-sm font-bold">TT</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{workspaceName}</div>
                  <div className="text-xs text-gray-300">Sponsored</div>
                </div>
              </div>
              <div className="text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>
          )
        };
      case 'meta':
      case 'facebook':
        return {
          containerClass: 'max-w-md mx-auto',
          frameClass: 'bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden',
          headerClass: 'bg-white p-3 border-b border-gray-100',
          imageClass: 'w-full h-auto',
          showHeader: true,
          headerContent: (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">FB</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{workspaceName}</div>
                  <div className="text-xs text-gray-500">Sponsored</div>
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>
          )
        };
      case 'google ads':
        return {
          containerClass: 'max-w-md mx-auto',
          frameClass: 'bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden',
          headerClass: 'bg-white p-3 border-b border-gray-100',
          imageClass: 'w-full h-auto',
          showHeader: true,
          headerContent: (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">GA</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{workspaceName}</div>
                  <div className="text-xs text-gray-500">Ad</div>
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>
          )
        };
      default:
        return {
          containerClass: 'max-w-sm mx-auto',
          frameClass: 'bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden',
          headerClass: 'bg-white p-3 border-b border-gray-100',
          imageClass: 'w-full h-auto',
          showHeader: false,
          headerContent: null
        };
    }
  };

  const config = getMockupConfig(platform);

  return (
    <div className={config.containerClass}>
      <div className={config.frameClass}>
        {config.showHeader && (
          <div className={config.headerClass}>
            {config.headerContent}
          </div>
        )}
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Generated Ad Creative" 
            className={config.imageClass}
          />
          {/* Platform-specific overlay elements */}
          {platform.toLowerCase() === 'instagram' && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Sponsored
            </div>
          )}
        </div>
        {/* Footer with engagement elements */}
        <div className="bg-white p-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">1.2K</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm">48</span>
              </div>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Timeline Component
export const Timeline = ({ steps }: { steps: string[] }) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-500 to-fuchsia-500 mx-auto mt-2"></div>
            )}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-gray-700">{step}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Checklist Component
export const Checklist = ({ items }: { items: string[] }) => {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 bg-white border border-orange-200 rounded-lg shadow-sm">
          <div className="flex-shrink-0 w-6 h-6 border-2 border-orange-300 rounded-full flex items-center justify-center mt-0.5">
            <div className="w-3 h-3 bg-orange-500 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"></div>
          </div>
          <p className="text-orange-800 font-medium">{item}</p>
        </div>
      ))}
    </div>
  );
};

// Budget Table Component
export const BudgetTable = ({ recommendations, language = 'en' }: { 
  recommendations: { daily_budget: string; campaign_duration: string; budget_allocation: string; };
  language?: 'en' | 'tr';
}) => {
  const translations = {
    en: {
      metric: 'Metric',
      recommendation: 'Recommendation',
      dailyBudget: 'Daily Budget',
      campaignDuration: 'Campaign Duration',
      budgetAllocation: 'Budget Allocation'
    },
    tr: {
      metric: 'Metrik',
      recommendation: 'Öneri',
      dailyBudget: 'Günlük Bütçe',
      campaignDuration: 'Kampanya Süresi',
      budgetAllocation: 'Bütçe Dağılımı'
    }
  };

  const t = translations[language];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t.metric}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t.recommendation}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {t.dailyBudget}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
              {recommendations.daily_budget}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {t.campaignDuration}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
              {recommendations.campaign_duration}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {t.budgetAllocation}
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">
              {recommendations.budget_allocation}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};


export const ABTestingCards = ({ tests }: { tests: string[] }) => {
  const getTestIcon = (test: string) => {
    if (test.toLowerCase().includes('headline')) return '📝';
    if (test.toLowerCase().includes('visual') || test.toLowerCase().includes('görsel')) return '🖼️';
    if (test.toLowerCase().includes('audience') || test.toLowerCase().includes('kitle')) return '👥';
    return '🧪';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tests.map((test, index) => (
        <div key={index} className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">{getTestIcon(test)}</span>
            <span className="text-sm font-medium text-purple-800">Test {index + 1}</span>
          </div>
          <p className="text-sm text-gray-700">{test}</p>
        </div>
      ))}
    </div>
  );
};

// Benchmark Component
export const Benchmark = ({ current, average, label }: { 
  current: string; 
  average: string; 
  label: string;
}) => {
  const currentValue = parseFloat(current.replace(/[^\d.]/g, ''));
  const averageValue = parseFloat(average.replace(/[^\d.]/g, ''));
  const improvement = ((currentValue - averageValue) / averageValue) * 100;
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">{label}</span>
        <span className={`text-sm font-semibold ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <span className="text-gray-600">Sektör: {average}</span>
        <span className="text-blue-800 font-semibold">Sizin: {current}</span>
      </div>
    </div>
  );
}; 