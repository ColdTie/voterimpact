import React, { useState, useMemo } from 'react';

const ISSUES = [
  { id: 'healthcare', label: 'Healthcare', color: 'bg-red-500' },
  { id: 'housing', label: 'Housing', color: 'bg-orange-500' },
  { id: 'economy', label: 'Economy & Jobs', color: 'bg-yellow-500' },
  { id: 'education', label: 'Education', color: 'bg-green-500' },
  { id: 'environment', label: 'Environment', color: 'bg-teal-500' },
  { id: 'safety', label: 'Public Safety', color: 'bg-blue-500' },
  { id: 'infrastructure', label: 'Infrastructure', color: 'bg-indigo-500' },
  { id: 'veterans', label: 'Veterans Affairs', color: 'bg-purple-500' },
];

function generatePulseData(location) {
  const seed = (location || 'default').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

  return ISSUES.map((issue, i) => ({
    ...issue,
    votes: Math.floor(rng(i) * 180) + 20,
    trend: rng(i + 10) > 0.5 ? 'up' : rng(i + 10) > 0.25 ? 'down' : 'stable',
    recentVoters: Math.floor(rng(i + 20) * 12) + 1,
  })).sort((a, b) => b.votes - a.votes);
}

const NeighborhoodPulse = ({ userProfile }) => {
  const [userVotes, setUserVotes] = useState({});
  const location = userProfile?.location || 'Your Area';

  const pulseData = useMemo(() => generatePulseData(location), [location]);
  const maxVotes = Math.max(...pulseData.map(d => d.votes + (userVotes[d.id] ? 1 : 0)));

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Neighborhood Pulse</h3>
            <p className="text-sm text-gray-500 mt-0.5">What matters most to people near {location}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {pulseData.map((issue, index) => {
          const voted = userVotes[issue.id];
          const totalVotes = issue.votes + (voted ? 1 : 0);
          const barWidth = (totalVotes / maxVotes) * 100;

          return (
            <div key={issue.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}. {issue.label}
                  </span>
                  {issue.trend === 'up' && (
                    <span className="text-xs text-green-600 font-medium">trending</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{totalVotes} voices</span>
                  <button
                    onClick={() => handleVote(issue.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      voted
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {voted ? 'Voted' : '+1'}
                  </button>
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${issue.color}`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Vote on the issues that matter to you. Your neighbors are listening.
        </p>
      </div>
    </div>
  );
};

export default NeighborhoodPulse;
