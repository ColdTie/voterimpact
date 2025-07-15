import React, { useState, useEffect } from 'react';

const DataSourceConfig = ({ onClose }) => {
  const [config, setConfig] = useState({
    useRealData: localStorage.getItem('useRealData') === 'true',
    congressApiKey: localStorage.getItem('congressApiKey') || '',
    openStatesApiKey: localStorage.getItem('openStatesApiKey') || '',
    googleCivicApiKey: localStorage.getItem('googleCivicApiKey') || ''
  });

  const [testStatus, setTestStatus] = useState({
    congress: null,
    openStates: null,
    googleCivic: null
  });

  const handleSave = () => {
    localStorage.setItem('useRealData', config.useRealData);
    localStorage.setItem('congressApiKey', config.congressApiKey);
    localStorage.setItem('openStatesApiKey', config.openStatesApiKey);
    localStorage.setItem('googleCivicApiKey', config.googleCivicApiKey);
    
    // Update environment variables
    if (config.congressApiKey) {
      process.env.REACT_APP_CONGRESS_API_KEY = config.congressApiKey;
    }
    if (config.openStatesApiKey) {
      process.env.REACT_APP_OPENSTATES_API_KEY = config.openStatesApiKey;
    }
    if (config.googleCivicApiKey) {
      process.env.REACT_APP_GOOGLE_CIVIC_API_KEY = config.googleCivicApiKey;
    }
    
    onClose();
    window.location.reload(); // Reload to apply changes
  };

  const testCongressAPI = async () => {
    setTestStatus(prev => ({ ...prev, congress: 'testing' }));
    try {
      const response = await fetch(
        `https://api.congress.gov/v3/bill/118?api_key=${config.congressApiKey}&limit=1&format=json`
      );
      
      if (response.ok) {
        setTestStatus(prev => ({ ...prev, congress: 'success' }));
      } else {
        setTestStatus(prev => ({ ...prev, congress: 'failed' }));
      }
    } catch (error) {
      setTestStatus(prev => ({ ...prev, congress: 'failed' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Data Source Configuration</h2>
        
        <div className="mb-4">
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={config.useRealData}
              onChange={(e) => setConfig({ ...config, useRealData: e.target.checked })}
              className="mr-2"
            />
            <span className="font-medium">Use Real Legislative Data</span>
          </label>
          
          {config.useRealData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <p className="font-medium text-yellow-800 mb-1">⚠️ API Keys Required</p>
              <p className="text-yellow-700">
                To use real data, you need API keys from Congress.gov and/or OpenStates.
              </p>
            </div>
          )}
        </div>

        {config.useRealData && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Congress.gov API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.congressApiKey}
                  onChange={(e) => setConfig({ ...config, congressApiKey: e.target.value })}
                  placeholder="Enter your API key or use DEMO_KEY"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={testCongressAPI}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Test
                </button>
              </div>
              {testStatus.congress && (
                <p className={`text-xs mt-1 ${
                  testStatus.congress === 'success' ? 'text-green-600' :
                  testStatus.congress === 'failed' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {testStatus.congress === 'testing' ? 'Testing...' :
                   testStatus.congress === 'success' ? '✓ API key is valid' :
                   '✗ API key is invalid or rate limited'}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Get your free API key at{' '}
                <a 
                  href="https://api.data.gov/signup/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  api.data.gov
                </a>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Google Civic Information API Key
              </label>
              <input
                type="text"
                value={config.googleCivicApiKey}
                onChange={(e) => setConfig({ ...config, googleCivicApiKey: e.target.value })}
                placeholder="For accurate representative lookup"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your free API key at{' '}
                <a 
                  href="https://console.developers.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Google Cloud Console
                </a>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                OpenStates API Key (Optional)
              </label>
              <input
                type="text"
                value={config.openStatesApiKey}
                onChange={(e) => setConfig({ ...config, openStatesApiKey: e.target.value })}
                placeholder="For state-level legislation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key at{' '}
                <a 
                  href="https://openstates.org/accounts/login/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  openstates.org
                </a>
              </p>
            </div>
          </>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
          <p className="font-medium text-blue-800 mb-1">ℹ️ About Data Sources</p>
          <ul className="text-blue-700 text-xs space-y-1">
            <li>• <strong>Sample Data:</strong> Pre-loaded example bills for testing</li>
            <li>• <strong>Real Data:</strong> Live bills from Congress.gov and OpenStates</li>
            <li>• <strong>DEMO_KEY:</strong> Limited to 30 requests/hour</li>
            <li>• <strong>Personal Key:</strong> 1,000 requests/hour</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceConfig;