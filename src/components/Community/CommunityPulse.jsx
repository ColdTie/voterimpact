import React from 'react';

const CommunityPulse = ({ userProfile }) => {
  const location = userProfile?.location || 'Your Area';
  const city = location.split(',')[0]?.trim() || 'Your City';

  const topics = [
    { name: 'Housing Costs', percentage: 78, engaged: 342, trend: 'up', color: 'bg-rose-500' },
    { name: 'Public Transit', percentage: 65, engaged: 218, trend: 'up', color: 'bg-amber-500' },
    { name: 'School Funding', percentage: 61, engaged: 195, trend: 'stable', color: 'bg-blue-500' },
    { name: 'Clean Energy', percentage: 54, engaged: 167, trend: 'up', color: 'bg-emerald-500' },
    { name: 'Healthcare Access', percentage: 48, engaged: 142, trend: 'down', color: 'bg-purple-500' },
    { name: 'Small Business Support', percentage: 41, engaged: 118, trend: 'stable', color: 'bg-cyan-500' },
  ];

  const trendIcon = (trend) => {
    if (trend === 'up') return <span className="text-green-600 text-xs font-medium">Trending</span>;
    if (trend === 'down') return <span className="text-gray-400 text-xs">Cooling</span>;
    return <span className="text-gray-400 text-xs">Steady</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-900">Community Pulse</h3>
        <span className="text-xs text-gray-400">Updated today</span>
      </div>
      <p className="text-sm text-gray-500 mb-5">What {city} residents care about most right now</p>

      <div className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-800">{topic.name}</span>
                {trendIcon(topic.trend)}
              </div>
              <span className="text-xs text-gray-500">{topic.engaged} neighbors engaged</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`${topic.color} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${topic.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">
              <strong className="text-gray-900">1,182</strong> neighbors active this week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPulse;
