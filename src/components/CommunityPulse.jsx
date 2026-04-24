import React, { useState, useEffect } from 'react';

const issueData = [
  { id: 'housing', label: 'Housing & Rent', percent: 78, change: +5, voters: 892, color: 'bg-blue-500' },
  { id: 'healthcare', label: 'Healthcare Access', percent: 71, change: +3, voters: 814, color: 'bg-emerald-500' },
  { id: 'economy', label: 'Economy & Jobs', percent: 65, change: -2, voters: 745, color: 'bg-amber-500' },
  { id: 'education', label: 'Education', percent: 58, change: +8, voters: 664, color: 'bg-purple-500' },
  { id: 'environment', label: 'Environment', percent: 52, change: +1, voters: 596, color: 'bg-green-500' },
  { id: 'infrastructure', label: 'Infrastructure', percent: 44, change: +4, voters: 504, color: 'bg-orange-500' },
  { id: 'veterans', label: 'Veterans Affairs', percent: 38, change: 0, voters: 436, color: 'bg-red-500' },
  { id: 'social', label: 'Social Issues', percent: 33, change: -1, voters: 378, color: 'bg-pink-500' },
];

const recentActivity = [
  { action: 'joined', issue: 'Housing & Rent', time: '2 min ago', icon: '🏠' },
  { action: 'contacted rep about', issue: 'Healthcare Access', time: '5 min ago', icon: '🏥' },
  { action: 'shared analysis on', issue: 'Education', time: '12 min ago', icon: '📚' },
  { action: 'tracked bill on', issue: 'Environment', time: '18 min ago', icon: '🌿' },
  { action: 'joined', issue: 'Economy & Jobs', time: '25 min ago', icon: '💼' },
  { action: 'contacted rep about', issue: 'Infrastructure', time: '32 min ago', icon: '🔧' },
];

function CommunityPulse({ userProfile }) {
  const [animatedPercents, setAnimatedPercents] = useState(issueData.map(() => 0));
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercents(issueData.map(d => d.percent));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleVote = (issueId) => {
    setUserVotes(prev => {
      const next = { ...prev };
      if (next[issueId]) {
        delete next[issueId];
      } else {
        next[issueId] = true;
      }
      return next;
    });
  };

  const location = userProfile?.location || 'your area';

  return (
    <div className="space-y-6">
      {/* Priority Issues */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">What Matters Most in {location}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Based on activity from 1,247 engaged neighbors this week
          </p>
        </div>
        <div className="p-5 space-y-4">
          {issueData.map((issue, index) => (
            <div key={issue.id}>
              <button
                onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {issue.label}
                    </span>
                    {userVotes[issue.id] && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                        You care
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className={`font-medium ${
                      issue.change > 0 ? 'text-green-600' : issue.change < 0 ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {issue.change > 0 ? '+' : ''}{issue.change}%
                    </span>
                    <span className="text-gray-900 font-semibold">{animatedPercents[index]}%</span>
                  </div>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${issue.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${animatedPercents[index]}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {issue.voters} neighbors engaged
                </div>
              </button>

              {selectedIssue === issue.id && (
                <div className="mt-3 ml-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {issue.voters} people in {location} are actively tracking <strong>{issue.label}</strong> legislation.
                        {issue.change > 0
                          ? ` Interest has grown ${issue.change}% this week.`
                          : issue.change < 0
                          ? ` Interest has decreased ${Math.abs(issue.change)}% this week.`
                          : ' Interest has been steady this week.'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(issue.id);
                      }}
                      className={`ml-4 flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        userVotes[issue.id]
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {userVotes[issue.id] ? 'I Care About This' : 'This Matters to Me'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Live Community Activity</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {recentActivity.map((activity, index) => (
            <div key={index} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{activity.icon}</span>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-400">A neighbor</span>{' '}
                  <span className="font-medium text-gray-900">{activity.action}</span>{' '}
                  <span className="text-indigo-600 font-medium">{activity.issue}</span>
                </p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{activity.time}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            All activity is anonymous. We never share personal information.
          </p>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Neighbors Engaged', value: '1,247', sub: 'this week' },
          { label: 'Reps Contacted', value: '342', sub: 'this month' },
          { label: 'Bills Tracked', value: '89', sub: 'actively' },
          { label: 'Actions Taken', value: '2,156', sub: 'total' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            <div className="text-xs text-gray-400">{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityPulse;
