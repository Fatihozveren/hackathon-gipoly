import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface TrendData {
  id: number;
  name: string;
  trend_data: Record<string, number>;
  last_updated: string;
}

interface TrendChartProps {
  data: TrendData[];
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
];

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  // State for active categories - start with all categories active
  const [activeCategories, setActiveCategories] = React.useState<Set<string>>(
    new Set(data.map(cat => cat.name))
  );
  
  // State for hover effect
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

  // Update active categories when data changes
  React.useEffect(() => {
    if (data && data.length > 0) {
      setActiveCategories(new Set(data.map(cat => cat.name)));
    }
  }, [data]);

  // Toggle category visibility
  const toggleCategory = (categoryName: string) => {
    setActiveCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // Convert trend data to chart format
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get all unique dates
    const allDates = new Set<string>();
    data.forEach(category => {
      Object.keys(category.trend_data).forEach(date => {
        allDates.add(date);
      });
    });

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    // Filter dates to show every 7th day to reduce clutter
    const filteredDates = sortedDates.filter((_, index) => index % 7 === 0);

    // Create chart data points
    return filteredDates.map(date => {
      const point: any = { date };
      data.forEach((category, index) => {
        // Only include active categories
        if (activeCategories.has(category.name)) {
          point[category.name] = category.trend_data[date] || 0;
        }
      });
      return point;
    });
  }, [data, activeCategories]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Kategori Trendleri</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Trend verisi bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Kategori Trendleri</h3>
      
      {/* Category Toggle Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {data.map((category, index) => (
          <button
            key={category.name}
            onClick={() => toggleCategory(category.name)}
            onMouseEnter={() => setHoveredCategory(category.name)}
            onMouseLeave={() => setHoveredCategory(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategories.has(category.name)
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
            }`}
            style={{
              borderColor: activeCategories.has(category.name) ? COLORS[index % COLORS.length] : '#e5e7eb'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
                                    <Tooltip 
                          labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR')}
                          formatter={(value: any, name: string) => [value, name]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '4px',
                            fontSize: '12px'
                          }}
                        />
                                    <Legend />
            {data.map((category, index) => (
              activeCategories.has(category.name) && (
                <Line
                  key={category.name}
                  type="monotone"
                  dataKey={category.name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={
                    hoveredCategory === category.name 
                      ? 4 
                      : hoveredCategory && hoveredCategory !== category.name
                        ? 1
                        : activeCategories.size === 1 
                          ? 4 
                          : 2
                  }
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2, 
                    fill: COLORS[index % COLORS.length],
                    stroke: COLORS[index % COLORS.length]
                  }}
                  strokeOpacity={
                    hoveredCategory === category.name 
                      ? 1 
                      : hoveredCategory && hoveredCategory !== category.name
                        ? 0.2
                        : 0.8
                  }
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        Son güncelleme: {data[0]?.last_updated ? new Date(data[0].last_updated).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
      </div>
    </div>
  );
}; 