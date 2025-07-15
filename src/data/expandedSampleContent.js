// Expanded sample content for all levels of government
import { ContentTypes, ContentStatus, ContentCategories, ContentScope } from '../types/contentTypes';

export const expandedSampleContent = [
  // Federal Bills
  {
    id: 'federal-housing-credit',
    type: ContentTypes.FEDERAL_BILL,
    title: 'Affordable Housing Tax Credit Extension Act',
    status: ContentStatus.IN_COMMITTEE,
    scope: ContentScope.FEDERAL,
    category: ContentCategories.HOUSING,
    description: 'Extends and expands the Low-Income Housing Tax Credit program to increase affordable housing development nationwide.',
    summary: 'This bill extends the Low-Income Housing Tax Credit (LIHTC) program through 2030 and increases the annual credit authority by 50%.',
    keyProvisions: [
      'Annual credit allocation increased by 50% ($2.3 billion to $3.5 billion)',
      'Income targeting: 10% of credits reserved for extremely low-income families',
      'Rural set-aside increased from 10% to 15%'
    ],
    sponsor: 'Sen. Bernie Sanders (I-VT)',
    dateIntroduced: '2025-03-15',
    estimatedCost: 12000000000,
    congress: 119,
    chamber: 'senate',
    billNumber: 'S.1234',
    relevantDemographics: ['low_income', 'renters', 'young_adults'],
    relevantInterests: ['housing_affordability', 'economic_development'],
    priorityMatch: ['affordable_housing', 'cost_of_living']
  },
  {
    id: 'federal-veterans-healthcare',
    type: ContentTypes.FEDERAL_BILL,
    title: 'Veterans Healthcare Expansion Act',
    status: ContentStatus.PASSED_HOUSE,
    scope: ContentScope.FEDERAL,
    category: ContentCategories.VETERANS_AFFAIRS,
    description: 'Expands healthcare benefits for veterans including mental health services and prescription coverage.',
    summary: 'Comprehensive expansion of VA healthcare benefits with focus on mental health and prescription drug coverage.',
    keyProvisions: [
      'Eliminates copays for mental health visits',
      'Expands prescription drug coverage',
      'Adds 50 new VA clinics in underserved areas',
      'Increases mental health provider staffing by 25%'
    ],
    sponsor: 'Rep. Mark Takano (D-CA)',
    dateIntroduced: '2025-02-01',
    estimatedCost: 18500000000,
    congress: 119,
    chamber: 'house',
    billNumber: 'H.R.789',
    relevantDemographics: ['veterans', 'military_families'],
    relevantInterests: ['veterans_affairs', 'healthcare_access', 'mental_health'],
    priorityMatch: ['veterans_support', 'healthcare_access', 'mental_health']
  },
  {
    id: 'federal-infrastructure-rail',
    type: ContentTypes.FEDERAL_BILL,
    title: 'National High-Speed Rail Investment Act',
    status: ContentStatus.INTRODUCED,
    scope: ContentScope.FEDERAL,
    category: ContentCategories.TRANSPORTATION,
    description: 'Allocates $200 billion for high-speed rail development across major corridors.',
    summary: 'Major infrastructure investment in high-speed rail connecting major metropolitan areas.',
    keyProvisions: [
      '$200 billion over 10 years for high-speed rail',
      'Priority corridors: Northeast, California, Texas Triangle',
      'Buy American requirements for equipment',
      'Environmental review streamlining'
    ],
    sponsor: 'Sen. Elizabeth Warren (D-MA)',
    dateIntroduced: '2025-04-10',
    estimatedCost: 200000000000,
    relevantDemographics: ['commuters', 'urban_residents', 'business_travelers'],
    relevantInterests: ['public_transportation', 'infrastructure', 'environmental_protection'],
    priorityMatch: ['transportation_access', 'infrastructure', 'climate_action']
  },

  // State Bills
  {
    id: 'ca-sb-healthcare-4all',
    type: ContentTypes.STATE_BILL,
    title: 'California Healthcare for All Act',
    status: ContentStatus.IN_COMMITTEE,
    scope: ContentScope.STATE,
    category: ContentCategories.HEALTHCARE,
    location: { state: 'California', stateCode: 'CA' },
    description: 'Establishes single-payer healthcare system for all California residents.',
    summary: 'Creates CalCare, a single-payer healthcare system providing comprehensive coverage to all California residents.',
    keyProvisions: [
      'Universal healthcare coverage for all residents',
      'Eliminates insurance premiums and deductibles',
      'Funded by progressive payroll tax',
      'Includes dental, vision, and mental health'
    ],
    sponsor: 'Sen. Scott Wiener',
    dateIntroduced: '2025-01-20',
    estimatedCost: 400000000000,
    relevantDemographics: ['all_residents', 'uninsured', 'self_employed'],
    relevantInterests: ['healthcare_access', 'healthcare_reform'],
    priorityMatch: ['healthcare_access', 'healthcare_affordability']
  },
  {
    id: 'ca-ab-rent-control',
    type: ContentTypes.STATE_BILL,
    title: 'Rent Stabilization and Tenant Protection Act',
    status: ContentStatus.PASSED_SENATE,
    scope: ContentScope.STATE,
    category: ContentCategories.HOUSING,
    location: { state: 'California', stateCode: 'CA' },
    description: 'Strengthens rent control and tenant protections statewide.',
    summary: 'Caps annual rent increases at 5% or inflation plus 2%, whichever is lower, and extends just-cause eviction protections.',
    keyProvisions: [
      'Rent increase cap: 5% or CPI+2%',
      'Just-cause eviction protections',
      'Applies to buildings 10+ years old',
      'Exempts single-family homes owned by individuals'
    ],
    sponsor: 'Asm. Matt Haney',
    dateIntroduced: '2025-02-15',
    relevantDemographics: ['renters', 'low_income', 'young_adults'],
    relevantInterests: ['housing_affordability', 'tenant_rights'],
    priorityMatch: ['affordable_housing', 'housing_stability']
  },

  // Local Measures
  {
    id: 'la-measure-transit-2025',
    type: ContentTypes.BALLOT_MEASURE,
    title: 'Los Angeles County Transit Expansion Measure',
    status: ContentStatus.ON_BALLOT,
    scope: ContentScope.COUNTY,
    category: ContentCategories.TRANSPORTATION,
    location: { county: 'Los Angeles', state: 'California', stateCode: 'CA' },
    description: 'Half-cent sales tax to fund Metro rail expansion and bus improvements.',
    summary: 'Generates $120 billion over 40 years for transit projects including rail extensions and zero-emission buses.',
    electionDate: '2025-11-04',
    estimatedCost: 120000000000,
    taxImpact: 0.005,
    votingOptions: ['Yes', 'No'],
    keyProvisions: [
      'Extends Purple Line to UCLA',
      'Gold Line extension to Claremont',
      'Convert bus fleet to zero-emission',
      'Free transit for seniors and students'
    ],
    relevantDemographics: ['commuters', 'students', 'seniors', 'low_income'],
    relevantInterests: ['public_transportation', 'environmental_protection'],
    priorityMatch: ['transportation_access', 'environmental_protection']
  },
  {
    id: 'sf-prop-homeless-services',
    type: ContentTypes.BALLOT_MEASURE,
    title: 'San Francisco Homelessness Services Tax',
    status: ContentStatus.ON_BALLOT,
    scope: ContentScope.CITY,
    category: ContentCategories.SOCIAL_ISSUES,
    location: { city: 'San Francisco', state: 'California', stateCode: 'CA' },
    description: 'Gross receipts tax on large businesses to fund homeless services and prevention.',
    summary: 'Creates dedicated funding stream for homeless services, mental health treatment, and affordable housing.',
    electionDate: '2025-11-04',
    estimatedCost: 300000000,
    votingOptions: ['Yes', 'No'],
    keyProvisions: [
      '0.5% tax on businesses with >$50M revenue',
      'Funds mental health and addiction services',
      'Creates 2,000 supportive housing units',
      'Homeless prevention programs'
    ],
    relevantDemographics: ['all_residents', 'business_owners'],
    relevantInterests: ['homelessness', 'mental_health', 'social_services'],
    priorityMatch: ['homelessness', 'public_health', 'community_safety']
  },

  // City Projects
  {
    id: 'oakland-lake-merritt-project',
    type: ContentTypes.CITY_PROJECT,
    title: 'Lake Merritt Area Improvement Project',
    status: ContentStatus.IN_PROGRESS,
    scope: ContentScope.CITY,
    category: ContentCategories.INFRASTRUCTURE,
    location: { city: 'Oakland', state: 'California', stateCode: 'CA' },
    description: 'Major renovation of Lake Merritt area including water quality improvements and park enhancements.',
    summary: 'Comprehensive improvement project for Lake Merritt including water quality, trails, and community spaces.',
    dateIntroduced: '2024-06-01',
    effectiveDate: '2024-09-01',
    estimatedCost: 85000000,
    keyProvisions: [
      'Water quality improvement systems',
      'New pedestrian and bike paths',
      'Community gathering spaces',
      'Native habitat restoration'
    ],
    relevantDemographics: ['families', 'outdoor_enthusiasts', 'nearby_residents'],
    relevantInterests: ['parks_recreation', 'environmental_protection'],
    priorityMatch: ['quality_of_life', 'environmental_protection']
  },

  // Special District Measures
  {
    id: 'water-district-conservation',
    type: ContentTypes.SPECIAL_DISTRICT,
    title: 'Water Conservation and Infrastructure Bond',
    status: ContentStatus.ON_BALLOT,
    scope: ContentScope.SPECIAL_DISTRICT,
    category: ContentCategories.INFRASTRUCTURE,
    location: { county: 'Orange', state: 'California', stateCode: 'CA' },
    description: 'Municipal Water District bond for conservation programs and infrastructure upgrades.',
    summary: '$500 million bond for water infrastructure including recycling facilities and pipe replacement.',
    electionDate: '2025-11-04',
    estimatedCost: 500000000,
    votingOptions: ['Yes', 'No'],
    keyProvisions: [
      'Water recycling facility expansion',
      'Replace 100 miles of aging pipes',
      'Smart meter installation',
      'Drought-resistant landscaping rebates'
    ],
    relevantDemographics: ['homeowners', 'property_owners'],
    relevantInterests: ['water_conservation', 'infrastructure'],
    priorityMatch: ['water_security', 'infrastructure']
  },

  // Budget Items
  {
    id: 'sacramento-budget-2025',
    type: ContentTypes.BUDGET_ITEM,
    title: 'Sacramento City Budget FY 2025-26',
    status: ContentStatus.PROPOSED,
    scope: ContentScope.CITY,
    category: ContentCategories.ECONOMIC,
    location: { city: 'Sacramento', state: 'California', stateCode: 'CA' },
    description: 'Annual city budget proposal with emphasis on public safety and youth programs.',
    summary: '$1.8 billion budget maintaining city services while addressing homelessness and public safety.',
    dateIntroduced: '2025-05-01',
    effectiveDate: '2025-07-01',
    estimatedCost: 1800000000,
    keyProvisions: [
      '5% increase in police funding',
      '$50M for homeless services',
      '$30M for youth programs',
      '$75M for street repairs'
    ],
    relevantDemographics: ['all_residents'],
    relevantInterests: ['city_services', 'public_safety', 'fiscal_policy'],
    priorityMatch: ['public_safety', 'youth_services', 'infrastructure']
  }
];

// Helper function to get content by location
export function getContentByLocation(location, contentArray = expandedSampleContent) {
  if (!location) return contentArray;
  
  const locationLower = location.toLowerCase();
  
  return contentArray.filter(item => {
    // Always include federal content
    if (item.scope === ContentScope.FEDERAL) return true;
    
    // Check location matches
    if (item.location) {
      const itemLocation = JSON.stringify(item.location).toLowerCase();
      
      // Check for city match
      if (item.location.city && locationLower.includes(item.location.city.toLowerCase())) {
        return true;
      }
      
      // Check for county match
      if (item.location.county && locationLower.includes(item.location.county.toLowerCase())) {
        return true;
      }
      
      // Check for state match
      if (item.location.state && locationLower.includes(item.location.state.toLowerCase())) {
        return true;
      }
      
      // Check for state code match
      if (item.location.stateCode && locationLower.includes(item.location.stateCode.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  });
}

// Helper function to get content by user interests
export function getContentByInterests(interests, contentArray = expandedSampleContent) {
  if (!interests || interests.length === 0) return contentArray;
  
  return contentArray.filter(item => {
    if (!item.relevantInterests) return false;
    
    return item.relevantInterests.some(interest => 
      interests.includes(interest)
    );
  });
}

// Helper function to get content by demographics
export function getContentByDemographics(demographics, contentArray = expandedSampleContent) {
  if (!demographics || demographics.length === 0) return contentArray;
  
  return contentArray.filter(item => {
    if (!item.relevantDemographics) return false;
    
    return item.relevantDemographics.some(demo => 
      demographics.includes(demo) || item.relevantDemographics.includes('all_residents')
    );
  });
}