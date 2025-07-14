import React from 'react';

const FilterBar = ({ activeFilter, onFilterChange, activeScope, onScopeChange }) => {
  const filters = [
    'All Issues',
    'Economic',
    'Veterans Affairs',
    'Social Issues',
    'Healthcare',
    'Housing',
    'Environment',
    'Transportation'
  ];

  const scopes = [
    'All Levels',
    'Federal',
    'State',
    'Local'
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
      {/* Scope Filter */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-2">LEVEL</h3>
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {scopes.map((scope) => (
            <button
              key={scope}
              onClick={() => onScopeChange(scope)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeScope === scope
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-2">CATEGORY</h3>
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;