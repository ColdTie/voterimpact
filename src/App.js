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

const sampleLegislation = [
  // Federal Legislation
  {
    id: 1,
    title: 'Affordable Housing Tax Credit Extension',
    status: 'In Committee',
    category: 'Housing',
    scope: 'Federal',
    personalImpact: 'You could see your housing costs reduced by up to $200/month through expanded tax credits that encourage affordable housing development in your area.',
    financialEffect: 2400,
    timeline: '6-12 months',
    confidence: 75,
    isBenefit: true,
    description: 'Extends and expands the Low-Income Housing Tax Credit program to increase affordable housing development nationwide.',
    sponsor: 'sanders-vt',
    cosponsors: ['warren-ma', 'cortez-masto-nv'],
    congress: 118,
    chamber: 'senate',
    billNumber: 'S.1234',
    votingRecord: {
      committee: { yes: 12, no: 8, abstain: 2 },
      lastAction: 'Referred to Committee on Banking, Housing, and Urban Affairs'
    }
  },
  {
    id: 2,
    title: 'Healthcare Premium Relief Act',
    status: 'Passed',
    category: 'Healthcare',
    scope: 'Federal',
    personalImpact: 'This healthcare legislation has already been enacted. If you meet the eligibility criteria mentioned in the bill description, you should contact your insurance provider or healthcare marketplace to understand how this affects your specific coverage and costs.',
    financialEffect: 0,
    timeline: 'Already enacted',
    confidence: 35,
    isBenefit: null,
    description: 'Enacted legislation providing federal healthcare premium subsidies for eligible income ranges. Specific impacts depend on individual circumstances and eligibility.',
    sponsor: 'warren-ma',
    cosponsors: ['sanders-vt', 'rosen-nv'],
    congress: 118,
    chamber: 'senate',
    billNumber: 'S.2456',
    votingRecord: {
      senate: { yes: 52, no: 48, abstain: 0 },
      house: { yes: 224, no: 211, abstain: 0 },
      lastAction: 'Signed into law'
    }
  },
  {
    id: 3,
    title: 'Federal Gas Tax Increase',
    status: 'Proposed',
    category: 'Economic',
    scope: 'Federal',
    personalImpact: 'You would pay an additional 15¢ per gallon at the pump, increasing your annual fuel costs by approximately $300 based on average driving patterns.',
    financialEffect: -300,
    timeline: '12+ months',
    confidence: 45,
    isBenefit: false,
    description: 'Proposes increasing federal gas tax by 15 cents per gallon to fund infrastructure improvements.',
    sponsor: 'tester-mt',
    cosponsors: [],
    congress: 118,
    chamber: 'house',
    billNumber: 'H.R.789',
    votingRecord: {
      committee: { yes: 8, no: 14, abstain: 0 },
      lastAction: 'Proposal under review'
    }
  },
  
  // Veteran Affairs
  {
    id: 4,
    title: 'VA Disability Benefits Expansion Act',
    status: 'In Committee',
    category: 'Veterans Affairs',
    scope: 'Federal',
    personalImpact: 'This bill proposes changes to VA disability coverage. Without access to the full legislative text, specific impacts on your benefits cannot be determined. You should review the complete bill details if this affects your situation.',
    financialEffect: 0,
    timeline: 'Unknown',
    confidence: 25,
    isBenefit: null,
    description: 'Proposed legislation related to VA disability coverage and compensation. Full bill text required for detailed analysis.',
    sponsor: 'takano-ca',
    cosponsors: ['tester-mt', 'cortez-masto-nv'],
    congress: 118,
    chamber: 'house',
    billNumber: 'H.R.3456',
    votingRecord: {
      committee: { yes: 18, no: 4, abstain: 0 },
      lastAction: 'Referred to Committee on Veterans\' Affairs'
    }
  },
  {
    id: 5,
    title: 'Military Retirement Modernization Act',
    status: 'Passed',
    category: 'Veterans Affairs',
    scope: 'Federal',
    personalImpact: 'This legislation has already been enacted. If you are military personnel or a veteran, you should check with the appropriate military or VA office to understand how implemented changes may affect your specific situation.',
    financialEffect: 0,
    timeline: 'Already enacted',
    confidence: 30,
    isBenefit: null,
    description: 'Enacted legislation related to military retirement benefits. Specific provisions would need to be reviewed through official military or VA channels.',
    sponsor: 'takano-ca',
    cosponsors: ['tester-mt', 'sanders-vt'],
    congress: 118,
    chamber: 'house',
    billNumber: 'H.R.5678',
    votingRecord: {
      senate: { yes: 87, no: 13, abstain: 0 },
      house: { yes: 398, no: 37, abstain: 0 },
      lastAction: 'Signed into law'
    }
  },

  // Nevada State Legislation
  {
    id: 6,
    title: 'Nevada Gaming Worker Protection Act',
    status: 'Proposed',
    category: 'Economic',
    scope: 'Nevada',
    location: 'Nevada',
    personalImpact: 'You would gain enhanced job security and wage protections if you work in Nevada\'s gaming industry, with guaranteed minimum wages and severance rights.',
    financialEffect: 1200,
    timeline: '6-12 months',
    confidence: 70,
    isBenefit: true,
    description: 'Establishes minimum wage standards and job protection rights for Nevada gaming industry employees.'
  },
  {
    id: 7,
    title: 'Nevada Solar Energy Tax Credit',
    status: 'In Committee',
    category: 'Environment',
    scope: 'Nevada',
    location: 'Nevada',
    personalImpact: 'You could receive up to $5,000 in state tax credits for installing solar panels on your home, reducing both energy bills and tax burden.',
    financialEffect: 5000,
    timeline: '3-6 months',
    confidence: 85,
    isBenefit: true,
    description: 'Provides up to $5,000 in state tax credits for homeowners installing solar panels in Nevada.'
  },

  // Las Vegas Local
  {
    id: 8,
    title: 'Las Vegas Metropolitan Transit Expansion',
    status: 'Passed',
    category: 'Transportation',
    scope: 'Local',
    location: 'Las Vegas, NV',
    personalImpact: 'You would benefit from new bus routes connecting to Henderson and Summerlin, plus reduced fares if you\'re a veteran or senior citizen.',
    financialEffect: 600,
    timeline: '1-3 months',
    confidence: 90,
    isBenefit: true,
    description: 'Expands RTC bus service with veteran discounts and new routes to Henderson and Summerlin.'
  },
  {
    id: 9,
    title: 'Clark County Property Tax Adjustment',
    status: 'Proposed',
    category: 'Economic',
    scope: 'Local',
    location: 'Las Vegas, NV',
    personalImpact: 'Your property taxes would increase by 3%, potentially raising your monthly housing costs whether you own or rent in Clark County.',
    financialEffect: -800,
    timeline: '6-12 months',
    confidence: 60,
    isBenefit: false,
    description: 'Proposed 3% increase in Clark County property tax rates to fund education and public safety.'
  },

  // Menifee Local Example
  {
    id: 10,
    title: 'Menifee Community Development Impact Fee',
    status: 'In Committee',
    category: 'Housing',
    scope: 'Local',
    location: 'Menifee, CA',
    personalImpact: 'You would pay an additional $3,000 impact fee if building or buying new construction, though improved parks and roads may increase property values.',
    financialEffect: -1500,
    timeline: '6-12 months',
    confidence: 75,
    isBenefit: false,
    description: 'Proposes $3,000 impact fee on new residential construction to fund parks and road improvements in Menifee.'
  },

  // Additional Categories
  {
    id: 11,
    title: 'Universal Childcare Support Act',
    status: 'Proposed',
    category: 'Social Issues',
    scope: 'Federal',
    personalImpact: 'You could receive federal childcare vouchers worth up to $400/month per child, significantly reducing your family\'s childcare expenses.',
    financialEffect: 4800,
    timeline: '12+ months',
    confidence: 40,
    isBenefit: true,
    description: 'Federal program providing childcare vouchers and expanding Head Start programs nationwide.'
  },
  {
    id: 12,
    title: 'Climate Resilience Infrastructure Act',
    status: 'In Committee',
    category: 'Environment',
    scope: 'Federal',
    personalImpact: 'You would benefit from improved flood protection and wildfire prevention in your area, potentially lowering your insurance premiums and property risks.',
    financialEffect: 800,
    timeline: '12+ months',
    confidence: 65,
    isBenefit: true,
    description: 'Invests $50 billion in climate resilience infrastructure including flood protection and wildfire prevention.'
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

  // Use the new representatives hook for accurate location-based lookup (must be before early returns)
  const { 
    representatives: userRepresentatives, 
    loading: representativesLoading, 
    error: representativesError 
  } = useRepresentatives(userProfile?.location);
  
  // Dynamic politician loading with fallback to static data
  const [politicians, setPoliticians] = useState(samplePoliticians);
  const [politiciansLoading, setPoliticiansLoading] = useState(false);
  
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
      setPoliticiansLoading(true);
      
      const userLocation = userProfile?.location ? {
        state: extractStateFromLocation(userProfile.location),
        address: userProfile.location
      } : null;
      
      const loadedPoliticians = await PoliticianService.getPoliticians(userLocation);
      setPoliticians(loadedPoliticians);
      
    } catch (error) {
      console.error('Failed to load politicians:', error);
      // Keep existing samplePoliticians as fallback
    } finally {
      setPoliticiansLoading(false);
    }
  }, [userProfile?.location, extractStateFromLocation]);
  
  // Load politicians when component mounts or when user location changes
  useEffect(() => {
    loadPoliticians();
  }, [loadPoliticians]);
  
  const filteredLegislation = sampleLegislation.filter(item => {
    const matchesCategory = activeFilter === 'All Issues' || item.category === activeFilter;
    const matchesScope = activeScope === 'All Levels' || item.scope === activeScope;
    const matchesLocation = !userProfile?.location || 
      item.scope === 'Federal' || 
      !item.location || 
      item.location.toLowerCase().includes(userProfile.location.toLowerCase()) ||
      userProfile.location.toLowerCase().includes(item.location.toLowerCase());
    
    return matchesCategory && matchesScope && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
        <UserProfileForm onComplete={() => setShowProfileForm(false)} />
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
              <span className="ml-2 text-sm text-gray-600">Loading your representatives...</span>
            </div>
          )}
          
          {representativesError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <div className="text-sm text-yellow-800">
                <strong>Note:</strong> Unable to fetch current representatives. Please visit{' '}
                <a href="https://www.house.gov/representatives/find-your-representative" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="underline">
                  house.gov
                </a> to find your representatives.
              </div>
            </div>
          )}
          
          {!representativesLoading && userRepresentatives.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {userRepresentatives.map((rep) => (
                  <div key={rep.id} className="bg-gray-50 rounded-lg p-3">
                    <PoliticianCard 
                      politician={rep} 
                      size="medium" 
                      showVotingRecord={false}
                    />
                    {rep.note && (
                      <div className="mt-2 text-xs text-gray-600 italic">
                        {rep.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {userRepresentatives.some(rep => rep.source === 'google-civic') && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  ✓ Current representatives from official sources
                </div>
              )}
              
              {userRepresentatives.some(rep => rep.source === 'fallback') && (
                <div className="mt-2 text-xs text-yellow-600 text-center">
                  ⚠ Using fallback data. For most current info, visit official government sites.
                </div>
              )}
            </>
          )}
          
          {!representativesLoading && !representativesError && userRepresentatives.length === 0 && (
            <div className="text-center py-4 text-gray-600">
              <p className="text-sm">No representatives found for your location.</p>
              <p className="text-xs mt-1">
                Visit{' '}
                <a href="https://www.house.gov/representatives/find-your-representative" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-blue-600 underline">
                  house.gov
                </a> to find your representatives.
              </p>
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
        {filteredLegislation.map((legislation) => (
          <LegislationCard 
            key={legislation.id} 
            legislation={legislation} 
            politicians={politicians}
            useAI={useAI}
            isSelected={selectedBills.some(b => b.id === legislation.id)}
            onSelectionChange={(isSelected) => handleBillSelection(legislation, isSelected)}
          />
        ))}
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
