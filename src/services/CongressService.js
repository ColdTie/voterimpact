// Service for fetching real legislation data from Congress.gov API
// Documentation: https://api.congress.gov/

const CONGRESS_API_KEY = process.env.REACT_APP_CONGRESS_API_KEY || 'DEMO_KEY';
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

class CongressService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  // Get cache key for a request
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}-${JSON.stringify(params)}`;
  }

  // Check if cached data is still valid
  isCacheValid(cachedItem) {
    return cachedItem && Date.now() - cachedItem.timestamp < this.cacheExpiry;
  }

  // Make API request with caching
  async fetchFromAPI(endpoint, params = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);

    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    const queryParams = new URLSearchParams({
      api_key: CONGRESS_API_KEY,
      format: 'json',
      ...params
    });

    try {
      const response = await fetch(`${CONGRESS_API_BASE}${endpoint}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Congress API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Congress API fetch error:', error);
      throw error;
    }
  }

  // Get recent bills with personalization based on user interests
  async getRecentBills(options = {}) {
    const {
      congress = 118, // Current congress
      chamber = null, // 'house' or 'senate'
      limit = 20,
      offset = 0,
      sort = 'updateDate desc'
    } = options;

    const endpoint = `/bill/${congress}`;
    const params = {
      limit,
      offset,
      sort
    };

    if (chamber) {
      params.chamber = chamber;
    }

    const response = await this.fetchFromAPI(endpoint, params);
    return this.transformBillsData(response.bills || []);
  }

  // Get specific bill details
  async getBillDetails(congress, billType, billNumber) {
    const endpoint = `/bill/${congress}/${billType}/${billNumber}`;
    const response = await this.fetchFromAPI(endpoint);
    return this.transformBillData(response.bill);
  }

  // Get bill actions (legislative history)
  async getBillActions(congress, billType, billNumber) {
    const endpoint = `/bill/${congress}/${billType}/${billNumber}/actions`;
    const response = await this.fetchFromAPI(endpoint);
    return response.actions || [];
  }

  // Get bill cosponsors
  async getBillCosponsors(congress, billType, billNumber) {
    const endpoint = `/bill/${congress}/${billType}/${billNumber}/cosponsors`;
    const response = await this.fetchFromAPI(endpoint);
    return response.cosponsors || [];
  }

  // Get bill text
  async getBillText(congress, billType, billNumber) {
    const endpoint = `/bill/${congress}/${billType}/${billNumber}/text`;
    const response = await this.fetchFromAPI(endpoint);
    return response.textVersions || [];
  }

  // Search bills by keyword
  async searchBills(query, options = {}) {
    const {
      congress = 118,
      limit = 20,
      offset = 0
    } = options;

    // Note: Congress.gov API doesn't have direct search endpoint
    // We'll need to filter from recent bills or use alternative approach
    const bills = await this.getRecentBills({ congress, limit: 100 });
    
    const searchTerms = query.toLowerCase().split(' ');
    return bills.filter(bill => {
      const searchableText = `${bill.title} ${bill.summary}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    }).slice(offset, offset + limit);
  }

  // Transform API data to match our app's format
  transformBillData(apiBill) {
    if (!apiBill) return null;

    const title = apiBill.title || 'Untitled Bill';
    const summary = apiBill.summaries?.[0]?.text || apiBill.summary?.text || '';
    const subjects = apiBill.subjects || [];

    return {
      id: `${apiBill.congress}-${apiBill.type}-${apiBill.number}`,
      title: title,
      status: this.mapBillStatus(apiBill.latestAction),
      category: this.mapBillCategory(apiBill.policyArea?.name || subjects?.[0]?.name),
      scope: 'Federal',
      description: summary || title,
      summary: summary,
      billNumber: `${apiBill.type}.${apiBill.number}`,
      congress: apiBill.congress,
      chamber: apiBill.originChamber?.toLowerCase() || 'house',
      sponsor: {
        name: apiBill.sponsors?.[0]?.fullName,
        party: apiBill.sponsors?.[0]?.party,
        state: apiBill.sponsors?.[0]?.state
      },
      introducedDate: apiBill.introducedDate,
      lastAction: apiBill.latestAction?.text,
      lastActionDate: apiBill.latestAction?.actionDate,
      url: apiBill.url,
      // Add smart filtering tags for federal bills
      relevantDemographics: this.inferDemographics(title, summary, subjects),
      relevantInterests: this.inferInterests(title, summary, subjects),
      householdRelevance: this.inferHouseholdRelevance(title, summary),
      incomeRelevance: this.inferIncomeRelevance(title, summary),
      locationTags: ['federal'],
      priorityMatch: this.inferPriorities(title, summary, subjects),
      // These would need to be calculated or fetched separately
      personalImpact: null,
      financialEffect: null,
      timeline: null,
      confidence: null,
      isBenefit: null
    };
  }

  transformBillsData(apiBills) {
    return apiBills.map(bill => this.transformBillData(bill));
  }

  // Infer demographic relevance from bill content
  inferDemographics(title, summary, subjects) {
    const content = `${title} ${summary}`.toLowerCase();
    const demographics = [];

    if (content.includes('veteran') || content.includes('military') || content.includes('armed forces')) {
      demographics.push('veterans', 'military_families');
    }
    if (content.includes('senior') || content.includes('elderly') || content.includes('medicare')) {
      demographics.push('seniors');
    }
    if (content.includes('student') || content.includes('education') || content.includes('college')) {
      demographics.push('students', 'families_with_children');
    }
    if (content.includes('low income') || content.includes('poverty') || content.includes('snap') || content.includes('medicaid')) {
      demographics.push('low_income');
    }
    if (content.includes('small business') || content.includes('entrepreneur') || content.includes('startup')) {
      demographics.push('small_business_owners');
    }
    if (content.includes('worker') || content.includes('employee') || content.includes('labor') || content.includes('unemployment')) {
      demographics.push('workers');
    }
    if (content.includes('homeowner') || content.includes('mortgage') || content.includes('property tax')) {
      demographics.push('homeowners');
    }
    if (content.includes('renter') || content.includes('tenant') || content.includes('rental')) {
      demographics.push('renters');
    }
    if (content.includes('unemployed') || content.includes('unemployment insurance')) {
      demographics.push('unemployed');
    }
    if (content.includes('family') || content.includes('child') || content.includes('parent')) {
      demographics.push('families_with_children');
    }

    return demographics;
  }

  // Infer interest relevance from bill content
  inferInterests(title, summary, subjects) {
    const content = `${title} ${summary}`.toLowerCase();
    const interests = [];

    if (content.includes('healthcare') || content.includes('health insurance') || content.includes('medical') || content.includes('medicare') || content.includes('medicaid')) {
      interests.push('healthcare_access', 'affordable_healthcare');
    }
    if (content.includes('housing') || content.includes('rent') || content.includes('mortgage') || content.includes('affordable housing')) {
      interests.push('housing_affordability', 'housing_policy');
    }
    if (content.includes('environment') || content.includes('climate') || content.includes('pollution') || content.includes('clean energy')) {
      interests.push('environmental_protection', 'climate_action');
    }
    if (content.includes('tax') || content.includes('taxation') || content.includes('irs')) {
      interests.push('tax_policy');
    }
    if (content.includes('transport') || content.includes('transit') || content.includes('highway') || content.includes('infrastructure')) {
      interests.push('public_transportation', 'infrastructure');
    }
    if (content.includes('education') || content.includes('school') || content.includes('college') || content.includes('student loan')) {
      interests.push('education_policy');
    }
    if (content.includes('gun') || content.includes('firearm') || content.includes('safety') || content.includes('crime')) {
      interests.push('public_safety');
    }
    if (content.includes('economic') || content.includes('business') || content.includes('employment') || content.includes('jobs')) {
      interests.push('economic_development');
    }
    if (content.includes('veteran') || content.includes('military') || content.includes('va ')) {
      interests.push('veterans_affairs', 'military_benefits');
    }
    if (content.includes('trade') || content.includes('import') || content.includes('export')) {
      interests.push('trade_policy');
    }

    return interests;
  }

  // Infer household relevance from bill content
  inferHouseholdRelevance(title, summary) {
    const content = `${title} ${summary}`.toLowerCase();
    const relevance = [];

    if (content.includes('family') || content.includes('child') || content.includes('parent') || content.includes('dependent')) {
      relevance.push('families_with_children');
    }
    if (content.includes('single') || content.includes('individual')) {
      relevance.push('single_person_households');
    }
    if (content.includes('senior') || content.includes('elderly') || content.includes('medicare')) {
      relevance.push('senior_households');
    }
    if (content.includes('military family') || content.includes('veteran family')) {
      relevance.push('military_households');
    }

    return relevance.length > 0 ? relevance : ['any_household_size'];
  }

  // Infer income relevance from bill content
  inferIncomeRelevance(title, summary) {
    const content = `${title} ${summary}`.toLowerCase();

    if (content.includes('low income') || content.includes('poverty') || content.includes('assistance') || content.includes('snap') || content.includes('medicaid')) {
      return ['low_income'];
    }
    if (content.includes('middle class') || content.includes('working families') || content.includes('median income')) {
      return ['middle_income'];
    }
    if (content.includes('high earner') || content.includes('wealthy') || content.includes('estate tax')) {
      return ['high_income'];
    }
    if (content.includes('small business') || content.includes('entrepreneur')) {
      return ['middle_income', 'small_business'];
    }

    return ['any_income'];
  }

  // Infer priority matching from bill content
  inferPriorities(title, summary, subjects) {
    const content = `${title} ${summary}`.toLowerCase();
    const priorities = [];

    if (content.includes('affordable housing') || content.includes('rent control') || content.includes('housing credit')) {
      priorities.push('affordable_housing', 'cost_of_living');
    }
    if (content.includes('healthcare cost') || content.includes('medical expense') || content.includes('prescription drug')) {
      priorities.push('healthcare_access', 'healthcare_costs');
    }
    if (content.includes('job') || content.includes('employment') || content.includes('wage') || content.includes('minimum wage')) {
      priorities.push('job_security', 'fair_wages');
    }
    if (content.includes('education funding') || content.includes('school budget') || content.includes('student loan')) {
      priorities.push('education_quality', 'education_funding');
    }
    if (content.includes('environment') || content.includes('clean') || content.includes('climate change')) {
      priorities.push('environmental_protection');
    }
    if (content.includes('public safety') || content.includes('crime') || content.includes('law enforcement')) {
      priorities.push('public_safety');
    }
    if (content.includes('transport') || content.includes('road') || content.includes('infrastructure') || content.includes('bridge')) {
      priorities.push('transportation_access', 'infrastructure');
    }
    if (content.includes('tax relief') || content.includes('tax cut') || content.includes('tax credit')) {
      priorities.push('tax_relief', 'financial_stability');
    }
    if (content.includes('veteran') || content.includes('military benefit')) {
      priorities.push('veterans_benefits', 'military_support');
    }
    if (content.includes('retirement') || content.includes('social security') || content.includes('pension')) {
      priorities.push('retirement_security', 'financial_planning');
    }

    return priorities;
  }

  // Map Congress.gov status to our simplified status
  mapBillStatus(latestAction) {
    if (!latestAction) return 'Proposed';
    
    const actionText = latestAction.text?.toLowerCase() || '';
    
    if (actionText.includes('became law') || actionText.includes('signed by president')) {
      return 'Passed';
    } else if (actionText.includes('passed house') || actionText.includes('passed senate')) {
      return 'In Committee';
    } else if (actionText.includes('introduced') || actionText.includes('referred to')) {
      return 'Proposed';
    }
    
    return 'In Committee';
  }

  // Map policy areas to our categories
  mapBillCategory(policyArea) {
    const categoryMap = {
      'health': 'Healthcare',
      'housing and community development': 'Housing',
      'economics and public finance': 'Economic',
      'taxation': 'Economic',
      'armed forces and national security': 'Veterans Affairs',
      'environmental protection': 'Environment',
      'transportation and public works': 'Transportation',
      'social welfare': 'Social Issues',
      'education': 'Education',
      'crime and law enforcement': 'Public Safety'
    };

    const normalized = policyArea?.toLowerCase() || '';
    
    for (const [key, value] of Object.entries(categoryMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    
    return 'Other';
  }

  // Get bills by user location (state)
  async getBillsByState(state, options = {}) {
    // First get federal bills
    const federalBills = await this.getRecentBills(options);
    
    // Filter bills sponsored by representatives from the user's state
    const stateBills = federalBills.filter(bill => 
      bill.sponsor?.state === state
    );

    return {
      federal: federalBills.slice(0, 10),
      state: stateBills
    };
  }

  // Get upcoming votes
  async getUpcomingVotes(chamber = 'both') {
    // Note: Congress.gov API doesn't directly provide voting schedules
    // This would need to be supplemented with House/Senate schedule APIs
    const nominations = await this.fetchFromAPI('/nomination/118', { limit: 10 });
    
    return {
      votes: [],
      nominations: nominations.nominations || []
    };
  }
}

export default new CongressService();