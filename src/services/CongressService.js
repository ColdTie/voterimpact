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

    return {
      id: `${apiBill.congress}-${apiBill.type}-${apiBill.number}`,
      title: apiBill.title || 'Untitled Bill',
      status: this.mapBillStatus(apiBill.latestAction),
      category: this.mapBillCategory(apiBill.policyArea?.name || apiBill.subjects?.[0]?.name),
      scope: 'Federal',
      description: apiBill.summary?.text || apiBill.title,
      summary: apiBill.summaries?.[0]?.text || '',
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