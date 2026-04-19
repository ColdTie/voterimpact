import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'voterimpact_community_votes';

const generateSampleVotes = (bills) => {
  const votes = {};
  bills.forEach(bill => {
    const total = Math.floor(Math.random() * 300) + 50;
    const supportPct = Math.random() * 0.6 + 0.2;
    const opposePct = Math.random() * (1 - supportPct - 0.05);
    votes[bill.id] = {
      support: Math.floor(total * supportPct),
      oppose: Math.floor(total * opposePct),
      unsure: Math.floor(total * (1 - supportPct - opposePct)),
    };
  });
  return votes;
};

const CommunityPulse = ({ legislation, userProfile }) => {
  const [communityVotes, setCommunityVotes] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [expandedBill, setExpandedBill] = useState(null);
  const [sortBy, setSortBy] = useState('most-active');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setUserVotes(stored.userVotes || {});
      if (stored.communityVotes && Object.keys(stored.communityVotes).length > 0) {
        setCommunityVotes(stored.communityVotes);
      } else {
        const sample = generateSampleVotes(legislation);
        setCommunityVotes(sample);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ communityVotes: sample, userVotes: {} }));
      }
    } catch {
      setCommunityVotes(generateSampleVotes(legislation));
    }
  }, [legislation]);

  const handleVote = (billId, stance) => {
    const prev = userVotes[billId];
    const newUserVotes = { ...userVotes, [billId]: stance };
    const newCommunityVotes = { ...communityVotes };

    if (!newCommunityVotes[billId]) {
      newCommunityVotes[billId] = { support: 0, oppose: 0, unsure: 0 };
    }

    if (prev) {
      newCommunityVotes[billId][prev] = Math.max(0, newCommunityVotes[billId][prev] - 1);
    }
    newCommunityVotes[billId][stance] += 1;

    setUserVotes(newUserVotes);
    setCommunityVotes(newCommunityVotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ communityVotes: newCommunityVotes, userVotes: newUserVotes }));
  };

  const getTotal = (billId) => {
    const v = communityVotes[billId] || { support: 0, oppose: 0, unsure: 0 };
    return v.support + v.oppose + v.unsure;
  };

  const getPct = (billId, stance) => {
    const total = getTotal(billId);
    if (total === 0) return 0;
    return Math.round(((communityVotes[billId]?.[stance] || 0) / total) * 100);
  };

  const sortedLegislation = [...legislation].sort((a, b) => {
    if (sortBy === 'most-active') return getTotal(b.id) - getTotal(a.id);
    if (sortBy === 'most-divided') {
      const aDiff = Math.abs(getPct(a.id, 'support') - getPct(a.id, 'oppose'));
      const bDiff = Math.abs(getPct(b.id, 'support') - getPct(b.id, 'oppose'));
      return aDiff - bDiff;
    }
    if (sortBy === 'most-support') return getPct(b.id, 'support') - getPct(a.id, 'support');
    return 0;
  });

  const topDebated = [...legislation]
    .sort((a, b) => {
      const aDiff = Math.abs(getPct(a.id, 'support') - getPct(a.id, 'oppose'));
      const bDiff = Math.abs(getPct(b.id, 'support') - getPct(b.id, 'oppose'));
      return aDiff - bDiff;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">{Object.keys(communityVotes).length}</div>
          <div className="text-blue-100 text-sm mt-1">Bills Being Discussed</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">
            {Object.values(communityVotes).reduce((sum, v) => sum + v.support + v.oppose + v.unsure, 0).toLocaleString()}
          </div>
          <div className="text-emerald-100 text-sm mt-1">Community Votes Cast</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">{Object.keys(userVotes).length}</div>
          <div className="text-purple-100 text-sm mt-1">Your Votes</div>
        </div>
      </div>

      {topDebated.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Hot Debates — Most Divided Bills
          </h3>
          <div className="space-y-2">
            {topDebated.map(bill => (
              <div key={bill.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate flex-1 mr-3">{bill.title}</span>
                <span className="text-amber-700 font-medium whitespace-nowrap">
                  {getPct(bill.id, 'support')}% vs {getPct(bill.id, 'oppose')}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Bills</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="most-active">Most Active</option>
          <option value="most-divided">Most Divided</option>
          <option value="most-support">Most Support</option>
        </select>
      </div>

      <div className="space-y-4">
        {sortedLegislation.map(bill => {
          const total = getTotal(bill.id);
          const supportPct = getPct(bill.id, 'support');
          const opposePct = getPct(bill.id, 'oppose');
          const unsurePct = getPct(bill.id, 'unsure');
          const myVote = userVotes[bill.id];
          const isExpanded = expandedBill === bill.id;

          return (
            <div key={bill.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        bill.scope === 'Federal' ? 'bg-blue-100 text-blue-700' :
                        bill.scope === 'State' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {bill.scope || 'Federal'}
                      </span>
                      <span className="text-xs text-gray-500">{total.toLocaleString()} votes</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{bill.title}</h4>
                    {bill.summary && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{bill.summary}</p>
                    )}
                  </div>
                </div>

                <div className="flex rounded-full overflow-hidden h-3 bg-gray-100 mb-3">
                  {supportPct > 0 && (
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${supportPct}%` }}
                    />
                  )}
                  {unsurePct > 0 && (
                    <div
                      className="bg-gray-300 transition-all duration-500"
                      style={{ width: `${unsurePct}%` }}
                    />
                  )}
                  {opposePct > 0 && (
                    <div
                      className="bg-red-400 transition-all duration-500"
                      style={{ width: `${opposePct}%` }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                  <span className="text-emerald-600 font-medium">{supportPct}% Support</span>
                  <span className="text-gray-500">{unsurePct}% Unsure</span>
                  <span className="text-red-500 font-medium">{opposePct}% Oppose</span>
                </div>

                <div className="flex items-center gap-2">
                  {['support', 'unsure', 'oppose'].map(stance => {
                    const colors = {
                      support: myVote === 'support'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50',
                      unsure: myVote === 'unsure'
                        ? 'bg-gray-500 text-white border-gray-500'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50',
                      oppose: myVote === 'oppose'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-red-300 text-red-700 hover:bg-red-50',
                    };
                    const labels = { support: 'Support', unsure: 'Unsure', oppose: 'Oppose' };
                    const icons = {
                      support: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      ),
                      unsure: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                      oppose: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                      ),
                    };

                    return (
                      <button
                        key={stance}
                        onClick={() => handleVote(bill.id, stance)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${colors[stance]}`}
                      >
                        {icons[stance]}
                        {labels[stance]}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setExpandedBill(isExpanded ? null : bill.id)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{communityVotes[bill.id]?.support || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">Support</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-500">{communityVotes[bill.id]?.unsure || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">Unsure</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-500">{communityVotes[bill.id]?.oppose || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">Oppose</div>
                    </div>
                  </div>
                  {myVote && (
                    <div className="mt-3 text-center text-sm text-gray-600">
                      You voted: <span className="font-semibold capitalize">{myVote}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityPulse;
