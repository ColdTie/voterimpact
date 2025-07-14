import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyzePersonalImpact } from '../services/claudeService';

const LegislationCard = ({ legislation, useAI = false }) => {
  const { userProfile } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    title,
    status,
    personalImpact: defaultPersonalImpact,
    timeline: defaultTimeline,
    confidence: defaultConfidence,
    financialEffect: defaultFinancialEffect,
    isBenefit: defaultIsBenefit
  } = legislation;

  // Use AI analysis if available, otherwise fall back to defaults
  const personalImpact = analysis?.personalImpact || defaultPersonalImpact;
  const timeline = analysis?.timeline || defaultTimeline;
  const confidence = analysis?.confidence || defaultConfidence;
  const financialEffect = analysis?.financialEffect || defaultFinancialEffect;
  const isBenefit = analysis?.isBenefit !== undefined ? analysis.isBenefit : defaultIsBenefit;

  useEffect(() => {
    if (useAI && userProfile && !analysis && !loading) {
      generatePersonalImpact();
    }
  }, [useAI, userProfile, analysis, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const generatePersonalImpact = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzePersonalImpact(legislation, userProfile);
      
      if (result.success) {
        setAnalysis(result.data);
      } else {
        setError(result.error);
        setAnalysis(result.data); // Use fallback data
      }
    } catch (err) {
      setError('Failed to analyze personal impact');
      console.error('Error generating personal impact:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Passed':
        return 'bg-green-100 text-green-800';
      case 'In Committee':
        return 'bg-yellow-100 text-yellow-800';
      case 'Proposed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFinancialEffect = (amount) => {
    if (amount === 0) return '$0';
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${absAmount.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-4 mb-4 p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
          {title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Personal Impact</h4>
          {useAI && (
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              <button
                onClick={generatePersonalImpact}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {analysis ? 'Refresh AI Analysis' : 'Generate AI Analysis'}
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-xs text-red-600 mb-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Financial Effect:</span>
          <div className="flex items-center">
            <span className={`text-lg font-bold ${
              financialEffect >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatFinancialEffect(financialEffect)}
            </span>
            {isBenefit !== undefined && (
              <div className={`ml-2 w-2 h-2 rounded-full ${
                isBenefit ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Timeline:</span>
          <span className="text-sm font-medium text-gray-900">{timeline}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Confidence:</span>
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{confidence}%</span>
          </div>
        </div>
      </div>

      {personalImpact && (
        <div className="relative">
          <p className="text-sm text-gray-700 leading-relaxed">
            {personalImpact}
          </p>
          {useAI && analysis && (
            <div className="absolute top-0 right-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                AI Analysis
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LegislationCard;