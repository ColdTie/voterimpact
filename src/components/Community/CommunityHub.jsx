import React from 'react';
import CommunityPulse from './CommunityPulse';
import CommonGround from './CommonGround';
import DiscussionBoard from './DiscussionBoard';
import LocalActions from './LocalActions';

const CommunityHub = ({ userProfile }) => {
  const location = userProfile?.location || 'Your Area';
  const city = location.split(',')[0]?.trim() || 'Your City';
  const firstName = userProfile?.name?.split(' ')[0] || 'there';

  return (
    <div className="pb-8">
      <div className="px-4 py-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Hey {firstName}, meet your community
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-lg">
            Democracy works best when neighbors talk to each other. Here you'll find
            people near {city} who care about the same things you do — and real ways
            to make a difference together.
          </p>
          <div className="flex items-center space-x-6 mt-5">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {['bg-pink-400', 'bg-teal-400', 'bg-amber-400', 'bg-purple-400', 'bg-green-400'].map((color, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 ${color} rounded-full border-2 border-indigo-700 flex items-center justify-center text-[10px] font-bold`}
                  >
                    {['EM', 'JT', 'SK', 'DW', 'LP'][i]}
                  </div>
                ))}
              </div>
              <span className="text-sm text-blue-200">+1,177 neighbors</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-200">42 online now</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CommunityPulse userProfile={userProfile} />
            <CommonGround userProfile={userProfile} />
          </div>

          <DiscussionBoard userProfile={userProfile} />

          <LocalActions userProfile={userProfile} />
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
