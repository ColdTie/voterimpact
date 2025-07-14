import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyzePersonalImpact } from '../services/claudeService';
import PoliticianCard from './PoliticianCard';
import SocialShare from './SocialShare';

const LegislationCard = ({ legislation, politicians = [], useAI = false, isSelected = false, onSelectionChange }) => {
  const { userProfile } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSocialShare, setShowSocialShare] = useState(false);

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

  const findPolitician = (id) => {
    return politicians.find(p => p.id === id);
  };

  const sponsor = findPolitician(legislation.sponsor);
  const cosponsors = legislation.cosponsors ? legislation.cosponsors.map(findPolitician).filter(Boolean) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-4 mb-4 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              legislation.scope === 'Federal' ? 'bg-blue-100 text-blue-800' :
              legislation.scope === 'State' ? 'bg-purple-100 text-purple-800' :
              legislation.scope === 'Local' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {legislation.scope || 'Federal'}
            </span>
            {legislation.location && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {legislation.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onSelectionChange && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelectionChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-1 text-xs text-gray-600">Compare</span>
            </label>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Politicians Section */}
      {(sponsor || cosponsors.length > 0) && (
        <div className="border-l-4 border-blue-500 pl-3 mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legislators</h4>
          
          {sponsor && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Sponsor</div>
              <PoliticianCard politician={sponsor} size="medium" />
            </div>
          )}
          
          {cosponsors.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">
                Co-sponsors ({cosponsors.length})
              </div>
              <div className="space-y-1">
                {cosponsors.slice(0, 3).map((cosponsor, index) => (
                  <PoliticianCard key={index} politician={cosponsor} size="small" />
                ))}
                {cosponsors.length > 3 && (
                  <div className="text-xs text-gray-500 pl-2">
                    + {cosponsors.length - 3} more co-sponsors
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting Record Section */}
      {legislation.votingRecord && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legislative Progress</h4>
          
          {legislation.votingRecord.lastAction && (
            <div className="text-xs text-gray-600 mb-2">
              <strong>Last Action:</strong> {legislation.votingRecord.lastAction}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2">
            {legislation.votingRecord.committee && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Committee Vote:</span>
                <div className="flex space-x-2">
                  <span className="text-green-600">✓ {legislation.votingRecord.committee.yes}</span>
                  <span className="text-red-600">✗ {legislation.votingRecord.committee.no}</span>
                  {legislation.votingRecord.committee.abstain > 0 && (
                    <span className="text-gray-500">- {legislation.votingRecord.committee.abstain}</span>
                  )}
                </div>
              </div>
            )}
            
            {legislation.votingRecord.senate && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Senate Vote:</span>
                <div className="flex space-x-2">
                  <span className="text-green-600">✓ {legislation.votingRecord.senate.yes}</span>
                  <span className="text-red-600">✗ {legislation.votingRecord.senate.no}</span>
                  {legislation.votingRecord.senate.abstain > 0 && (
                    <span className="text-gray-500">- {legislation.votingRecord.senate.abstain}</span>
                  )}
                </div>
              </div>
            )}
            
            {legislation.votingRecord.house && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">House Vote:</span>
                <div className="flex space-x-2">
                  <span className="text-green-600">✓ {legislation.votingRecord.house.yes}</span>
                  <span className="text-red-600">✗ {legislation.votingRecord.house.no}</span>
                  {legislation.votingRecord.house.abstain > 0 && (
                    <span className="text-gray-500">- {legislation.votingRecord.house.abstain}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {personalImpact}
          </p>
          {useAI && analysis && (
            <div className="absolute top-0 right-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                AI Analysis
              </span>
            </div>
          )}
          
          {/* Sharing Options */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSocialShare(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                🔗 Share Analysis
              </button>
              <button
                onClick={() => {
                  const printContent = `
                    <h2>${title}</h2>
                    <p><strong>Status:</strong> ${status}</p>
                    <p><strong>Category:</strong> ${legislation.category}</p>
                    <p><strong>Scope:</strong> ${legislation.scope}</p>
                    ${legislation.location ? `<p><strong>Location:</strong> ${legislation.location}</p>` : ''}
                    <h3>Personal Impact Analysis</h3>
                    <p>${personalImpact}</p>
                    <p><strong>Financial Effect:</strong> ${formatFinancialEffect(financialEffect)}</p>
                    <p><strong>Timeline:</strong> ${timeline}</p>
                    <p><strong>Confidence:</strong> ${confidence}%</p>
                    <hr>
                    <p><em>Generated by VoterImpact - Personalized Legislative Analysis</em></p>
                  `;
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head><title>Legislative Analysis - ${title}</title></head>
                      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        ${printContent}
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Print/Export
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Impact: <span className={financialEffect >= 0 ? 'text-green-600' : 'text-red-600'}>
                {isBenefit ? '👍 Benefit' : '👎 Cost'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Social Share Modal */}
      {showSocialShare && (
        <SocialShare
          legislation={legislation}
          analysis={analysis || {
            personalImpact,
            financialEffect,
            timeline,
            confidence,
            isBenefit
          }}
          userProfile={userProfile}
          onClose={() => setShowSocialShare(false)}
        />
      )}
    </div>
  );
};

export default LegislationCard;