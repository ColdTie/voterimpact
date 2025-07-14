import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ user, onEditProfile }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
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
    </header>
  );
};

export default Header;