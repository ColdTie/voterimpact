import React from 'react';

const PoliticianCard = ({ politician, size = 'small', showVotingRecord = false }) => {
  if (!politician) return null;

  const partyColors = {
    Democratic: 'bg-blue-100 text-blue-800',
    Republican: 'bg-red-100 text-red-800',
    Independent: 'bg-purple-100 text-purple-800'
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-2 ${size === 'large' ? 'p-4 border rounded-lg' : ''}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
        <img
          src={politician.photo}
          alt={politician.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.name)}&background=6366f1&color=fff`;
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-gray-900 truncate ${textSizes[size]}`}>
          {politician.name}
        </div>
        
        {size !== 'small' && (
          <div className={`text-gray-500 truncate ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
            {politician.position} - {politician.state}
            {politician.district && ` (${politician.district})`}
          </div>
        )}
        
        <div className="flex items-center space-x-1 mt-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${partyColors[politician.party] || 'bg-gray-100 text-gray-800'}`}>
            {politician.party}
          </span>
          
          {size === 'large' && politician.website && (
            <a
              href={politician.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Official Site
            </a>
          )}
        </div>

        {showVotingRecord && politician.votingRecord && size === 'large' && (
          <div className="mt-2 text-xs text-gray-600">
            <div className="flex space-x-4">
              <span>Progressive: {politician.votingRecord.progressive}%</span>
              <span>Bipartisan: {politician.votingRecord.bipartisan}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliticianCard;