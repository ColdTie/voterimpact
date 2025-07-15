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
    // Smart filtering tags
    relevantDemographics: ['low_income', 'renters', 'first_time_buyers', 'young_adults'],
    relevantInterests: ['housing_affordability', 'economic_development', 'tax_policy'],
    householdRelevance: ['household_size_3+', 'housing_status_rent'],
    incomeRelevance: ['low_to_moderate_income'],
    locationTags: ['urban', 'suburban', 'rural'],
    priorityMatch: ['affordable_housing', 'cost_of_living', 'financial_stability'],
    summary: 'This bill extends the Low-Income Housing Tax Credit (LIHTC) program through 2030 and increases the annual credit authority by 50%. Key provisions include: (1) Increases the 9% credit allocation to states by 50% annually, (2) Extends the placed-in-service deadline for projects allocated credits in 2020-2023, (3) Allows income averaging across units in a project, (4) Reduces the 50% test for bond-financed developments to 25%, (5) Enables tribal governments to receive direct allocations. The bill aims to create approximately 2 million additional affordable housing units over 10 years, with priority for developments serving extremely low-income families (30% AMI or below).',
    keyProvisions: [
      'Annual credit allocation increased by 50% ($2.3 billion to $3.5 billion)',
      'Income targeting: 10% of credits reserved for developments serving extremely low-income families', 
      'Geographic distribution: Rural areas receive minimum 15% allocation',
      'Tenant protections: 30-year affordability period for all LIHTC properties',
      'Workforce development: Projects must include local hiring requirements'
    ],
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
    // Smart filtering tags
    relevantDemographics: ['middle_income', 'self_employed', 'families', 'unemployed'],
    relevantInterests: ['healthcare_access', 'affordable_healthcare', 'insurance_reform'],
    householdRelevance: ['any_household_size'],
    incomeRelevance: ['middle_income', 'moderate_income'],
    locationTags: ['urban', 'suburban', 'rural'],
    priorityMatch: ['healthcare_access', 'financial_stability', 'family_wellbeing'],
    summary: 'This law expands premium tax credits for health insurance purchased through ACA marketplaces. It eliminates the income cap for premium tax credit eligibility, increases credits for families earning 150-400% FPL, caps premium costs at 8.5% of income, provides COBRA subsidies, and enhances silver plan subsidies. Estimated to reduce premiums by $50-200/month for middle-income families.',
    keyProvisions: [
      'Premium cap: Health insurance premiums limited to 8.5% of household income',
      'Expanded eligibility: Removes 400% FPL income cap for premium tax credits',
      'Enhanced subsidies: Increased premium tax credits for incomes 150-400% FPL',
      'COBRA assistance: Temporary 100% premium subsidies for COBRA coverage',
      'Coverage improvements: Enhanced cost-sharing reductions for silver plans'
    ],
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
    summary: 'This bill increases the federal excise tax on gasoline and diesel fuel by 15 cents per gallon over a 3-year period (5 cents per year). Revenue generated would fund the Highway Trust Fund for infrastructure repairs and improvements. Key provisions: (1) Gradual implementation starting January 1, 2025, (2) Indexing to inflation after 2027, (3) $180 billion estimated revenue over 10 years, (4) Dedicated funding for bridge repairs and rural road improvements, (5) Electric vehicle charging infrastructure development. The bill includes rebates for low-income drivers and commercial transportation businesses.',
    keyProvisions: [
      'Graduated increase: 5¢ per gallon annually for 3 years (total 15¢ increase)',
      'Revenue allocation: 60% highway repairs, 25% bridge infrastructure, 15% EV charging',
      'Low-income rebate: $150 annual tax credit for households earning under $50,000',
      'Commercial exemption: Reduced rate for agricultural and emergency vehicles',
      'Inflation indexing: Tax rate adjusted annually starting 2028'
    ],
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
    summary: 'This bill expands VA disability benefits in several key areas: (1) Adds 23 medical conditions to the presumptive list for burn pit and toxic exposure, including respiratory cancers and rare respiratory diseases, (2) Extends the eligibility period for post-9/11 veterans from 10 to 15 years after service, (3) Improves access to mental health care by adding PTSD, anxiety, and depression to expedited claims processing, (4) Enhances vocational rehabilitation benefits with increased monthly allowances, (5) Establishes new regional processing centers to reduce claims backlogs from current 125 days to target 90 days.',
    keyProvisions: [
      'Toxic exposure: 23 new conditions added to presumptive list for burn pit exposure',
      'Timeline extension: Post-9/11 veterans eligible for benefits up to 15 years after service',
      'Mental health: Expedited processing for PTSD, anxiety, and depression claims',
      'Vocational rehab: Monthly allowances increased from $737 to $1,200 for full-time students',
      'Processing improvements: New regional centers to reduce claim processing time by 28%'
    ],
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
    // Smart filtering tags
    relevantDemographics: ['veterans', 'active_military', 'military_families'],
    relevantInterests: ['veterans_affairs', 'retirement_planning', 'military_benefits'],
    householdRelevance: ['military_households'],
    incomeRelevance: ['any_income'],
    locationTags: ['military_bases', 'urban', 'suburban', 'rural'],
    priorityMatch: ['retirement_security', 'veterans_benefits', 'financial_planning'],
    veteranStatus: ['required'],
    summary: 'This enacted law modernizes military retirement benefits through the Blended Retirement System (BRS). Key changes: (1) Combines traditional pension with Thrift Savings Plan (TSP) matching, (2) Reduces pension multiplier from 2.5% to 2.0% per year of service, (3) Provides automatic 1% TSP contribution plus up to 4% matching, (4) Introduces mid-career continuation pay at 12 years of service, (5) Establishes lump-sum payment option at retirement. The system applies to service members entering after January 1, 2018, with existing members having opt-in choice.',
    keyProvisions: [
      'Hybrid system: Traditional pension plus TSP matching contributions',
      'Reduced pension: 2.0% per year (down from 2.5%) for 20+ year retirees',
      'TSP matching: Up to 5% government matching in Thrift Savings Plan',
      'Continuation pay: Lump sum payment at 12 years of service',
      'Lump-sum option: Choice of partial lump sum at retirement'
    ],
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
    description: 'Establishes minimum wage standards and job protection rights for Nevada gaming industry employees.',
    // Smart filtering tags
    relevantDemographics: ['service_workers', 'tipped_workers', 'hospitality_workers'],
    relevantInterests: ['worker_rights', 'wage_protection', 'job_security'],
    householdRelevance: ['any_household_size'],
    incomeRelevance: ['low_to_moderate_income'],
    locationTags: ['nevada_only'],
    priorityMatch: ['job_security', 'fair_wages', 'worker_protection'],
    industryRelevance: ['hospitality', 'gaming', 'service'],
    summary: 'This Nevada state bill strengthens worker protections in the gaming industry. Key provisions: (1) Establishes $18/hour minimum wage for tipped gaming workers (dealers, cocktail servers), (2) Requires 30-day advance notice for layoffs affecting 25+ employees, (3) Mandates severance pay of 2 weeks per year of service for involuntary terminations, (4) Creates portable benefits system for workers moving between casinos, (5) Establishes worker safety committees with union representation. The bill also includes anti-retaliation protections and requires casinos to provide health insurance subsidies.',
    keyProvisions: [
      'Gaming worker minimum wage: $18/hour for tipped positions, $22/hour for non-tipped',
      'Layoff protection: 30-day notice requirement for workforce reductions over 25 employees',
      'Severance guarantee: 2 weeks pay per year of service for involuntary termination',
      'Portable benefits: Health insurance and retirement benefits transfer between employers',
      'Safety committees: Mandatory worker representation in casino safety oversight'
    ]
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
    description: 'Provides up to $5,000 in state tax credits for homeowners installing solar panels in Nevada.',
    // Smart filtering tags
    relevantDemographics: ['homeowners', 'middle_to_high_income', 'environmentally_conscious'],
    relevantInterests: ['renewable_energy', 'tax_incentives', 'climate_action', 'energy_savings'],
    householdRelevance: ['single_family_homes'],
    incomeRelevance: ['middle_to_high_income'],
    locationTags: ['nevada_only'],
    priorityMatch: ['environmental_protection', 'energy_costs', 'tax_savings'],
    housingRelevance: ['homeowners_only'],
    summary: 'This Nevada state bill creates a residential solar tax credit program. Key provisions: (1) Up to $5,000 state tax credit for solar panel installations, (2) Credit amount equals 25% of installation costs up to maximum, (3) Requires certified Nevada solar contractors for eligibility, (4) System must meet minimum 5kW capacity requirement, (5) Credit can be carried forward up to 5 years if it exceeds annual tax liability. The bill also establishes net metering protections and requires utility companies to maintain current buyback rates for solar energy production.',
    keyProvisions: [
      'Tax credit: 25% of installation costs up to $5,000 maximum per residence',
      'System requirements: Minimum 5kW capacity, certified Nevada contractor installation',
      'Carryforward provision: Unused credits can be applied for up to 5 years',
      'Net metering protection: Utilities must maintain current solar buyback rates',
      'Statewide cap: $50 million annual program limit, first-come first-served basis'
    ]
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
    description: 'Expands RTC bus service with veteran discounts and new routes to Henderson and Summerlin.',
    // Smart filtering tags
    relevantDemographics: ['public_transit_users', 'veterans', 'seniors', 'students', 'low_income'],
    relevantInterests: ['public_transportation', 'accessibility', 'environmental_benefits'],
    householdRelevance: ['any_household_size'],
    incomeRelevance: ['low_to_moderate_income'],
    locationTags: ['las_vegas_only', 'clark_county'],
    priorityMatch: ['transportation_access', 'cost_savings', 'environmental_protection'],
    veteranStatus: ['benefits_available'],
    ageRelevance: ['seniors_65plus'],
    summary: 'This Las Vegas ordinance expands Regional Transportation Commission (RTC) bus service throughout the valley. Key provisions: (1) 12 new bus routes connecting downtown Las Vegas to Henderson, Summerlin, and North Las Vegas, (2) Reduced fares for veterans (50% discount) and seniors 65+ (free rides), (3) Extended service hours until 1 AM on weekends, (4) New express routes to McCarran Airport and UNLV campus, (5) Electric bus fleet conversion for 30% of routes by 2026. The expansion includes new bus stops and improved accessibility features.',
    keyProvisions: [
      'Route expansion: 12 new routes connecting major valley destinations',
      'Veteran benefits: 50% fare discount for military veterans with ID',
      'Senior benefits: Free rides for residents 65 and older',
      'Extended hours: Weekend service until 1 AM on major routes',
      'Electric fleet: 30% of buses converted to electric by 2026'
    ]
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
    description: 'Proposed 3% increase in Clark County property tax rates to fund education and public safety.',
    summary: 'This Clark County ordinance increases property tax rates to fund essential services. Key provisions: (1) 3% increase in property tax rate from current $3.66 to $3.77 per $100 assessed value, (2) Revenue allocation: 60% to Clark County School District, 40% to police and fire services, (3) Homestead exemption increased from $3,000 to $5,000 for primary residences, (4) Senior citizen freeze for residents over 65 with income under $50,000, (5) First-time homebuyer exemption for properties under $300,000. The measure requires voter approval in November 2024.',
    keyProvisions: [
      'Tax rate increase: 3% increase from $3.66 to $3.77 per $100 assessed value',
      'Revenue split: 60% education funding, 40% public safety services',
      'Homestead exemption: Increased from $3,000 to $5,000 for primary residences',
      'Senior protection: Tax freeze for 65+ residents earning under $50,000 annually',
      'First-time buyer relief: Exemption for homes under $300,000 purchase price'
    ]
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
    description: 'Proposes $3,000 impact fee on new residential construction to fund parks and road improvements in Menifee.',
    summary: 'This Menifee city ordinance establishes development impact fees for new residential construction. Key provisions: (1) $3,000 per unit fee for single-family homes, $2,000 for condos/townhomes, (2) Revenue allocation: 50% parks and recreation, 30% road improvements, 20% public safety facilities, (3) Fee waiver for affordable housing developments under 80% AMI, (4) Phased implementation over 2 years to allow developer adjustment, (5) Annual review and adjustment based on construction costs. The measure includes provisions for in-lieu improvements and fee deferrals for local builders.',
    keyProvisions: [
      'Impact fees: $3,000 per single-family home, $2,000 per condo/townhome',
      'Revenue allocation: 50% parks, 30% roads, 20% public safety facilities',
      'Affordable housing waiver: No fees for developments under 80% Area Median Income',
      'Phased implementation: 50% of fee in Year 1, full fee in Year 2',
      'Local builder support: Fee deferral options and in-lieu improvement credits'
    ]
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
    description: 'Federal program providing childcare vouchers and expanding Head Start programs nationwide.',
    summary: 'This federal bill establishes universal childcare support for American families. Key provisions: (1) Childcare vouchers up to $400/month per child for families earning under 200% Federal Poverty Level, (2) Sliding scale assistance for families earning 200-400% FPL, (3) Expansion of Head Start programs to serve 500,000 additional children, (4) Quality standards requiring bachelor\'s degrees for lead teachers, (5) $75 billion annual funding through corporate tax adjustments. The bill includes provisions for rural childcare access and support for family childcare providers.',
    keyProvisions: [
      'Childcare vouchers: Up to $400/month per child for families under 200% FPL',
      'Sliding scale support: Reduced assistance for families earning 200-400% FPL',
      'Head Start expansion: 500,000 additional slots in early childhood programs',
      'Quality requirements: Bachelor\'s degree requirement for lead childcare teachers',
      'Rural access: Special funding for childcare deserts in rural communities'
    ]
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
    description: 'Invests $50 billion in climate resilience infrastructure including flood protection and wildfire prevention.',
    summary: 'This federal bill invests in climate adaptation and resilience infrastructure nationwide. Key provisions: (1) $50 billion over 5 years for climate resilience projects, (2) Flood protection systems for 100 high-risk communities, (3) Wildfire prevention through forest management and defensible space programs, (4) Drought-resistant water infrastructure and storage systems, (5) Climate-resilient transportation and energy grid upgrades. The bill prioritizes disadvantaged communities and includes job training programs for green infrastructure workers.',
    keyProvisions: [
      'Total investment: $50 billion over 5 years for climate resilience infrastructure',
      'Flood protection: Levees, seawalls, and drainage systems for 100 at-risk communities',
      'Wildfire prevention: Forest thinning, controlled burns, and defensible space programs',
      'Water infrastructure: Drought-resistant systems and emergency water storage',
      'Priority communities: 40% of funding reserved for disadvantaged areas'
    ]
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

  // Apply smart filtering to live legislation data
  const filteredAndSortedLegislation = liveLegislation
    .map(item => {
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
    })
    .sort((a, b) => {
      // Sort by relevance score (highest first), then by financial effect if benefits
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      if (a.isBenefit && b.isBenefit) {
        return (b.financialEffect || 0) - (a.financialEffect || 0);
      }
      return 0;
    });

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
    console.log('No authenticated user - showing login');
    return <AuthWrapper />;
  }

  if (!userProfile || showProfileForm) {
    console.log('User authenticated but no profile or showing profile form:', { 
      hasUserProfile: !!userProfile, 
      showProfileForm,
      userEmail: user?.email 
    });
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <UserProfileForm onComplete={() => {
          console.log('Profile form completed');
          setShowProfileForm(false);
        }} />
      </div>
    );
  }

  console.log('Rendering main app for user:', user?.email);

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
