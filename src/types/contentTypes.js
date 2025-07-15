// Unified content types for all government-related content
export const ContentTypes = {
  FEDERAL_BILL: 'federal_bill',
  STATE_BILL: 'state_bill',
  LOCAL_ORDINANCE: 'local_ordinance',
  BALLOT_MEASURE: 'ballot_measure',
  CITY_PROJECT: 'city_project',
  BUDGET_ITEM: 'budget_item',
  TAX_MEASURE: 'tax_measure',
  ELECTION: 'election',
  CANDIDATE: 'candidate',
  PUBLIC_MEETING: 'public_meeting',
  INFRASTRUCTURE: 'infrastructure',
  SPECIAL_DISTRICT: 'special_district'
};

// Content structure that works for all types
export const UnifiedContentStructure = {
  // Core fields
  id: null,
  type: null, // One of ContentTypes
  title: null,
  description: null,
  status: null,
  scope: null, // Federal, State, Local, County, City
  category: null, // Housing, Healthcare, Transportation, etc.
  
  // Location data
  location: {
    city: null,
    county: null,
    state: null,
    stateCode: null,
    district: null,
    zipCode: null
  },
  
  // Dates
  dateIntroduced: null,
  dateUpdated: null,
  effectiveDate: null,
  electionDate: null,
  
  // People/Organizations
  sponsor: null,
  supporters: [],
  opponents: [],
  
  // Content details
  summary: null,
  fullText: null,
  keyProvisions: [],
  votingOptions: [], // For ballot measures
  
  // Financial data
  estimatedCost: null,
  fundingSource: null,
  taxImpact: null,
  
  // Relevance scoring
  relevanceScore: 0,
  relevantDemographics: [],
  relevantInterests: [],
  incomeRelevance: [],
  locationRelevance: [],
  priorityMatch: [],
  
  // Personal impact (from AI analysis)
  personalImpact: null,
  financialEffect: null,
  timeline: null,
  confidence: null,
  isBenefit: null,
  
  // Sources
  sourceUrl: null,
  sourceApi: null,
  lastUpdated: null
};

// Categories that apply across all content types
export const ContentCategories = {
  HOUSING: 'Housing',
  HEALTHCARE: 'Healthcare',
  TRANSPORTATION: 'Transportation',
  EDUCATION: 'Education',
  ECONOMIC: 'Economic',
  ENVIRONMENT: 'Environment',
  PUBLIC_SAFETY: 'Public Safety',
  VETERANS_AFFAIRS: 'Veterans Affairs',
  SOCIAL_ISSUES: 'Social Issues',
  INFRASTRUCTURE: 'Infrastructure',
  TAX_POLICY: 'Tax Policy',
  OTHER: 'Other'
};

// Status types that apply across content
export const ContentStatus = {
  // Legislative statuses
  INTRODUCED: 'Introduced',
  IN_COMMITTEE: 'In Committee',
  PASSED_HOUSE: 'Passed House',
  PASSED_SENATE: 'Passed Senate',
  SIGNED: 'Signed',
  VETOED: 'Vetoed',
  
  // Ballot/Election statuses
  ON_BALLOT: 'On Ballot',
  PASSED: 'Passed',
  FAILED: 'Failed',
  
  // Project statuses
  PROPOSED: 'Proposed',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  
  // General
  ACTIVE: 'Active',
  PENDING: 'Pending',
  ARCHIVED: 'Archived'
};

// Scope levels
export const ContentScope = {
  FEDERAL: 'Federal',
  STATE: 'State',
  COUNTY: 'County',
  CITY: 'City',
  LOCAL: 'Local',
  SPECIAL_DISTRICT: 'Special District'
};