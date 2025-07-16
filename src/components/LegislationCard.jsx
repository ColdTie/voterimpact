import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyzePersonalImpact } from '../services/claudeService';
import BillTextService from '../services/BillTextService';
import { ContentTypes } from '../types/contentTypes';
import PoliticianCard from './PoliticianCard';
import SocialShare from './SocialShare';
import BillTracker from './BillTracker';
import RepresentativeContact from './RepresentativeContact';

const LegislationCard = ({ legislation, politicians = [], useAI = false, isSelected = false, onSelectionChange }) => {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-4 mb-4 p-4">
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
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {contentTypeInfo.label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              legislation.scope === 'Federal' ? 'bg-blue-100 text-blue-800' :
              legislation.scope === 'State' ? 'bg-purple-100 text-purple-800' :
              legislation.scope === 'Local' || legislation.scope === 'City' ? 'bg-orange-100 text-orange-800' :
              legislation.scope === 'County' ? 'bg-amber-100 text-amber-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {legislation.scope || 'Federal'}
            </span>
            {legislation.category && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                {legislation.category}
              </span>
            )}
            {legislation.location && (typeof legislation.location === 'string' ? legislation.location : 
              legislation.location.city || legislation.location.county || legislation.location.state) && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {typeof legislation.location === 'string' ? legislation.location : 
                 legislation.location.city || legislation.location.county || legislation.location.state}
              </span>
            )}
            {legislation.relevanceScore && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
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

      {/* Personal Impact Section - Redesigned */}
      <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Personal Impact Analysis</h4>
            </div>
            {useAI && (
              <div className="flex items-center space-x-2">
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                <button
                  onClick={generatePersonalImpact}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={loading ? 'Fetching bill text for enhanced analysis...' : 'Generate detailed AI analysis'}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      {analysis ? 'Refresh Analysis' : 'Analyze Impact'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
          
          {/* Impact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Financial Impact Card */}
            <div className={`p-4 rounded-lg border-2 ${
              financialEffect > 0 
                ? 'bg-green-50 border-green-200' 
                : financialEffect < 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Financial Impact</span>
                {financialEffect !== 0 && (
                  <div className={`w-3 h-3 rounded-full ${
                    financialEffect > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                )}
              </div>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${
                  financialEffect > 0 ? 'text-green-700' : financialEffect < 0 ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {formatFinancialEffect(financialEffect)}
                </span>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Timeline</span>
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-blue-900">{timeline}</span>
            </div>

            {/* Confidence Card */}
            <div className="p-4 rounded-lg border-2 bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Confidence</span>
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex items-center">
                <div className="flex-1 mr-3">
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        confidence >= 70 ? 'bg-green-500' : 
                        confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-lg font-semibold text-purple-900">{confidence}%</span>
              </div>
            </div>
          </div>
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
          
          {/* Action Buttons - Mobile Optimized */}
          <div className="pt-4 border-t border-gray-200">
            {/* Primary Actions - Stack vertically on mobile for better touch targets */}
            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 mb-4">
              <button
                onClick={() => setShowBillTracker(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors min-h-[44px] active:bg-blue-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V7h5l-5-5-5 5h5v10z" />
                </svg>
                Track Bill
              </button>
              <button
                onClick={() => setShowRepContact(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors min-h-[44px] active:bg-green-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Rep
              </button>
              <button
                onClick={() => setShowSocialShare(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors min-h-[44px] active:bg-purple-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
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
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors min-h-[44px] active:bg-gray-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
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