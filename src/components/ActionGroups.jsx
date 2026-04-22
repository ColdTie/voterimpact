import React, { useState } from 'react';

const ActionGroups = ({ location }) => {
  const [joinedGroups, setJoinedGroups] = useState(new Set());

  const groups = [
    {
      id: 'grp-1',
      name: 'Housing for All Coalition',
      description: 'Working to increase affordable housing in our community. We advocate for inclusionary zoning, community land trusts, and tenant protections.',
      members: 234,
      category: 'Housing',
      activity: 'Weekly meetings, monthly council testimony',
      recentWin: 'Successfully advocated for 20% affordable housing requirement in new developments',
      color: 'indigo',
    },
    {
      id: 'grp-2',
      name: 'Transit Riders Union',
      description: 'Advocating for better public transit - more routes, longer hours, and lower fares. Everyone deserves reliable transportation.',
      members: 156,
      category: 'Transportation',
      activity: 'Monthly rides, quarterly advocacy days',
      recentWin: 'Secured funding for 3 new bus routes serving underserved neighborhoods',
      color: 'blue',
    },
    {
      id: 'grp-3',
      name: 'Parents for Schools',
      description: 'Parents and community members fighting for fully funded public schools. We believe every child deserves a quality education.',
      members: 312,
      category: 'Education',
      activity: 'School board meetings, fundraising, tutoring',
      recentWin: 'Prevented $2M in after-school program cuts through public testimony campaign',
      color: 'green',
    },
    {
      id: 'grp-4',
      name: 'Civic Health Network',
      description: 'Connecting neighbors to healthcare resources and advocating for expanded coverage. We run free health clinics and policy workshops.',
      members: 189,
      category: 'Healthcare',
      activity: 'Monthly clinics, quarterly policy workshops',
      recentWin: 'Helped 150+ families navigate insurance enrollment this year',
      color: 'rose',
    },
    {
      id: 'grp-5',
      name: 'Green Neighbors Alliance',
      description: 'Local environmental action - community gardens, clean energy advocacy, and protecting green spaces in our neighborhoods.',
      members: 98,
      category: 'Environment',
      activity: 'Weekend cleanups, garden plots, council advocacy',
      recentWin: 'Established 3 new community gardens on vacant city lots',
      color: 'emerald',
    },
    {
      id: 'grp-6',
      name: 'Democracy Project',
      description: 'Non-partisan group focused on voter engagement, election access, and civic education. We believe democracy works when everyone participates.',
      members: 267,
      category: 'Civic Engagement',
      activity: 'Voter registration, candidate forums, civics classes',
      recentWin: 'Registered 1,200+ new voters in the last election cycle',
      color: 'amber',
    },
  ];

  const colorMap = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', accent: 'bg-indigo-600', light: 'bg-indigo-100 text-indigo-800', ring: 'ring-indigo-200' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-600', light: 'bg-blue-100 text-blue-800', ring: 'ring-blue-200' },
    green: { bg: 'bg-green-50', border: 'border-green-200', accent: 'bg-green-600', light: 'bg-green-100 text-green-800', ring: 'ring-green-200' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', accent: 'bg-rose-600', light: 'bg-rose-100 text-rose-800', ring: 'ring-rose-200' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-600', light: 'bg-emerald-100 text-emerald-800', ring: 'ring-emerald-200' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-600', light: 'bg-amber-100 text-amber-800', ring: 'ring-amber-200' },
  };

  const toggleJoin = (groupId) => {
    setJoinedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Action Groups</span> are neighbor-led organizations in {location} working on issues that matter.
          Join a group to connect with people who share your priorities and make a real impact together.
        </p>
      </div>

      <div className="space-y-4">
        {groups.map(group => {
          const colors = colorMap[group.color];
          const isJoined = joinedGroups.has(group.id);

          return (
            <div key={group.id} className={`rounded-lg border ${colors.border} overflow-hidden shadow-sm`}>
              {/* Header Bar */}
              <div className={`${colors.accent} h-1`} />

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-gray-900">{group.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.light}`}>
                        {group.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {group.members + (isJoined ? 1 : 0)} members
                    </p>
                  </div>
                  <button
                    onClick={() => toggleJoin(group.id)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      isJoined
                        ? `${colors.accent} text-white ring-2 ${colors.ring}`
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>

                <p className="text-sm text-gray-700 mb-3">{group.description}</p>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-gray-600">{group.activity}</span>
                  </div>
                  <div className={`${colors.bg} rounded-lg p-2`}>
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <div>
                        <span className="text-xs font-medium text-gray-700">Recent win: </span>
                        <span className="text-xs text-gray-600">{group.recentWin}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start a Group CTA */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6 text-center">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Don't see your issue?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Start a new action group and invite neighbors who share your passion.
        </p>
        <button className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Start a New Group
        </button>
      </div>
    </div>
  );
};

export default ActionGroups;
