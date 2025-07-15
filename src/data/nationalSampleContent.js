// Location-agnostic sample content that works for all US users
import { ContentTypes, ContentStatus, ContentCategories, ContentScope } from '../types/contentTypes';

// Federal content that applies to all US users
export const federalSampleContent = [
  {
    id: 'federal-housing-credit-2025',
    type: ContentTypes.FEDERAL_BILL,
    title: 'Affordable Housing Tax Credit Extension Act',
    status: ContentStatus.IN_COMMITTEE,
    scope: ContentScope.FEDERAL,
    category: ContentCategories.HOUSING,
    description: 'Extends and expands the Low-Income Housing Tax Credit program to increase affordable housing development nationwide.',
    summary: 'This bill extends the Low-Income Housing Tax Credit (LIHTC) program through 2030 and increases the annual credit authority by 50%.',
    keyProvisions: [
      'Annual credit allocation increased by 50%',
      'Income targeting: 10% of credits reserved for extremely low-income families',
      'Rural set-aside increased from 10% to 15%'
    ],
    fullTextExcerpts: {
      impactSections: [
        "SEC. 103. INCREASE IN HOUSING CREDIT DOLLAR AMOUNT. Section 42(h)(3)(C) is amended by striking '$2.30' and inserting '$3.45'. This increases the per-capita housing credit authority from $2.30 to $3.45 per resident.",
        "SEC. 105. TARGETING REQUIREMENTS. Not less than 10 percent of housing credit allocations in each State shall be reserved for projects serving households with incomes not exceeding 30 percent of area median income."
      ],
      eligibilityText: "Projects receiving housing credits under this section must maintain affordability for not less than 30 years. Tenants must have household incomes not exceeding 60 percent of area median income, with rent not exceeding 30 percent of applicable income limit.",
      financialImpact: "The increased credit authority is projected to create 300,000 additional affordable housing units over 10 years, potentially reducing rental costs by $150-400 per month in participating developments."
    },
    sponsor: 'Sen. Bernie Sanders (I-VT)',
    dateIntroduced: '2025-03-15',
    estimatedCost: 12000000000,
    congress: 119,
    chamber: 'senate',
    billNumber: 'S.1234',
    relevantDemographics: ['low_income', 'renters', 'young_adults', 'all_residents'],
    relevantInterests: ['housing_affordability', 'economic_development'],
    priorityMatch: ['affordable_housing', 'cost_of_living'],
    personalImpact: 'This bill could reduce your housing costs through expanded tax credits that encourage affordable housing development in your area.',
    financialEffect: 2400,
    timeline: '6-12 months',
    confidence: 75,
    isBenefit: true
  },
  {
    id: 'federal-veterans-healthcare-2025',
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
    fullTextExcerpts: {
      impactSections: [
        "SEC. 201. ELIMINATION OF COPAYMENTS. Section 1722A(a) of title 38, United States Code, is amended by adding 'No copayment shall be required for mental health care services provided under this section, including individual therapy, group therapy, psychiatric consultations, and crisis intervention services.'",
        "SEC. 203. SAME-DAY CRISIS CARE. The Secretary shall ensure that any veteran requesting crisis mental health care receives an appointment on the same day such care is requested, either in person or through telehealth services."
      ],
      eligibilityText: "All veterans enrolled in VA healthcare are eligible for expanded mental health services regardless of service-connected disability rating or income level.",
      financialImpact: "Veterans currently paying copays for mental health services will save an average of $150 per session. Crisis intervention services previously unavailable will provide immediate support during mental health emergencies."
    },
    sponsor: 'Rep. Mark Takano (D-CA)',
    dateIntroduced: '2025-02-01',
    estimatedCost: 18500000000,
    congress: 119,
    chamber: 'house',
    billNumber: 'H.R.789',
    relevantDemographics: ['veterans', 'military_families', 'all_residents'],
    relevantInterests: ['veterans_affairs', 'healthcare_access', 'mental_health'],
    priorityMatch: ['veterans_support', 'healthcare_access', 'mental_health'],
    personalImpact: 'As a veteran, this could eliminate your mental health copays and improve access to VA services.',
    financialEffect: 1200,
    timeline: '3-6 months',
    confidence: 85,
    isBenefit: true
  },
  {
    id: 'federal-infrastructure-broadband',
    type: ContentTypes.FEDERAL_BILL,
    title: 'Rural Broadband Infrastructure Act',
    status: ContentStatus.INTRODUCED,
    scope: ContentScope.FEDERAL,
    category: ContentCategories.INFRASTRUCTURE,
    description: 'Allocates $50 billion for broadband infrastructure in underserved rural and urban areas.',
    summary: 'Major infrastructure investment in high-speed internet access for underserved communities.',
    keyProvisions: [
      '$50 billion over 5 years for broadband infrastructure',
      'Priority for rural and low-income areas',
      'Affordable internet access programs',
      'Municipal broadband support'
    ],
    fullTextExcerpts: {
      impactSections: [
        "SEC. 301. BROADBAND INFRASTRUCTURE DEPLOYMENT. The Secretary shall make grants to eligible entities for the deployment of broadband infrastructure in underserved areas where 25 percent or more of the population lacks access to broadband service with download speeds of at least 25 Mbps and upload speeds of at least 3 Mbps.",
        "SEC. 305. AFFORDABILITY PROGRAMS. Grant recipients must offer broadband service at rates not exceeding $30 per month for qualifying low-income households with incomes at or below 200 percent of the Federal Poverty Guidelines."
      ],
      eligibilityText: "Priority given to projects serving rural areas, Tribal lands, and persistent poverty counties. Municipal broadband projects eligible with local government sponsorship.",
      financialImpact: "Qualifying households can access high-speed internet for $30/month maximum. Infrastructure grants may reduce monthly costs by $20-50 in newly served areas."
    },
    sponsor: 'Sen. Amy Klobuchar (D-MN)',
    dateIntroduced: '2025-04-10',
    estimatedCost: 50000000000,
    relevantDemographics: ['rural_residents', 'low_income', 'students', 'all_residents'],
    relevantInterests: ['infrastructure', 'technology_access', 'economic_development'],
    priorityMatch: ['internet_access', 'infrastructure', 'economic_opportunity'],
    personalImpact: 'This could bring high-speed internet to your area and reduce internet costs.',
    financialEffect: 600,
    timeline: '1-2 years',
    confidence: 60,
    isBenefit: true
  },
  {
    id: 'federal-child-tax-credit',
    type: ContentTypes.FEDERAL_BILL,
    title: 'Enhanced Child Tax Credit Act',
    status: ContentStatus.IN_COMMITTEE,
    scope: ContentScope.FEDERAL,
    category: ContentCategories.SOCIAL_ISSUES,
    description: 'Expands the Child Tax Credit to $3,000 per child and makes it fully refundable.',
    summary: 'Increases Child Tax Credit amounts and extends eligibility to more families.',
    keyProvisions: [
      '$3,000 per child under 18',
      '$3,600 per child under 6',
      'Fully refundable credit',
      'Phased monthly payments available'
    ],
    sponsor: 'Rep. Rosa DeLauro (D-CT)',
    dateIntroduced: '2025-01-30',
    estimatedCost: 110000000000,
    relevantDemographics: ['families_with_children', 'low_income', 'middle_income', 'all_residents'],
    relevantInterests: ['family_support', 'tax_policy', 'childcare'],
    priorityMatch: ['family_support', 'economic_relief'],
    personalImpact: 'If you have children, this could provide up to $3,600 per child annually in tax credits.',
    financialEffect: 3000,
    timeline: '4-8 months',
    confidence: 70,
    isBenefit: true
  }
];

// Generic content templates that can be customized per location
export function generateLocalContentTemplates(userLocation) {
  if (!userLocation) return [];
  
  const locationInfo = parseUserLocation(userLocation);
  const templates = [];

  // Generic infrastructure bond
  templates.push({
    id: `local-infrastructure-${locationInfo.stateCode?.toLowerCase() || 'generic'}`,
    type: ContentTypes.BALLOT_MEASURE,
    title: `${locationInfo.city || 'Local'} Infrastructure Improvement Bond`,
    status: ContentStatus.ON_BALLOT,
    scope: ContentScope.LOCAL,
    category: ContentCategories.INFRASTRUCTURE,
    location: locationInfo,
    description: 'Bond measure to fund road repairs, sidewalk improvements, and storm drain upgrades.',
    summary: 'General obligation bond to fund critical infrastructure repairs and improvements in your area.',
    electionDate: '2025-11-04',
    estimatedCost: 75000000,
    votingOptions: ['Yes', 'No'],
    keyProvisions: [
      'Road and bridge repairs',
      'Sidewalk accessibility improvements',
      'Storm water management upgrades',
      'Traffic signal modernization'
    ],
    fullTextExcerpts: {
      impactSections: [
        `SECTION 1. BOND AUTHORIZATION. The City is hereby authorized to incur bonded indebtedness in an amount not to exceed $75,000,000 for the purpose of financing infrastructure improvements including roadway reconstruction, bridge repairs, and accessibility upgrades.`,
        `SECTION 3. PROJECT TIMELINE. Infrastructure improvements funded by this bond shall commence within 18 months of bond issuance and be substantially completed within 5 years.`
      ],
      eligibilityText: `All city residents and property owners will benefit from improved infrastructure. Construction may cause temporary traffic disruptions during project phases.`,
      financialImpact: `Property taxes will increase by approximately $120 annually for median-value homes to service bond debt over 20-year repayment period.`
    },
    relevantDemographics: ['commuters', 'homeowners', 'businesses', 'all_residents'],
    relevantInterests: ['infrastructure', 'public_safety', 'property_values'],
    priorityMatch: ['infrastructure', 'community_development'],
    personalImpact: 'This infrastructure bond could improve roads and safety in your neighborhood.',
    financialEffect: -120,
    timeline: '2-3 years',
    confidence: 65,
    isBenefit: true,
    isSampleContent: true
  });

  // Generic public safety measure
  templates.push({
    id: `local-public-safety-${locationInfo.stateCode?.toLowerCase() || 'generic'}`,
    type: ContentTypes.TAX_MEASURE,
    title: `${locationInfo.city || 'Local'} Public Safety Enhancement Tax`,
    status: ContentStatus.ON_BALLOT,
    scope: ContentScope.LOCAL,
    category: ContentCategories.PUBLIC_SAFETY,
    location: locationInfo,
    description: 'Sales tax increase to fund police, fire, and emergency services.',
    summary: 'Local tax increase to enhance public safety services and emergency response.',
    electionDate: '2025-11-04',
    taxImpact: 0.0025, // 0.25%
    estimatedCost: 10000000,
    votingOptions: ['Yes', 'No'],
    keyProvisions: [
      'Additional police officers',
      'Fire department equipment upgrades',
      'Emergency response improvements',
      'Community safety programs'
    ],
    relevantDemographics: ['all_residents'],
    relevantInterests: ['public_safety', 'tax_policy', 'community_safety'],
    priorityMatch: ['public_safety', 'emergency_services'],
    personalImpact: 'This would increase local sales tax by 0.25% to fund enhanced police and fire services.',
    financialEffect: -150,
    timeline: '6-12 months',
    confidence: 80,
    isBenefit: false,
    isSampleContent: true
  });

  // Generic school funding measure
  if (locationInfo.state) {
    templates.push({
      id: `state-education-${locationInfo.stateCode?.toLowerCase() || 'generic'}`,
      type: ContentTypes.STATE_BILL,
      title: `${locationInfo.state} Education Funding Enhancement Act`,
      status: ContentStatus.IN_COMMITTEE,
      scope: ContentScope.STATE,
      category: ContentCategories.EDUCATION,
      location: locationInfo,
      description: 'Increases state funding for K-12 education and teacher salaries.',
      summary: 'State legislation to increase per-pupil funding and improve teacher compensation.',
      keyProvisions: [
        'Increase per-pupil funding by 15%',
        'Minimum teacher salary increase to $50,000',
        'Additional support for rural schools',
        'Special education funding enhancement'
      ],
      sponsor: `${locationInfo.state} State Legislature`,
      dateIntroduced: '2025-02-15',
      estimatedCost: 500000000,
      relevantDemographics: ['families_with_children', 'teachers', 'all_residents'],
      relevantInterests: ['education_policy', 'tax_policy', 'child_welfare'],
      priorityMatch: ['education_quality', 'education_funding'],
      personalImpact: 'This could improve education quality in your local schools through increased funding.',
      financialEffect: 0,
      timeline: '1-2 years',
      confidence: 55,
      isBenefit: true,
      isSampleContent: true
    });
  }

  return templates;
}

// Function to parse user location into components
function parseUserLocation(location) {
  if (!location || typeof location !== 'string') return {};
  
  const locationLower = location.toLowerCase();
  
  // Extract city, state from common formats like "City, State" or "City, ST"
  const parts = location.split(',').map(part => part.trim());
  
  let city, state, stateCode;
  
  if (parts.length >= 2) {
    city = parts[0];
    const statePart = parts[1];
    
    // Check if it's a state code (2 letters) or full state name
    if (statePart.length === 2) {
      stateCode = statePart.toUpperCase();
      state = getStateNameFromCode(stateCode);
    } else {
      state = statePart;
      stateCode = getStateCodeFromName(statePart);
    }
  }
  
  return { city, state, stateCode };
}

// Helper functions for state name/code conversion
function getStateNameFromCode(code) {
  const stateMap = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  };
  return stateMap[code] || code;
}

function getStateCodeFromName(name) {
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
  return stateMap[name.toLowerCase()];
}

// Main function to get all relevant content for a user
export function getNationalizedContent(userProfile) {
  const content = [...federalSampleContent];
  
  if (userProfile?.location) {
    const localContent = generateLocalContentTemplates(userProfile.location);
    content.push(...localContent);
  }
  
  return content;
}