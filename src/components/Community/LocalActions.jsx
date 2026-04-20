import React, { useState } from 'react';

const LocalActions = ({ userProfile }) => {
  const [joinedActions, setJoinedActions] = useState(new Set());

  const toggleJoin = (id) => {
    setJoinedActions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const actions = [
    {
      id: 1,
      type: 'Town Hall',
      title: 'Mayor\'s Open Q&A Session',
      description: 'Bring your questions about the city budget, road repairs, and the new development proposal. All residents welcome.',
      date: 'Saturday, Apr 26',
      time: '10:00 AM - 12:00 PM',
      location: 'Community Center, Main St',
      joined: 47,
      capacity: 100,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'border-blue-200 bg-blue-50',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      type: 'Letter Campaign',
      title: 'Save Bus Route 47',
      description: 'A coordinated letter-writing effort to the transit authority. Templates provided — takes 5 minutes.',
      date: 'Ongoing — deadline May 1',
      time: null,
      location: 'Online',
      joined: 156,
      capacity: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'border-amber-200 bg-amber-50',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      id: 3,
      type: 'Volunteer',
      title: 'Community Health Fair Setup',
      description: 'Help set up and run booths at the annual health fair. Free screenings, insurance signup help, and wellness resources for the neighborhood.',
      date: 'Sunday, May 4',
      time: '8:00 AM - 2:00 PM',
      location: 'Riverside Park Pavilion',
      joined: 23,
      capacity: 50,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'border-rose-200 bg-rose-50',
      iconBg: 'bg-rose-100 text-rose-600',
    },
    {
      id: 4,
      type: 'Meeting',
      title: 'Neighborhood Watch Kickoff',
      description: 'First meeting to organize a neighborhood watch program. Meet your block captains and discuss safety priorities.',
      date: 'Wednesday, Apr 30',
      time: '7:00 PM - 8:30 PM',
      location: 'Library Meeting Room B',
      joined: 31,
      capacity: 40,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'border-green-200 bg-green-50',
      iconBg: 'bg-green-100 text-green-600',
    },
    {
      id: 5,
      type: 'Petition',
      title: 'Crosswalk Safety on Oak Avenue',
      description: 'Three accidents at the Oak & 5th intersection this year. We\'re petitioning the city to add a protected crosswalk and reduce the speed limit.',
      date: 'Ongoing — 89 of 200 signatures',
      time: null,
      location: 'Online + in-person at farmers market',
      joined: 89,
      capacity: 200,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'border-purple-200 bg-purple-50',
      iconBg: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-900">Local Actions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Create Action
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Ways to get involved in your community right now
      </p>

      <div className="space-y-3">
        {actions.map((action) => {
          const isJoined = joinedActions.has(action.id);
          const progressPercent = action.capacity
            ? Math.round(((isJoined ? action.joined + 1 : action.joined) / action.capacity) * 100)
            : null;

          return (
            <div
              key={action.id}
              className={`border rounded-lg p-4 transition-all ${action.color}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${action.iconBg}`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {action.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{action.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{action.date}{action.time ? ` · ${action.time}` : ''}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{action.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      {progressPercent !== null && (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-white/60 rounded-full h-1.5">
                            <div
                              className="bg-gray-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {isJoined ? action.joined + 1 : action.joined}/{action.capacity}
                          </span>
                        </div>
                      )}
                      {progressPercent === null && (
                        <span className="text-xs text-gray-500">
                          {isJoined ? action.joined + 1 : action.joined} people joined
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleJoin(action.id)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                        isJoined
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isJoined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocalActions;
