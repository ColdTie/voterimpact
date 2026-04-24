import React, { useState } from 'react';

const campaigns = [
  {
    id: 1,
    title: 'Protect Renters Rights Act',
    bill: 'H.R. 3492',
    description: 'Join neighbors pushing for fair rent stabilization and tenant protections. We\'re organizing calls to our representatives this week.',
    category: 'Housing',
    pledged: 412,
    goal: 500,
    actions: { calls: 287, letters: 156, shares: 523 },
    urgent: true,
    daysLeft: 5,
    organizer: 'Housing Coalition',
    milestones: [
      { label: '100 pledges', done: true },
      { label: '250 pledges', done: true },
      { label: '500 pledges', done: false },
      { label: 'Committee hearing', done: false },
    ],
  },
  {
    id: 2,
    title: 'Community Health Clinics Funding',
    bill: 'S. 1847',
    description: 'Support increased funding for community health centers that serve uninsured and underinsured families. Every call counts.',
    category: 'Healthcare',
    pledged: 289,
    goal: 400,
    actions: { calls: 198, letters: 112, shares: 345 },
    urgent: false,
    daysLeft: 14,
    organizer: 'Health Access Network',
    milestones: [
      { label: '100 pledges', done: true },
      { label: '250 pledges', done: true },
      { label: '400 pledges', done: false },
      { label: 'Floor vote', done: false },
    ],
  },
  {
    id: 3,
    title: 'Green Infrastructure Investment',
    bill: 'H.R. 5120',
    description: 'Advocate for clean energy and transit investments in your community. This bill would fund local solar, EV charging, and bus routes.',
    category: 'Environment',
    pledged: 156,
    goal: 300,
    actions: { calls: 89, letters: 67, shares: 201 },
    urgent: false,
    daysLeft: 21,
    organizer: 'Climate Action Group',
    milestones: [
      { label: '100 pledges', done: true },
      { label: '200 pledges', done: false },
      { label: '300 pledges', done: false },
      { label: 'Subcommittee review', done: false },
    ],
  },
  {
    id: 4,
    title: 'Veterans Job Training Expansion',
    bill: 'S. 2234',
    description: 'Support expanded job training and placement services for veterans transitioning to civilian careers. Bipartisan support is growing.',
    category: 'Veterans',
    pledged: 334,
    goal: 350,
    actions: { calls: 245, letters: 189, shares: 412 },
    urgent: true,
    daysLeft: 3,
    organizer: 'Vets Forward',
    milestones: [
      { label: '100 pledges', done: true },
      { label: '250 pledges', done: true },
      { label: '350 pledges', done: false },
      { label: 'Senate vote', done: false },
    ],
  },
  {
    id: 5,
    title: 'Public School Funding Equity',
    bill: 'H.R. 4401',
    description: 'Fight for equitable school funding so every child gets a quality education regardless of zip code.',
    category: 'Education',
    pledged: 198,
    goal: 500,
    actions: { calls: 123, letters: 87, shares: 267 },
    urgent: false,
    daysLeft: 30,
    organizer: 'Education Equity Alliance',
    milestones: [
      { label: '100 pledges', done: true },
      { label: '250 pledges', done: false },
      { label: '500 pledges', done: false },
      { label: 'Committee vote', done: false },
    ],
  },
];

const categoryColors = {
  Housing: 'bg-blue-100 text-blue-800',
  Healthcare: 'bg-emerald-100 text-emerald-800',
  Environment: 'bg-green-100 text-green-800',
  Veterans: 'bg-red-100 text-red-800',
  Education: 'bg-purple-100 text-purple-800',
  Economy: 'bg-amber-100 text-amber-800',
};

function ActionCampaigns({ userProfile }) {
  const [joinedCampaigns, setJoinedCampaigns] = useState({});
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleJoin = (campaignId) => {
    setJoinedCampaigns(prev => {
      const next = { ...prev };
      if (next[campaignId]) {
        delete next[campaignId];
      } else {
        next[campaignId] = true;
      }
      return next;
    });
  };

  const filteredCampaigns = filter === 'all'
    ? campaigns
    : filter === 'urgent'
    ? campaigns.filter(c => c.urgent)
    : filter === 'joined'
    ? campaigns.filter(c => joinedCampaigns[c.id])
    : campaigns.filter(c => c.category === filter);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'urgent', 'joined', 'Housing', 'Healthcare', 'Environment', 'Veterans', 'Education'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All Campaigns' : f === 'urgent' ? 'Urgent' : f === 'joined' ? 'My Campaigns' : f}
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      {filteredCampaigns.map(campaign => {
        const progressPercent = Math.min(100, Math.round((campaign.pledged / campaign.goal) * 100));
        const isJoined = joinedCampaigns[campaign.id];
        const isExpanded = expandedCampaign === campaign.id;

        return (
          <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[campaign.category] || 'bg-gray-100 text-gray-800'}`}>
                      {campaign.category}
                    </span>
                    <span className="text-xs text-gray-400">{campaign.bill}</span>
                    {campaign.urgent && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        {campaign.daysLeft}d left
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{campaign.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{campaign.description}</p>
                </div>
                <button
                  onClick={() => handleJoin(campaign.id)}
                  className={`ml-4 flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isJoined
                      ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                      : 'bg-white text-indigo-600 border-2 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400'
                  }`}
                >
                  {isJoined ? 'Joined' : 'Join'}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-900">{campaign.pledged} pledged</span>
                  <span className="text-gray-500">Goal: {campaign.goal}</span>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      progressPercent >= 90 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{campaign.actions.calls} calls</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{campaign.actions.letters} letters</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{campaign.actions.shares} shares</span>
                  </span>
                </div>
                <button
                  onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {isExpanded ? 'Less' : 'Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Campaign Milestones</h4>
                  <div className="space-y-2">
                    {campaign.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          milestone.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {milestone.done ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                          )}
                        </div>
                        <span className={`text-sm ${milestone.done ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {milestone.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Your Rep
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-300 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Letter
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    Organized by {campaign.organizer}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No campaigns match this filter.</p>
          <button
            onClick={() => setFilter('all')}
            className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            View all campaigns
          </button>
        </div>
      )}

      {/* Start Campaign CTA */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Have a bill you care about?</h3>
        <p className="mt-1 text-sm text-gray-600">
          Start an action campaign and rally your neighbors to make your voice heard.
        </p>
        <button className="mt-4 inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start a Campaign
        </button>
      </div>
    </div>
  );
}

export default ActionCampaigns;
