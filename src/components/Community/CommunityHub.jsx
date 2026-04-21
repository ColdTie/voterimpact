import React, { useState } from 'react';
import NeighborhoodPulse from './NeighborhoodPulse';
import ImpactStories from './ImpactStories';
import ActionBoard from './ActionBoard';

const CommunityHub = ({ userProfile }) => {
  const [section, setSection] = useState('stories');

  const sections = [
    { id: 'pulse', label: 'Neighborhood Pulse' },
    { id: 'stories', label: 'Impact Stories' },
    { id: 'actions', label: 'Action Board' },
  ];

  return (
    <div className="pb-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-6">
        <h2 className="text-xl font-bold">Community Hub</h2>
        <p className="text-blue-100 text-sm mt-1">
          Democracy is stronger when we show up together. See what your neighbors care about, share your story, and take action.
        </p>

        <div className="flex gap-2 mt-4">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                section === s.id
                  ? 'bg-white text-blue-700'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5">
        {section === 'pulse' && <NeighborhoodPulse userProfile={userProfile} />}
        {section === 'stories' && <ImpactStories userProfile={userProfile} />}
        {section === 'actions' && <ActionBoard />}
      </div>
    </div>
  );
};

export default CommunityHub;
