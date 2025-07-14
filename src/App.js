import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import LegislationCard from './components/LegislationCard';
import AuthWrapper from './components/Auth/AuthWrapper';
import UserProfileForm from './components/UserProfileForm';

const sampleLegislation = [
  {
    id: 1,
    title: 'Affordable Housing Tax Credit Extension',
    status: 'In Committee',
    category: 'Housing',
    personalImpact: 'As a renter in Austin, this bill could reduce your housing costs by up to $200/month through expanded tax credits for affordable housing development.',
    financialEffect: 2400,
    timeline: '6-12 months',
    confidence: 75,
    isBenefit: true
  },
  {
    id: 2,
    title: 'Healthcare Premium Relief Act',
    status: 'Passed',
    category: 'Healthcare',
    personalImpact: 'This legislation caps healthcare premiums at 8% of income for middle-class families, potentially saving you money on insurance costs.',
    financialEffect: 1800,
    timeline: '3-6 months',
    confidence: 90,
    isBenefit: true
  },
  {
    id: 3,
    title: 'Federal Gas Tax Increase',
    status: 'Proposed',
    category: 'Economic',
    personalImpact: 'The proposed 15¢ per gallon gas tax increase would cost the average Austin commuter approximately $300 annually.',
    financialEffect: -300,
    timeline: '12+ months',
    confidence: 45,
    isBenefit: false
  }
];

function MainApp() {
  const { user, userProfile, loading } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All Issues');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [useAI, setUseAI] = useState(false);
  
  const filteredLegislation = activeFilter === 'All Issues' 
    ? sampleLegislation 
    : sampleLegislation.filter(item => item.category === activeFilter);

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
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
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
