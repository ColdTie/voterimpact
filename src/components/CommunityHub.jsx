import React, { useState } from 'react';
import CommunityPulse from './CommunityPulse';
import ImpactStories from './ImpactStories';
import LocalEvents from './LocalEvents';

const tabs = [
  {
    id: 'pulse',
    label: 'Community Pulse',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description: 'Vote on bills and see where your community stands'
  },
  {
    id: 'stories',
    label: 'Impact Stories',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    description: 'Share how legislation affects your daily life'
  },
  {
    id: 'events',
    label: 'Local Events',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    description: 'Find and create civic events in your area'
  }
];

const CommunityHub = ({ legislation, userProfile }) => {
  const [activeTab, setActiveTab] = useState('pulse');

  return (
    <div className="pb-6">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-1">Community Hub</h2>
          <p className="text-blue-100 text-sm">
            Connect with your neighbors, share perspectives, and take action together.
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-500">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'pulse' && (
            <CommunityPulse legislation={legislation} userProfile={userProfile} />
          )}
          {activeTab === 'stories' && (
            <ImpactStories legislation={legislation} userProfile={userProfile} />
          )}
          {activeTab === 'events' && (
            <LocalEvents userProfile={userProfile} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
