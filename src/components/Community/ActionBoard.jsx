import React, { useState } from 'react';

const SAMPLE_ACTIONS = [
  {
    id: 1,
    type: 'town-hall',
    title: 'Virtual Town Hall: Housing Crisis Solutions',
    description: 'Join neighbors and local council members to discuss the affordable housing shortage and what we can do together.',
    organizer: 'Community Housing Coalition',
    date: 'Apr 28, 2026 at 7:00 PM',
    participants: 84,
    goal: 100,
    tags: ['Housing', 'Local'],
    urgent: false,
  },
  {
    id: 2,
    type: 'letter',
    title: 'Letter Campaign: Protect Clean Water Act',
    description: 'Proposed amendments would weaken clean water protections. Write your representatives — we provide the template, you add your voice.',
    organizer: 'Clean Water Alliance',
    date: 'Deadline: May 5, 2026',
    participants: 2341,
    goal: 5000,
    tags: ['Environment', 'Federal'],
    urgent: true,
  },
  {
    id: 3,
    type: 'petition',
    title: 'Petition: Expand Veterans Mental Health Services',
    description: 'VA mental health wait times in our region average 45 days. We\'re petitioning for an additional clinic and extended hours.',
    organizer: 'Veterans Community Network',
    date: 'Ongoing',
    participants: 1567,
    goal: 2500,
    tags: ['Veterans Affairs', 'Healthcare'],
    urgent: false,
  },
  {
    id: 4,
    type: 'volunteer',
    title: 'Voter Registration Drive — Spring Push',
    description: 'Help register voters in underserved neighborhoods. Training provided. 2-hour shifts available on weekends.',
    organizer: 'Democracy Works Local',
    date: 'Every Saturday in May',
    participants: 37,
    goal: 60,
    tags: ['Civic Engagement'],
    urgent: false,
  },
  {
    id: 5,
    type: 'town-hall',
    title: 'School Board Budget Listening Session',
    description: 'The school board is finalizing next year\'s budget. Show up and tell them what matters: teacher pay, school meals, after-school programs.',
    organizer: 'Parents for Public Schools',
    date: 'May 2, 2026 at 6:30 PM',
    participants: 52,
    goal: 150,
    tags: ['Education', 'Local'],
    urgent: true,
  },
];

const TYPE_CONFIG = {
  'town-hall': { label: 'Town Hall', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: MicIcon },
  'letter': { label: 'Letter Campaign', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: MailIcon },
  'petition': { label: 'Petition', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: PenIcon },
  'volunteer': { label: 'Volunteer', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: HandIcon },
};

const ActionBoard = () => {
  const [joined, setJoined] = useState({});
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? SAMPLE_ACTIONS
    : SAMPLE_ACTIONS.filter(a => a.type === filter);

  const handleJoin = (actionId) => {
    setJoined(prev => ({ ...prev, [actionId]: !prev[actionId] }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Action Board</h3>
        <p className="text-sm text-gray-500 mt-0.5">Find ways to make a difference — together</p>
      </div>

      <div className="px-5 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Actions' },
          { id: 'town-hall', label: 'Town Halls' },
          { id: 'letter', label: 'Letters' },
          { id: 'petition', label: 'Petitions' },
          { id: 'volunteer', label: 'Volunteer' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-100">
        {filtered.map(action => {
          const config = TYPE_CONFIG[action.type];
          const Icon = config.icon;
          const isJoined = joined[action.id];
          const currentParticipants = action.participants + (isJoined ? 1 : 0);
          const progress = Math.min((currentParticipants / action.goal) * 100, 100);

          return (
            <div key={action.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${config.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                    {action.urgent && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                        Urgent
                      </span>
                    )}
                    {action.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>

                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    <span>By {action.organizer}</span>
                    <span>{action.date}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          {currentParticipants.toLocaleString()} / {action.goal.toLocaleString()} people
                        </span>
                        <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoin(action.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                        isJoined
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
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

function MicIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-16a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PenIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function HandIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  );
}

export default ActionBoard;
