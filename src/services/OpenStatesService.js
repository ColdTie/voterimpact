// Service for fetching state and local legislation from OpenStates API
// Documentation: https://docs.openstates.org/

const OPENSTATES_API_KEY = process.env.REACT_APP_OPENSTATES_API_KEY;
const OPENSTATES_API_BASE = 'https://v3.openstates.org';

class OpenStatesService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
  }

  // Get cache key for a request
  getCacheKey(endpoint, params = {}) {
    return `openstates-${endpoint}-${JSON.stringify(params)}`;
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

    if (!OPENSTATES_API_KEY) {
      console.warn('OpenStates API key not configured, returning empty data');
      return { results: [] };
    }

    const queryParams = new URLSearchParams(params);

    try {
      const response = await fetch(`${OPENSTATES_API_BASE}${endpoint}?${queryParams}`, {
        headers: {
          'X-API-KEY': OPENSTATES_API_KEY,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`OpenStates API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('OpenStates API fetch error:', error);
      return { results: [] };
    }
  }

  // Get recent bills for a specific state
  async getStateBills(state, options = {}) {
    const {
      limit = 20,
      page = 1,
      sort = '-updated_at'
    } = options;

    const endpoint = '/bills';
    const params = {
      jurisdiction: state.toLowerCase(),
      per_page: limit,
      page,
      sort,
      include: 'sponsorships,abstracts,other_titles'
    };

    const response = await this.fetchFromAPI(endpoint, params);
    return this.transformBillsData(response.results || [], state);
  }

  // Search bills by keyword in a specific state
  async searchStateBills(state, query, options = {}) {
    const {
      limit = 20,
      page = 1
    } = options;

    const endpoint = '/bills';
    const params = {
      jurisdiction: state.toLowerCase(),
      q: query,
      per_page: limit,
      page,
      include: 'sponsorships,abstracts,other_titles'
    };

    const response = await this.fetchFromAPI(endpoint, params);
    return this.transformBillsData(response.results || [], state);
  }

  // Get bill details
  async getBillDetails(billId) {
    const endpoint = `/bills/${billId}`;
    const response = await this.fetchFromAPI(endpoint, {
      include: 'sponsorships,abstracts,other_titles,actions,votes'
    });
    
    return this.transformBillData(response);
  }

  // Get bills by category/subject for a state
  async getBillsBySubject(state, subject, options = {}) {
    const {
      limit = 20,
      page = 1
    } = options;

    const endpoint = '/bills';
    const params = {
      jurisdiction: state.toLowerCase(),
      subject: subject,
      per_page: limit,
      page,
      include: 'sponsorships,abstracts'
    };

    const response = await this.fetchFromAPI(endpoint, params);
    return this.transformBillsData(response.results || [], state);
  }

  // Transform OpenStates API data to match our app's format
  transformBillData(apiBill) {
    if (!apiBill) return null;

    const abstract = apiBill.abstracts?.[0]?.abstract || apiBill.abstracts?.[0]?.note || '';
    const sponsor = apiBill.sponsorships?.[0];

    return {
      id: apiBill.id,
      title: apiBill.title || 'Untitled Bill',
      status: this.mapBillStatus(apiBill.latest_action),
      category: this.mapBillCategory(apiBill.subject?.[0]),
      scope: 'State',
      location: this.getStateFullName(apiBill.jurisdiction),
      description: abstract || apiBill.title,
      summary: abstract,
      billNumber: apiBill.identifier,
      sponsor: sponsor ? {
        name: sponsor.name,
        party: sponsor.party,
        classification: sponsor.classification
      } : null,
      introducedDate: apiBill.first_action_date,
      lastAction: apiBill.latest_action?.description,
      lastActionDate: apiBill.latest_action?.date,
      url: apiBill.openstates_url,
      source: 'openstates',
      // These would need to be calculated separately
      personalImpact: null,
      financialEffect: null,
      timeline: null,
      confidence: null,
      isBenefit: null
    };
  }

  transformBillsData(apiBills, state) {
    return apiBills.map(bill => this.transformBillData(bill));
  }

  // Map OpenStates status to our simplified status
  mapBillStatus(latestAction) {
    if (!latestAction) return 'Proposed';
    
    const actionText = latestAction.description?.toLowerCase() || '';
    
    if (actionText.includes('signed') || actionText.includes('enacted') || actionText.includes('became law')) {
      return 'Passed';
    } else if (actionText.includes('passed') || actionText.includes('third reading')) {
      return 'In Committee';
    } else if (actionText.includes('introduced') || actionText.includes('first reading')) {
      return 'Proposed';
    }
    
    return 'In Committee';
  }

  // Map subjects to our categories
  mapBillCategory(subject) {
    if (!subject) return 'Other';
    
    const subjectLower = subject.toLowerCase();
    
    const categoryMap = {
      'health': 'Healthcare',
      'housing': 'Housing',
      'education': 'Education',
      'environment': 'Environment',
      'transportation': 'Transportation',
      'taxation': 'Economic',
      'budget': 'Economic',
      'finance': 'Economic',
      'veterans': 'Veterans Affairs',
      'military': 'Veterans Affairs',
      'social services': 'Social Issues',
      'welfare': 'Social Issues',
      'crime': 'Public Safety',
      'law enforcement': 'Public Safety',
      'civil rights': 'Social Issues',
      'immigration': 'Social Issues'
    };

    for (const [key, value] of Object.entries(categoryMap)) {
      if (subjectLower.includes(key)) {
        return value;
      }
    }
    
    return 'Other';
  }

  // Get full state name from jurisdiction
  getStateFullName(jurisdiction) {
    const stateNames = {
      'al': 'Alabama', 'ak': 'Alaska', 'az': 'Arizona', 'ar': 'Arkansas', 'ca': 'California',
      'co': 'Colorado', 'ct': 'Connecticut', 'de': 'Delaware', 'fl': 'Florida', 'ga': 'Georgia',
      'hi': 'Hawaii', 'id': 'Idaho', 'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa',
      'ks': 'Kansas', 'ky': 'Kentucky', 'la': 'Louisiana', 'me': 'Maine', 'md': 'Maryland',
      'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota', 'ms': 'Mississippi', 'mo': 'Missouri',
      'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada', 'nh': 'New Hampshire', 'nj': 'New Jersey',
      'nm': 'New Mexico', 'ny': 'New York', 'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio',
      'ok': 'Oklahoma', 'or': 'Oregon', 'pa': 'Pennsylvania', 'ri': 'Rhode Island', 'sc': 'South Carolina',
      'sd': 'South Dakota', 'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah', 'vt': 'Vermont',
      'va': 'Virginia', 'wa': 'Washington', 'wv': 'West Virginia', 'wi': 'Wisconsin', 'wy': 'Wyoming'
    };
    
    return stateNames[jurisdiction?.toLowerCase()] || jurisdiction;
  }

  // Extract state code from location string
  extractStateFromLocation(location) {
    if (!location) return null;
    
    const locationLower = location.toLowerCase();
    
    // State name to abbreviation mapping
    const stateMap = {
      'alabama': 'al', 'alaska': 'ak', 'arizona': 'az', 'arkansas': 'ar', 'california': 'ca',
      'colorado': 'co', 'connecticut': 'ct', 'delaware': 'de', 'florida': 'fl', 'georgia': 'ga',
      'hawaii': 'hi', 'idaho': 'id', 'illinois': 'il', 'indiana': 'in', 'iowa': 'ia',
      'kansas': 'ks', 'kentucky': 'ky', 'louisiana': 'la', 'maine': 'me', 'maryland': 'md',
      'massachusetts': 'ma', 'michigan': 'mi', 'minnesota': 'mn', 'mississippi': 'ms', 'missouri': 'mo',
      'montana': 'mt', 'nebraska': 'ne', 'nevada': 'nv', 'new hampshire': 'nh', 'new jersey': 'nj',
      'new mexico': 'nm', 'new york': 'ny', 'north carolina': 'nc', 'north dakota': 'nd', 'ohio': 'oh',
      'oklahoma': 'ok', 'oregon': 'or', 'pennsylvania': 'pa', 'rhode island': 'ri', 'south carolina': 'sc',
      'south dakota': 'sd', 'tennessee': 'tn', 'texas': 'tx', 'utah': 'ut', 'vermont': 'vt',
      'virginia': 'va', 'washington': 'wa', 'west virginia': 'wv', 'wisconsin': 'wi', 'wyoming': 'wy'
    };
    
    // First try to find full state names
    for (const [stateName, stateCode] of Object.entries(stateMap)) {
      if (locationLower.includes(stateName)) {
        return stateCode;
      }
    }
    
    // Then look for state abbreviations
    const stateAbbreviations = Object.values(stateMap);
    for (const abbrev of stateAbbreviations) {
      if (locationLower.includes(abbrev)) {
        return abbrev;
      }
    }
    
    return null;
  }

  // Get bills relevant to user's location
  async getBillsByLocation(location, options = {}) {
    const state = this.extractStateFromLocation(location);
    
    if (!state) {
      return [];
    }

    try {
      const bills = await this.getStateBills(state, options);
      return bills;
    } catch (error) {
      console.error('Error fetching bills by location:', error);
      return [];
    }
  }
}

export default new OpenStatesService();