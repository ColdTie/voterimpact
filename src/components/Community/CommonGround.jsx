import React, { useState } from 'react';

const CommonGround = ({ userProfile }) => {
  const [expandedNeighbor, setExpandedNeighbor] = useState(null);

  const neighbors = [
    {
      id: 1,
      initials: 'MR',
      name: 'Maria R.',
      neighborhood: 'Downtown',
      color: 'bg-teal-500',
      sharedIssues: ['Housing Costs', 'School Funding', 'Public Transit'],
      perspective: 'Parent of two, concerned about rising rent and school quality.',
      openTo: 'Coffee meetup to discuss school board proposals',
      activeFor: '3 months',
    },
    {
      id: 2,
      initials: 'JT',
      name: 'James T.',
      neighborhood: 'Westside',
      color: 'bg-indigo-500',
      sharedIssues: ['Small Business Support', 'Healthcare Access'],
      perspective: 'Small business owner navigating healthcare costs for employees.',
      openTo: 'Joining a local business advocacy group',
      activeFor: '6 months',
    },
    {
      id: 3,
      initials: 'SK',
      name: 'Sarah K.',
      neighborhood: 'North End',
      color: 'bg-rose-500',
      sharedIssues: ['Clean Energy', 'Housing Costs', 'Healthcare Access'],
      perspective: 'Nurse who sees firsthand how policy affects working families.',
      openTo: 'Volunteering at community health events',
      activeFor: '1 year',
    },
    {
      id: 4,
      initials: 'DW',
      name: 'David W.',
      neighborhood: 'Eastside',
      color: 'bg-amber-600',
      sharedIssues: ['Public Transit', 'Small Business Support'],
      perspective: 'Retired teacher who relies on public transit daily.',
      openTo: 'Attending city council meetings together',
      activeFor: '8 months',
    },
    {
      id: 5,
      initials: 'LP',
      name: 'Lisa P.',
      neighborhood: 'Midtown',
      color: 'bg-purple-500',
      sharedIssues: ['School Funding', 'Clean Energy', 'Housing Costs'],
      perspective: 'Works in tech, passionate about sustainable city planning.',
      openTo: 'Organizing a neighborhood cleanup or forum',
      activeFor: '4 months',
    },
  ];

  const userIssues = userProfile?.top_issues
    ? userProfile.top_issues.toLowerCase().split(',').map(s => s.trim())
    : [];

  const getMatchStrength = (sharedIssues) => {
    if (sharedIssues.length >= 3) return { label: 'Strong match', color: 'text-green-700 bg-green-50 border-green-200' };
    if (sharedIssues.length === 2) return { label: 'Good match', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Some overlap', color: 'text-gray-600 bg-gray-50 border-gray-200' };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-gray-900">Find Common Ground</h3>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Neighbors who care about the same issues you do — regardless of party
      </p>

      <div className="space-y-3">
        {neighbors.map((neighbor) => {
          const match = getMatchStrength(neighbor.sharedIssues);
          const isExpanded = expandedNeighbor === neighbor.id;

          return (
            <div
              key={neighbor.id}
              className="border border-gray-100 rounded-lg hover:border-gray-200 transition-all"
            >
              <button
                onClick={() => setExpandedNeighbor(isExpanded ? null : neighbor.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${neighbor.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {neighbor.initials}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{neighbor.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${match.color}`}>
                          {match.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{neighbor.neighborhood} · Active {neighbor.activeFor}</span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {neighbor.sharedIssues.map((issue) => (
                    <span
                      key={issue}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {issue}
                    </span>
                  ))}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-50">
                  <div className="mt-3 space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Their perspective</span>
                      <p className="text-sm text-gray-700 mt-1">{neighbor.perspective}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Open to</span>
                      <p className="text-sm text-gray-700 mt-1">{neighbor.openTo}</p>
                    </div>
                    <div className="flex space-x-2 pt-1">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Send Introduction
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            Matches are based on shared policy interests, not political affiliation.
            Your full profile is never shared — only your first name and general neighborhood.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommonGround;
