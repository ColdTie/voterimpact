import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import LegislationCard from './components/LegislationCard';
import AuthWrapper from './components/Auth/AuthWrapper';
import UserProfileForm from './components/UserProfileForm';
import PoliticianCard from './components/PoliticianCard';
import ComparisonModal from './components/ComparisonModal';
import PoliticianService from './services/PoliticianService';
import { useRepresentatives } from './hooks/useRepresentatives';
import { useLegislation } from './hooks/useLegislation';

const samplePoliticians = [
  {
    id: 'sanders-vt',
    name: 'Bernie Sanders',
    party: 'Independent',
    position: 'Senator',
    state: 'Vermont',
    photo: 'https://www.sanders.senate.gov/wp-content/uploads/Sanders-Profile-768x768.jpg',
    website: 'https://www.sanders.senate.gov/',
    votingRecord: { progressive: 95, bipartisan: 45 }
  },
  {
    id: 'warren-ma',
    name: 'Elizabeth Warren',
    party: 'Democratic',
    position: 'Senator',
    state: 'Massachusetts',
    photo: 'https://www.warren.senate.gov/files/images/warren_headshot.jpg',
    website: 'https://www.warren.senate.gov/',
    votingRecord: { progressive: 90, bipartisan: 55 }
  },
  {
    id: 'cortez-masto-nv',
    name: 'Catherine Cortez Masto',
    party: 'Democratic',
    position: 'Senator',
    state: 'Nevada',
    photo: 'https://www.cortezmasto.senate.gov/imo/media/image/cortez-masto-headshot.jpg',
    website: 'https://www.cortezmasto.senate.gov/',
    votingRecord: { progressive: 85, bipartisan: 65 }
  },
  {
    id: 'rosen-nv',
    name: 'Jacky Rosen',
    party: 'Democratic',
    position: 'Senator',
    state: 'Nevada',
    photo: 'https://www.rosen.senate.gov/files/images/rosen_headshot.jpg',
    website: 'https://www.rosen.senate.gov/',
    votingRecord: { progressive: 80, bipartisan: 70 }
  },
  {
    id: 'tester-mt',
    name: 'Jon Tester',
    party: 'Democratic',
    position: 'Senator',
    state: 'Montana',
    photo: 'https://www.tester.senate.gov/files/images/tester_headshot.jpg',
    website: 'https://www.tester.senate.gov/',
    votingRecord: { progressive: 60, bipartisan: 85 }
  },
  {
    id: 'takano-ca',
    name: 'Mark Takano',
    party: 'Democratic',
    position: 'Representative',
    state: 'California',
    district: '39th',
    photo: 'https://takano.house.gov/sites/takano.house.gov/files/Takano_Official.jpg',
    website: 'https://takano.house.gov/',
    votingRecord: { progressive: 95, bipartisan: 40 }
  }
];

function MainApp() {
  const { user, userProfile, loading } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All Issues');
  const [activeScope, setActiveScope] = useState('All Levels');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(5);

  // Use live legislation data instead of hardcoded bills
  const { 
    legislation: liveLegislation, 
    loading: legislationLoading, 
    error: legislationError,
    refresh: refreshLegislation 
  } = useLegislation(userProfile, {
    category: activeFilter !== 'All Issues' ? activeFilter : null,
    scope: activeScope !== 'All Levels' ? activeScope : null
  });

  // Use the new representatives hook for accurate location-based lookup (must be before early returns)
  const { 
    representatives: userRepresentatives, 
    loading: representativesLoading, 
    error: representativesError 
  } = useRepresentatives(userProfile?.location);
  
  // Dynamic politician loading with fallback to static data
  const [politicians, setPoliticians] = useState(samplePoliticians);
  
  // Helper to extract state from location string
  const extractStateFromLocation = useCallback((location) => {
    if (!location) return null;
    const locationLower = location.toLowerCase();
    
    // State name to abbreviation mapping
    const stateMap = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
    };
    
    // First try to find full state names
    for (const [stateName, stateCode] of Object.entries(stateMap)) {
      if (locationLower.includes(stateName)) {
        return stateCode;
      }
    }
    
    // Then look for state abbreviations (2-letter codes at word boundaries)
    const stateAbbreviations = Object.values(stateMap);
    const stateRegex = new RegExp(`\\b(${stateAbbreviations.join('|')})\\b`, 'i');
    const match = location.match(stateRegex);
    if (match) {
      return match[1].toUpperCase();
    }
    
    return null;
  }, []);
  
  const loadPoliticians = useCallback(async () => {
    try {
      const userLocation = userProfile?.location ? {
        state: extractStateFromLocation(userProfile.location),
        address: userProfile.location
      } : null;
      
      const loadedPoliticians = await PoliticianService.getPoliticians(userLocation);
      setPoliticians(loadedPoliticians);
      
    } catch (error) {
      // Keep existing samplePoliticians as fallback
    }
  }, [userProfile?.location, extractStateFromLocation]);
  
  // Load politicians when component mounts or when user location changes
  useEffect(() => {
    loadPoliticians();
  }, [loadPoliticians]);
  
  // Smart filtering function that calculates relevance score for each bill
  const calculateRelevanceScore = (item, profile) => {
    if (!profile) return 1; // Show all bills if no profile
    
    let score = 0;
    
    // Location relevance (highest priority)
    if (item.scope === 'Federal') {
      score += 3; // Federal bills apply to everyone
    } else if (profile.location) {
      const userLocationLower = profile.location.toLowerCase();
      const itemLocationLower = (item.location || '').toLowerCase();
      
      if (itemLocationLower.includes(userLocationLower) || 
          userLocationLower.includes(itemLocationLower)) {
        score += 5; // High relevance for location match
      } else if (item.locationTags?.includes('urban') && userLocationLower.includes('city')) {
        score += 2;
      } else if (item.locationTags?.includes('rural') && userLocationLower.includes('rural')) {
        score += 2;
      }
    }
    
    // Veteran status matching
    if (profile.is_veteran && item.veteranStatus?.includes('required')) {
      score += 4;
    } else if (profile.is_veteran && item.veteranStatus?.includes('benefits_available')) {
      score += 2;
    } else if (!profile.is_veteran && item.veteranStatus?.includes('required')) {
      score -= 2; // Reduce relevance for non-veterans
    }
    
    // Income relevance
    if (item.incomeRelevance && profile.monthly_income) {
      const monthlyIncome = parseInt(profile.monthly_income);
      if (monthlyIncome < 3000 && item.incomeRelevance.includes('low_to_moderate_income')) {
        score += 3;
      } else if (monthlyIncome >= 3000 && monthlyIncome <= 8000 && item.incomeRelevance.includes('middle_income')) {
        score += 3;
      } else if (monthlyIncome > 8000 && item.incomeRelevance.includes('middle_to_high_income')) {
        score += 3;
      }
    }
    
    // Housing status relevance
    if (profile.housing_status && item.householdRelevance) {
      if (profile.housing_status === 'rent' && item.householdRelevance.includes('housing_status_rent')) {
        score += 2;
      } else if (profile.housing_status === 'own' && item.housingRelevance?.includes('homeowners_only')) {
        score += 3;
      }
    }
    
    // Industry/employment relevance
    if (profile.industry && item.industryRelevance) {
      if (item.industryRelevance.includes(profile.industry.toLowerCase())) {
        score += 4;
      }
    }
    
    // Employment status relevance
    if (profile.employment_status && item.relevantDemographics) {
      if (profile.employment_status === 'unemployed' && item.relevantDemographics.includes('unemployed')) {
        score += 3;
      } else if (profile.employment_status === 'self_employed' && item.relevantDemographics.includes('small_business_owners')) {
        score += 3;
      } else if (profile.employment_status === 'employed' && item.relevantDemographics.includes('workers')) {
        score += 2;
      }
    }
    
    // Household size relevance
    if (profile.household_size && item.householdRelevance) {
      const householdSize = parseInt(profile.household_size);
      if (householdSize > 2 && item.householdRelevance.includes('families_with_children')) {
        score += 2;
      } else if (householdSize === 1 && item.householdRelevance.includes('single_person_households')) {
        score += 2;
      }
    }
    
    // Dependents relevance
    if (profile.dependents && item.relevantDemographics) {
      const dependents = parseInt(profile.dependents || 0);
      if (dependents > 0 && (
        item.relevantDemographics.includes('families_with_children') ||
        item.relevantDemographics.includes('students') ||
        item.priorityMatch?.includes('education_quality')
      )) {
        score += 3;
      }
    }
    
    // Transportation relevance
    if (profile.transportation && item.relevantInterests) {
      if (profile.transportation === 'public_transit' && 
          item.relevantInterests.includes('public_transportation')) {
        score += 3;
      } else if (profile.transportation === 'car' && 
                 item.relevantInterests.includes('infrastructure')) {
        score += 2;
      }
    }
    
    // Health coverage relevance
    if (profile.health_coverage && item.relevantInterests) {
      if (profile.health_coverage === 'none' && 
          item.relevantInterests.includes('healthcare_access')) {
        score += 4;
      } else if (profile.health_coverage === 'private' && 
                 item.relevantInterests.includes('affordable_healthcare')) {
        score += 2;
      }
    }
    
    // Education relevance
    if (profile.education && item.relevantInterests) {
      if (profile.education && 
          item.relevantInterests.includes('education_policy')) {
        score += 2;
      }
    }
    
    // Voting frequency engagement
    if (profile.voting_frequency && profile.voting_frequency === 'always' && 
        item.category === 'Economic') {
      score += 1; // Engaged voters get slight boost for economic bills
    }
    
    // Age relevance
    if (profile.age && item.ageRelevance) {
      const age = parseInt(profile.age);
      if (age >= 65 && item.ageRelevance.includes('seniors_65plus')) {
        score += 3;
      }
    }
    
    // Political interests matching
    if (profile.political_interests && item.relevantInterests) {
      const userInterests = typeof profile.political_interests === 'string' 
        ? profile.political_interests.toLowerCase() 
        : '';
      if (userInterests) {
        const matchingInterests = item.relevantInterests.filter(interest =>
          userInterests.includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(userInterests)
        );
        score += matchingInterests.length * 2;
      }
    }
    
    // Priority matching from user's stated concerns
    if (profile.top_issues && item.priorityMatch) {
      const userIssues = typeof profile.top_issues === 'string' 
        ? profile.top_issues.toLowerCase() 
        : '';
      if (userIssues) {
        const matchingPriorities = item.priorityMatch.filter(priority =>
          userIssues.includes(priority.toLowerCase()) ||
          priority.toLowerCase().includes(userIssues)
        );
        score += matchingPriorities.length * 3;
      }
    }
    
    // Financial concerns matching
    if (profile.financial_concerns && item.priorityMatch) {
      const userConcerns = typeof profile.financial_concerns === 'string' 
        ? profile.financial_concerns.toLowerCase() 
        : '';
      if (userConcerns) {
        const matchingConcerns = item.priorityMatch.filter(priority =>
          userConcerns.includes(priority.toLowerCase()) ||
          priority.toLowerCase().includes(userConcerns)
        );
        score += matchingConcerns.length * 2;
      }
    }
    
    return Math.max(score, 0.1); // Minimum score to ensure items aren't completely filtered out
  };

  // Generate explanation for why a bill is relevant to the user
  const generateRelevanceExplanation = (item, profile, score) => {
    if (!profile || score <= 1) return null;

    const reasons = [];
    
    // Location-based relevance
    if (item.scope === 'Federal') {
      reasons.push('affects all Americans');
    } else if (profile.location && item.location && 
               item.location.toLowerCase().includes(profile.location.toLowerCase())) {
      reasons.push(`directly impacts your area (${profile.location})`);
    }

    // Veteran status
    if (profile.is_veteran && item.veteranStatus?.includes('required')) {
      reasons.push('provides specific benefits for veterans');
    }

    // Employment/Industry
    if (profile.employment_status === 'unemployed' && 
        item.relevantDemographics?.includes('unemployed')) {
      reasons.push('addresses unemployment concerns');
    }
    if (profile.industry && item.industryRelevance?.includes(profile.industry.toLowerCase())) {
      reasons.push(`relevant to the ${profile.industry} industry`);
    }

    // Family situation
    if (profile.dependents && parseInt(profile.dependents) > 0 && 
        item.relevantDemographics?.includes('families_with_children')) {
      reasons.push('affects families with children');
    }

    // Income relevance
    if (profile.monthly_income) {
      const income = parseInt(profile.monthly_income);
      if (income < 3000 && item.incomeRelevance?.includes('low_to_moderate_income')) {
        reasons.push('designed to help lower-income households');
      }
    }

    // Transportation
    if (profile.transportation === 'public_transit' && 
        item.relevantInterests?.includes('public_transportation')) {
      reasons.push('improves public transportation options');
    }

    // Health coverage
    if (profile.health_coverage === 'none' && 
        item.relevantInterests?.includes('healthcare_access')) {
      reasons.push('expands healthcare access for uninsured individuals');
    }

    // Interests and priorities
    if (profile.political_interests && item.relevantInterests) {
      const userInterests = profile.political_interests.toLowerCase();
      const matchingInterests = item.relevantInterests.filter(interest =>
        userInterests.includes(interest.toLowerCase())
      );
      if (matchingInterests.length > 0) {
        reasons.push(`aligns with your interests in ${matchingInterests.join(', ')}`);
      }
    }

    if (reasons.length === 0) return null;

    return `This bill is relevant to you because it ${reasons.slice(0, 3).join(', ')}.`;
  };

  // Ensure we always have some data to work with
  let safeliveLegislation;
  try {
    safeliveLegislation = liveLegislation && liveLegislation.length > 0 
      ? liveLegislation 
      : []; // Use nationalized content system instead of hardcoded samples

  } catch (error) {
    safeliveLegislation = []; // Empty fallback to prevent crashes
  }

  // Apply smart filtering to live legislation data (with safety checks)
  let filteredAndSortedLegislation = [];
  
  try {
    filteredAndSortedLegislation = (safeliveLegislation || [])
      .map(item => {
        try {
          // Add smart filtering tags if they don't exist (for live data)
          const enhancedItem = {
            ...item,
            relevantDemographics: item.relevantDemographics || [],
            relevantInterests: item.relevantInterests || [],
            householdRelevance: item.householdRelevance || [],
            incomeRelevance: item.incomeRelevance || [],
            locationTags: item.locationTags || [],
            priorityMatch: item.priorityMatch || []
          };
          
          const score = calculateRelevanceScore(enhancedItem, userProfile);
          const explanation = generateRelevanceExplanation(enhancedItem, userProfile, score);
          
          return {
            ...enhancedItem,
            relevanceScore: score,
            relevanceExplanation: explanation
          };
        } catch (itemError) {
          // Return item with minimal processing if smart filtering fails
          return {
            ...item,
            relevanceScore: 1,
            relevanceExplanation: null,
            relevantDemographics: [],
            relevantInterests: [],
            householdRelevance: [],
            incomeRelevance: [],
            locationTags: [],
            priorityMatch: []
          };
        }
      })
      .sort((a, b) => {
        try {
          // Sort by relevance score (highest first), then by financial effect if benefits
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          if (a.isBenefit && b.isBenefit) {
            return (b.financialEffect || 0) - (a.financialEffect || 0);
          }
          return 0;
        } catch (sortError) {
          return 0;
        }
      });
  } catch (filterError) {
    // Fallback to basic data without smart filtering
    filteredAndSortedLegislation = safeliveLegislation || [];
  }

  const filteredLegislation = filteredAndSortedLegislation;

  if (loading || legislationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Loading...' : 'Loading legislation...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  if (!userProfile || showProfileForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <UserProfileForm onComplete={() => {
          setShowProfileForm(false);
        }} />
      </div>
    );
  }


  // Emergency fallback to prevent white screen
  try {
    if (!Array.isArray(safeliveLegislation) || safeliveLegislation.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
            <p className="text-gray-600">Unable to load legislation data. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  } catch (emergencyError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Error</h2>
          <p className="text-gray-600">Something went wrong. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  // Convert Supabase profile format to component format
  const displayUser = {
    name: userProfile.name,
    age: userProfile.age,
    location: userProfile.location,
    monthlyIncome: userProfile.monthly_income,
    isVeteran: userProfile.is_veteran,
    company: userProfile.company,
    politicalInterests: userProfile.political_interests || []
  };


  // Bill comparison functions
  const handleBillSelection = (bill, isSelected) => {
    if (isSelected) {
      setSelectedBills(prev => [...prev, bill]);
    } else {
      setSelectedBills(prev => prev.filter(b => b.id !== bill.id));
    }
  };

  const clearSelectedBills = () => {
    setSelectedBills([]);
  };

  const openComparison = () => {
    if (selectedBills.length > 1) {
      setShowComparison(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={displayUser} 
        onEditProfile={() => setShowProfileForm(true)}
      />
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ai-toggle"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="ai-toggle" className="text-sm font-medium text-gray-700">
              AI-Powered Personal Analysis
            </label>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Claude
            </span>
          </div>
          {useAI && (
            <div className="text-xs text-gray-500">
              Analysis powered by Claude AI
            </div>
          )}
        </div>
      </div>

      {/* Legislation Error/Status Section */}
      {legislationError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {legislationError} Using sample data for now.
                <button 
                  onClick={refreshLegislation}
                  className="ml-2 text-yellow-800 underline hover:text-yellow-900"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* User Representatives Section */}
      {userProfile?.location && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Your Representatives</h3>
            <span className="text-xs text-gray-500">
              Based on your location: {userProfile.location}
            </span>
          </div>
          
          {representativesLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Finding your representatives...</span>
            </div>
          )}
          
          {representativesError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
              <div className="text-sm text-yellow-800 mb-3">
                <strong>Unable to load representatives automatically</strong>
                <p className="mt-1">We couldn't fetch your representatives from our data sources. Please use the button below to find them on the official government website.</p>
              </div>
              <button
                onClick={() => window.open('https://www.house.gov/representatives/find-your-representative', '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Find My Representatives
              </button>
            </div>
          )}
          
          {!representativesLoading && userRepresentatives.length > 0 && (
            <>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {userRepresentatives.map((rep) => (
                    <div key={rep.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{rep.name}</div>
                        <div className="text-gray-600">{rep.position} ({rep.party?.charAt(0) || 'I'})</div>
                      </div>
                      {rep.website && (
                        <a 
                          href={rep.website} 
                          target="_blank" 
                          rel="noopener,noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Contact
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {userRepresentatives.some(rep => rep.source === 'fallback') && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  ⓘ Using sample data. Visit official sites for current info.
                </div>
              )}
            </>
          )}
          
          {!representativesLoading && !representativesError && userRepresentatives.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition-colors"
                 onClick={() => window.open('https://www.house.gov/representatives/find-your-representative', '_blank', 'noopener,noreferrer')}>
              <div className="text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.5a8.25 8.25 0 0116.5 0" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">House Representative</p>
                <p className="text-sm text-gray-700 mb-4">We need your exact address to identify your House Representative</p>
                <button
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Find My Representative
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <FilterBar 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        activeScope={activeScope}
        onScopeChange={setActiveScope}
      />
      <main className="pb-6">
        {/* Bill count indicator */}
        {filteredLegislation.length > 0 && (
          <div className="px-4 mb-4">
            <p className="text-sm text-gray-600">
              Showing {Math.min(displayLimit, filteredLegislation.length)} of {filteredLegislation.length} bills
            </p>
          </div>
        )}
        
        {/* Display limited bills */}
        {filteredLegislation.slice(0, displayLimit).map((legislation, index) => (
          <LegislationCard 
            key={legislation.id} 
            legislation={legislation} 
            politicians={politicians}
            useAI={useAI}
            isSelected={selectedBills.some(b => b.id === legislation.id)}
            onSelectionChange={(isSelected) => handleBillSelection(legislation, isSelected)}
            index={index}
          />
        ))}
        
        {/* Load More button */}
        {filteredLegislation.length > displayLimit && (
          <div className="text-center px-4 py-6">
            <button
              onClick={() => setDisplayLimit(prev => prev + 5)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Load More Bills ({filteredLegislation.length - displayLimit} remaining)
            </button>
          </div>
        )}
        
        {filteredLegislation.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No legislation found for this category.</p>
          </div>
        )}
      </main>

      {/* Floating Comparison Bar */}
      {selectedBills.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900">
                {selectedBills.length} bill{selectedBills.length !== 1 ? 's' : ''} selected for comparison
              </span>
              <div className="flex space-x-2">
                {selectedBills.slice(0, 3).map((bill, index) => (
                  <div key={bill.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {bill.title.length > 20 ? bill.title.substring(0, 20) + '...' : bill.title}
                  </div>
                ))}
                {selectedBills.length > 3 && (
                  <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    +{selectedBills.length - 3} more
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearSelectedBills}
                className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <button
                onClick={openComparison}
                disabled={selectedBills.length < 2}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare Bills ({selectedBills.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        selectedBills={selectedBills}
        politicians={politicians}
        userProfile={userProfile}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
