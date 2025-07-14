import React from 'react';

const FilterBar = ({ activeFilter, onFilterChange }) => {
  const filters = [
    'All Issues',
    'Economic',
    'Veterans Affairs',
    'Social Issues',
    'Healthcare',
    'Housing',
    'Environment'
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
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
  );
};

export default FilterBar;