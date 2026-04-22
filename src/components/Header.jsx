import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ user, onEditProfile, activeView, onViewChange }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onEditProfile}
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-600 transition-colors"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {user?.name || 'User'}
            </h1>
            <p className="text-sm text-gray-600">
              Monthly Income: ${user?.monthlyIncome?.toLocaleString() || '0'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">{user?.location || 'Location'}</p>
            <p className="text-xs text-gray-500">
              {user?.age ? `Age ${user.age}` : ''}
              {user?.isVeteran ? ' • Veteran' : ''}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      {onViewChange && (
        <div className="px-4 flex space-x-1 border-t border-gray-100">
          <button
            onClick={() => onViewChange('legislation')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'legislation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Legislation</span>
          </button>
          <button
            onClick={() => onViewChange('community')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'community'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Community</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
