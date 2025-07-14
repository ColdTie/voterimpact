import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import LegislationCard from './components/LegislationCard';
import AuthWrapper from './components/Auth/AuthWrapper';
import UserProfileForm from './components/UserProfileForm';

const sampleLegislation = [
  // Federal Legislation
  {
    id: 1,
    title: 'Affordable Housing Tax Credit Extension',
    status: 'In Committee',
    category: 'Housing',
    scope: 'Federal',
    personalImpact: 'As a renter, this bill could reduce your housing costs by up to $200/month through expanded tax credits for affordable housing development.',
    financialEffect: 2400,
    timeline: '6-12 months',
    confidence: 75,
    isBenefit: true,
    description: 'Extends and expands the Low-Income Housing Tax Credit program to increase affordable housing development nationwide.'
  },
  {
    id: 2,
    title: 'Healthcare Premium Relief Act',
    status: 'Passed',
    category: 'Healthcare',
    scope: 'Federal',
    personalImpact: 'This legislation caps healthcare premiums at 8% of income for middle-class families, potentially saving you money on insurance costs.',
    financialEffect: 1800,
    timeline: '3-6 months',
    confidence: 90,
    isBenefit: true,
    description: 'Provides federal subsidies to cap healthcare premiums for families earning between $50,000-$125,000 annually.'
  },
  {
    id: 3,
    title: 'Federal Gas Tax Increase',
    status: 'Proposed',
    category: 'Economic',
    scope: 'Federal',
    personalImpact: 'The proposed 15¢ per gallon gas tax increase would cost the average commuter approximately $300 annually.',
    financialEffect: -300,
    timeline: '12+ months',
    confidence: 45,
    isBenefit: false,
    description: 'Proposes increasing federal gas tax by 15 cents per gallon to fund infrastructure improvements.'
  },
  
  // Veteran Affairs
  {
    id: 4,
    title: 'VA Disability Benefits Expansion Act',
    status: 'In Committee',
    category: 'Veterans Affairs',
    scope: 'Federal',
    personalImpact: 'Expands VA disability benefits to include additional conditions and increases compensation rates for veterans.',
    financialEffect: 3600,
    timeline: '6-12 months',
    confidence: 80,
    isBenefit: true,
    description: 'Expands VA disability coverage for burn pit exposure, PTSD, and increases monthly compensation by 15%.'
  },
  {
    id: 5,
    title: 'Military Retirement Modernization Act',
    status: 'Passed',
    category: 'Veterans Affairs',
    scope: 'Federal',
    personalImpact: 'Updates military retirement system with improved TSP matching and earlier pension access.',
    financialEffect: 2400,
    timeline: '3-6 months',
    confidence: 95,
    isBenefit: true,
    description: 'Enhances Thrift Savings Plan matching for military members and provides earlier pension access options.'
  },

  // Nevada State Legislation
  {
    id: 6,
    title: 'Nevada Gaming Worker Protection Act',
    status: 'Proposed',
    category: 'Economic',
    scope: 'Nevada',
    location: 'Nevada',
    personalImpact: 'Provides job security and wage protections for casino and gaming industry workers in Nevada.',
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
    personalImpact: 'State tax credits for residential solar installations, reducing energy costs and taxes.',
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
    personalImpact: 'New bus routes and reduced fares for veterans and seniors in the Las Vegas metro area.',
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
    personalImpact: 'Adjusts property tax assessments, potentially affecting homeowners and renters differently.',
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
    personalImpact: 'New impact fees on home construction may increase housing costs but fund local infrastructure.',
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
    personalImpact: 'Provides federal funding for childcare, reducing costs for working families.',
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
    personalImpact: 'Funds climate adaptation projects that may reduce insurance costs and improve community resilience.',
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
            useAI={useAI}
          />
        ))}
        {filteredLegislation.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No legislation found for this category.</p>
          </div>
        )}
      </main>
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
