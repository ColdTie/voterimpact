import React from 'react';

const CommunityPulse = ({ location, legislation = [] }) => {
  const issueData = [
    { issue: 'Housing Affordability', percent: 78, trend: 'up', count: 94 },
    { issue: 'Healthcare Access', percent: 65, trend: 'up', count: 78 },
    { issue: 'Public Transit', percent: 52, trend: 'up', count: 63 },
    { issue: 'Education Funding', percent: 48, trend: 'stable', count: 58 },
    { issue: 'Job Creation', percent: 44, trend: 'down', count: 53 },
    { issue: 'Climate & Environment', percent: 41, trend: 'up', count: 49 },
    { issue: 'Public Safety', percent: 38, trend: 'stable', count: 46 },
    { issue: 'Infrastructure', percent: 31, trend: 'up', count: 37 },
  ];

  const recentActivity = [
    { type: 'discussion', text: 'New discussion about school budget cuts', time: '2h ago', participants: 12 },
    { type: 'event', text: 'Town hall on housing development rescheduled to May 3', time: '4h ago', participants: 45 },
    { type: 'action', text: '34 people registered to vote at community drive', time: '8h ago', participants: 34 },
    { type: 'milestone', text: 'Petition for park renovation reached 500 signatures', time: '1d ago', participants: 500 },
    { type: 'discussion', text: 'Healthcare expansion bill Q&A session planned', time: '1d ago', participants: 28 },
  ];

  const trendIcon = (trend) => {
    if (trend === 'up') return <span className="text-green-500 text-xs">+</span>;
    if (trend === 'down') return <span className="text-red-500 text-xs">-</span>;
    return <span className="text-gray-400 text-xs">=</span>;
  };

  const activityIcon = (type) => {
    switch (type) {
      case 'discussion': return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
      case 'event': return (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
      case 'action': return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
      case 'milestone': return (
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* What Your Neighbors Care About */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">What Your Neighbors Care About</h3>
          <p className="text-xs text-gray-500 mt-0.5">Top issues in {location} this month</p>
        </div>
        <div className="p-4 space-y-3">
          {issueData.map((item, i) => (
            <div key={item.issue}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500 w-4">{i + 1}</span>
                  <span className="text-sm text-gray-800">{item.issue}</span>
                  {trendIcon(item.trend)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{item.count} people</span>
                  <span className="text-xs font-medium text-indigo-600">{item.percent}%</span>
                </div>
              </div>
              <div className="ml-6 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: i === 0 ? '#4f46e5' : i < 3 ? '#6366f1' : '#a5b4fc',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-indigo-600">127</div>
          <div className="text-xs text-gray-500 mt-1">Active Neighbors</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">14</div>
          <div className="text-xs text-gray-500 mt-1">Active Discussions</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">6</div>
          <div className="text-xs text-gray-500 mt-1">Upcoming Events</div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Recent Community Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity, i) => (
            <div key={i} className="px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 transition-colors cursor-pointer">
              {activityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{activity.text}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-400">{activity.time}</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-400">{activity.participants} participants</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Voice Matters</h3>
        <p className="text-sm text-gray-600 mb-4">
          Join the conversation. Every perspective strengthens our community's civic engagement.
        </p>
        <div className="flex justify-center space-x-3">
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Start a Discussion
          </button>
          <button className="px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg border border-indigo-300 hover:bg-indigo-50 transition-colors">
            Find an Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPulse;
