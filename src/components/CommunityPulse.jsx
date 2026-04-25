import React, { useState } from 'react';

const SAMPLE_POLLS = [
  {
    id: 'poll-1',
    billTitle: 'Infrastructure Investment Act',
    question: 'Do you support increased federal spending on roads, bridges, and broadband?',
    category: 'Infrastructure',
    scope: 'Federal',
    votes: { support: 847, oppose: 312, unsure: 198 },
    userVote: null,
    closesAt: '2026-05-15',
    comments: 23,
  },
  {
    id: 'poll-2',
    billTitle: 'Affordable Housing Expansion Act',
    question: 'Should the government expand affordable housing programs in your area?',
    category: 'Housing',
    scope: 'State',
    votes: { support: 1203, oppose: 456, unsure: 89 },
    userVote: null,
    closesAt: '2026-05-10',
    comments: 45,
  },
  {
    id: 'poll-3',
    billTitle: 'Clean Energy Transition Act',
    question: 'Do you support a mandate for 80% renewable energy by 2035?',
    category: 'Environment',
    scope: 'Federal',
    votes: { support: 634, oppose: 521, unsure: 287 },
    userVote: null,
    closesAt: '2026-05-20',
    comments: 67,
  },
  {
    id: 'poll-4',
    billTitle: 'Local School Funding Measure',
    question: 'Should property tax be increased by 0.5% to fund local schools?',
    category: 'Education',
    scope: 'Local',
    votes: { support: 412, oppose: 389, unsure: 145 },
    userVote: null,
    closesAt: '2026-06-01',
    comments: 31,
  },
];

const CommunityPulse = ({ userLocation }) => {
  const [polls, setPolls] = useState(SAMPLE_POLLS);
  const [filter, setFilter] = useState('all');

  const handleVote = (pollId, choice) => {
    setPolls(prev =>
      prev.map(poll => {
        if (poll.id !== pollId || poll.userVote) return poll;
        return {
          ...poll,
          userVote: choice,
          votes: {
            ...poll.votes,
            [choice]: poll.votes[choice] + 1,
          },
        };
      })
    );
  };

  const getPercentage = (votes, key) => {
    const total = votes.support + votes.oppose + votes.unsure;
    if (total === 0) return 0;
    return Math.round((votes[key] / total) * 100);
  };

  const getTotalVotes = (votes) => votes.support + votes.oppose + votes.unsure;

  const filteredPolls = filter === 'all'
    ? polls
    : polls.filter(p => p.scope.toLowerCase() === filter);

  const daysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Community Pulse</h2>
          <p className="text-sm text-gray-600 mt-1">
            See how your neighbors feel about the bills that matter
          </p>
        </div>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {['all', 'federal', 'state', 'local'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredPolls.map(poll => {
          const total = getTotalVotes(poll.votes);
          const supportPct = getPercentage(poll.votes, 'support');
          const opposePct = getPercentage(poll.votes, 'oppose');
          const unsurePct = getPercentage(poll.votes, 'unsure');
          const remaining = daysUntil(poll.closesAt);

          return (
            <div
              key={poll.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      poll.scope === 'Federal' ? 'bg-blue-100 text-blue-700' :
                      poll.scope === 'State' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {poll.scope}
                    </span>
                    <span className="text-xs text-gray-500">{poll.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{poll.billTitle}</h3>
                  <p className="text-sm text-gray-700 mt-1">{poll.question}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-xs text-gray-500">
                    {remaining > 0 ? `${remaining} days left` : 'Closed'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {total.toLocaleString()} votes
                  </div>
                </div>
              </div>

              {!poll.userVote ? (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleVote(poll.id, 'support')}
                    className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                  >
                    Support
                  </button>
                  <button
                    onClick={() => handleVote(poll.id, 'oppose')}
                    className="flex-1 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Oppose
                  </button>
                  <button
                    onClick={() => handleVote(poll.id, 'unsure')}
                    className="flex-1 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Unsure
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex rounded-lg overflow-hidden h-8 bg-gray-100">
                    <div
                      className="bg-emerald-400 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                      style={{ width: `${supportPct}%` }}
                    >
                      {supportPct > 10 && `${supportPct}%`}
                    </div>
                    <div
                      className="bg-red-400 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                      style={{ width: `${opposePct}%` }}
                    >
                      {opposePct > 10 && `${opposePct}%`}
                    </div>
                    <div
                      className="bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 transition-all duration-500"
                      style={{ width: `${unsurePct}%` }}
                    >
                      {unsurePct > 10 && `${unsurePct}%`}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1"></span>
                      Support {supportPct}%
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span>
                      Oppose {opposePct}%
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-gray-300 mr-1"></span>
                      Unsure {unsurePct}%
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-emerald-600 font-medium">
                    You voted: {poll.userVote.charAt(0).toUpperCase() + poll.userVote.slice(1)}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {poll.comments} community comments
                </span>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Join Discussion
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityPulse;
