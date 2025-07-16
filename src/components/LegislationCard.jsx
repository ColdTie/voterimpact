import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyzePersonalImpact } from '../services/claudeService';
import BillTextService from '../services/BillTextService';
import { ContentTypes } from '../types/contentTypes';
import PoliticianCard from './PoliticianCard';
import SocialShare from './SocialShare';
import BillTracker from './BillTracker';
import RepresentativeContact from './RepresentativeContact';

const LegislationCard = ({ legislation, politicians = [], useAI = false, isSelected = false, onSelectionChange, index = 0 }) => {
  const { userProfile } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showBillTracker, setShowBillTracker] = useState(false);
  const [showRepContact, setShowRepContact] = useState(false);

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
  const financialEffect = analysis?.financialEffect || defaultFinancialEffect;
  const isBenefit = analysis?.isBenefit !== undefined ? analysis.isBenefit : defaultIsBenefit;
  
  // Adjust confidence based on analysis certainty
  let confidence = analysis?.confidence || defaultConfidence;
  if (personalImpact && (
    personalImpact.toLowerCase().includes('cannot determine') ||
    personalImpact.toLowerCase().includes('unable to determine') ||
    personalImpact.toLowerCase().includes('without full text') ||
    personalImpact.toLowerCase().includes('insufficient information')
  )) {
    confidence = Math.min(confidence, 15); // Cap at 15% for uncertain analysis
  }

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
      // First, try to get enhanced bill data with full text
      const enhancedLegislation = await BillTextService.getEnhancedBillData(legislation);
      
      // Use enhanced data for AI analysis
      const result = await analyzePersonalImpact(enhancedLegislation, userProfile);
      
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

  // Get icon and display info based on content type
  const getContentTypeInfo = (type) => {
    switch (type) {
      case ContentTypes.FEDERAL_BILL:
      case ContentTypes.STATE_BILL:
        return { icon: '📜', label: 'Bill' };
      case ContentTypes.LOCAL_ORDINANCE:
        return { icon: '📋', label: 'Ordinance' };
      case ContentTypes.BALLOT_MEASURE:
        return { icon: '🗳️', label: 'Ballot Measure' };
      case ContentTypes.CITY_PROJECT:
        return { icon: '🏗️', label: 'City Project' };
      case ContentTypes.BUDGET_ITEM:
        return { icon: '💰', label: 'Budget Item' };
      case ContentTypes.TAX_MEASURE:
        return { icon: '💸', label: 'Tax Measure' };
      case ContentTypes.ELECTION:
        return { icon: '🗳️', label: 'Election' };
      case ContentTypes.CANDIDATE:
        return { icon: '👤', label: 'Candidate' };
      case ContentTypes.PUBLIC_MEETING:
        return { icon: '👥', label: 'Meeting' };
      case ContentTypes.INFRASTRUCTURE:
        return { icon: '🛣️', label: 'Infrastructure' };
      case ContentTypes.SPECIAL_DISTRICT:
        return { icon: '🏛️', label: 'Special District' };
      default:
        return { icon: '📄', label: 'Item' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Passed':
      case 'Approved':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Committee':
      case 'In Progress':
      case 'Active':
        return 'bg-yellow-100 text-yellow-800';
      case 'Proposed':
      case 'Introduced':
      case 'On Ballot':
        return 'bg-blue-100 text-blue-800';
      case 'Failed':
      case 'Vetoed':
        return 'bg-red-100 text-red-800';
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

  const getCongressUrl = () => {
    if (!legislation.congress || !legislation.chamber || !legislation.billNumber) {
      return null;
    }
    
    // Extract bill number from full bill designation (e.g., "S.1234" -> "1234", "H.R.789" -> "789")
    const billNum = legislation.billNumber.replace(/[A-Z.]/g, '');
    const chamberMap = {
      'senate': 'senate-bill',
      'house': 'house-bill'
    };
    
    return `https://www.congress.gov/bill/${legislation.congress}th-congress/${chamberMap[legislation.chamber]}/${billNum}`;
  };

  const VoteCountBadge = ({ votes, chamber, isClickable = true }) => {
    const congressUrl = getCongressUrl();
    const handleClick = () => {
      if (congressUrl && isClickable) {
        window.open(congressUrl, '_blank', 'noopener,noreferrer');
      }
    };

    const voteElement = (
      <div className={`flex space-x-2 ${isClickable && congressUrl ? 'cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors' : ''}`}>
        <span className="text-green-600">✓ {votes.yes}</span>
        <span className="text-red-600">✗ {votes.no}</span>
        {votes.abstain > 0 && (
          <span className="text-gray-500">- {votes.abstain}</span>
        )}
      </div>
    );

    if (isClickable && congressUrl) {
      return (
        <div 
          onClick={handleClick}
          className="relative group"
          title={`Click to view full bill on Congress.gov`}
        >
          {voteElement}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            View on Congress.gov
          </div>
        </div>
      );
    }

    return voteElement;
  };

  const sponsor = findPolitician(legislation.sponsor);
  const cosponsors = legislation.cosponsors ? legislation.cosponsors.map(findPolitician).filter(Boolean) : [];
  const contentTypeInfo = getContentTypeInfo(legislation.type);

  return (
    <div className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 mx-4 mb-6 p-4`}>
      {/* Sample Content Warning */}
      {legislation.isSampleContent && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            🔬 <strong>Demo Content:</strong> This is AI-generated sample content for your area. 
            Real local measures will be integrated from official sources.
          </p>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-2">
          <div className="flex items-center mb-1">
            <span className="text-lg mr-2">{contentTypeInfo.icon}</span>
            <h3 className="text-base font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            <span>{legislation.scope || 'Federal'} {contentTypeInfo.label}</span>
            {legislation.category && (
              <span> - {legislation.category}</span>
            )}
            {legislation.relevanceScore && (
              <span className="text-xs text-gray-500 ml-2">
                {Math.round(legislation.relevanceScore)}% match
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getCongressUrl() && (
            <button
              onClick={() => window.open(getCongressUrl(), '_blank', 'noopener,noreferrer')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
              title="View full bill on Congress.gov"
            >
              📄 View Bill
            </button>
          )}
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
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-600">Committee Vote:</span>
                <VoteCountBadge votes={legislation.votingRecord.committee} chamber="committee" />
              </div>
            )}
            
            {legislation.votingRecord.senate && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-600">Senate Vote:</span>
                <VoteCountBadge votes={legislation.votingRecord.senate} chamber="senate" />
              </div>
            )}
            
            {legislation.votingRecord.house && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-600">House Vote:</span>
                <VoteCountBadge votes={legislation.votingRecord.house} chamber="house" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personal Impact Section - Simplified Inline */}
      <div className="bg-gray-50 border-l-4 border-blue-400 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Personal Impact Analysis</span>
          </div>
          {useAI && (
            <button
              onClick={generatePersonalImpact}
              disabled={loading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              title={loading ? 'Analyzing...' : 'Refresh Analysis'}
            >
              {loading ? 'Analyzing...' : 'Refresh'}
            </button>
          )}
        </div>
        
        {error && (
          <div className="text-xs text-red-600 mb-2">{error}</div>
        )}
        
        <div className="text-sm text-gray-700">
          <span className="font-medium">Financial Impact:</span> 
          <span className={`mx-2 ${
            financialEffect > 0 ? 'text-green-600' : financialEffect < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {formatFinancialEffect(financialEffect)}
          </span>
          <span className="text-gray-400">|</span>
          <span className="font-medium ml-2">Timeline:</span> 
          <span className="ml-2 text-gray-600">{timeline || '--'}</span>
        </div>
      </div>

      {/* Content-specific details */}
      {legislation.type === ContentTypes.BALLOT_MEASURE && legislation.electionDate && (
        <div className="bg-amber-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-amber-700">
            <strong>Election Date:</strong> {new Date(legislation.electionDate).toLocaleDateString()}
          </p>
          {(!legislation.sourceUrl && !legislation.billNumber) && (
            <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded">
              <p className="text-xs text-orange-800">
                ⚠️ <strong>Sample Content:</strong> This is template content for demonstration. 
                Real ballot measures would include official source links and voting registration information.
              </p>
            </div>
          )}
        </div>
      )}

      {legislation.type === ContentTypes.CITY_PROJECT && legislation.keyProvisions && (
        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Project Details</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {legislation.keyProvisions.map((provision, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-1">•</span>
                {provision}
              </li>
            ))}
          </ul>
          {legislation.estimatedCost && (
            <p className="text-xs text-blue-700 mt-2 font-medium">
              Estimated Cost: ${legislation.estimatedCost.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {legislation.type === ContentTypes.TAX_MEASURE && legislation.taxImpact && (
        <div className="bg-red-50 rounded-lg p-3 mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tax Impact</h4>
          <p className="text-sm text-red-700">
            {legislation.taxImpact > 0 ? '+' : ''}{(legislation.taxImpact * 100).toFixed(2)}% tax change
          </p>
          {legislation.estimatedCost && (
            <p className="text-xs text-red-600 mt-1">
              Annual Revenue: ${legislation.estimatedCost.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {personalImpact && (
        <div>
          {useAI && analysis && (
            <div className="flex justify-end mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                AI Analysis
              </span>
            </div>
          )}
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {personalImpact}
          </p>
          
          {/* Relevance Explanation */}
          {legislation.relevanceExplanation && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-blue-700 font-medium">Why this matters to you:</p>
                  <p className="text-xs text-blue-600 mt-1">{legislation.relevanceExplanation}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons - Streamlined */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBillTracker(true)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Track Bill"
                >
                  📌 Track
                </button>
                <button
                  onClick={() => setShowRepContact(true)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Contact Representative"
                >
                  📞 Contact
                </button>
                <button
                  onClick={() => setShowSocialShare(true)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Share"
                >
                  🔗 Share
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
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Export"
                >
                  📄 Export
                </button>
              </div>
            </div>
            
            {/* Last Updated */}
            {legislation.lastActionDate && (
              <div className="flex justify-end pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Updated: {new Date(legislation.lastActionDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
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

      {showBillTracker && (
        <BillTracker
          bill={legislation}
          onClose={() => setShowBillTracker(false)}
        />
      )}

      {showRepContact && (
        <RepresentativeContact
          userLocation={userProfile?.location}
          onClose={() => setShowRepContact(false)}
        />
      )}
    </div>
  );
};

export default LegislationCard;