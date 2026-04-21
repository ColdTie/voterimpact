import React from 'react';

const MyImpactDashboard = ({ userProfile, legislation }) => {
  const totalBills = legislation?.length || 0;
  const location = userProfile?.location || 'your area';
  const name = userProfile?.name?.split(' ')[0] || 'there';

  const topIssues = userProfile?.top_issues || '';
  const financialConcerns = userProfile?.financial_concerns || '';
  const communityIssues = userProfile?.community_issues || '';

  const issuesList = [topIssues, financialConcerns, communityIssues]
    .filter(Boolean)
    .join(', ')
    .split(/[,.]/)
    .map(s => s.trim())
    .filter(s => s.length > 3)
    .slice(0, 5);

  const relevantBills = (legislation || []).filter(b => b.relevanceScore > 3);
  const federalCount = (legislation || []).filter(b => b.scope === 'Federal').length;
  const stateCount = (legislation || []).filter(b => b.scope === 'State').length;
  const localCount = (legislation || []).filter(b => b.scope === 'Local').length;

  const engagementLevel = relevantBills.length > 5 ? 'High' : relevantBills.length > 2 ? 'Moderate' : 'Getting Started';
  const engagementColor = relevantBills.length > 5 ? 'text-green-600' : relevantBills.length > 2 ? 'text-yellow-600' : 'text-blue-600';

  return (
    <div className="pb-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-5 py-6">
        <h2 className="text-xl font-bold">Hey {name}, here's your impact snapshot</h2>
        <p className="text-indigo-100 text-sm mt-1">
          A personal view of how you're connected to the legislation that shapes your world.
        </p>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Bills Tracked" value={totalBills} sub="across all levels" />
          <StatCard label="Relevant to You" value={relevantBills.length} sub="high match score" />
          <StatCard label="Engagement" value={engagementLevel} sub="based on your profile" valueClass={engagementColor} />
          <StatCard label="Location" value={location} sub="personalized for you" isText />
        </div>

        {/* Bills by Level */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Legislation Coverage</h3>
          <div className="space-y-3">
            <LevelBar label="Federal" count={federalCount} total={totalBills} color="bg-blue-500" />
            <LevelBar label="State" count={stateCount} total={totalBills} color="bg-green-500" />
            <LevelBar label="Local" count={localCount} total={totalBills} color="bg-orange-500" />
          </div>
        </div>

        {/* Your Issues */}
        {issuesList.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Issues You Care About</h3>
            <div className="flex flex-wrap gap-2">
              {issuesList.map((issue, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connection prompt */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">Your voice matters</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {relevantBills.length} bills directly impact your life based on your profile.
                Visit the Community tab to see how your neighbors feel about these same issues,
                share your story, and find ways to take action together.
              </p>
            </div>
          </div>
        </div>

        {/* Top Relevant Bills */}
        {relevantBills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Most Relevant to You</h3>
            <div className="space-y-3">
              {relevantBills.slice(0, 5).map((bill, i) => (
                <div key={bill.id || i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{bill.title}</p>
                    <p className="text-xs text-gray-500">{bill.scope || 'Federal'} &middot; Score: {bill.relevanceScore}</p>
                  </div>
                  {bill.relevanceExplanation && (
                    <span className="text-xs text-blue-600 flex-shrink-0 max-w-[200px] truncate hidden md:block">
                      {bill.relevanceExplanation}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ label, value, sub, valueClass = 'text-gray-900', isText = false }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`${isText ? 'text-sm' : 'text-2xl'} font-bold ${valueClass} mt-1 truncate`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function LevelBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">{count} bills</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

export default MyImpactDashboard;
