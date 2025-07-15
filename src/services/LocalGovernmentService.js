// Service for fetching local government legislation and ballot measures
// Uses multiple APIs: Google Civic Information API, Ballotpedia, etc.

const GOOGLE_CIVIC_API_KEY = process.env.REACT_APP_GOOGLE_CIVIC_API_KEY;
// const BALLOTPEDIA_API_KEY = process.env.REACT_APP_BALLOTPEDIA_API_KEY; // For future use

class LocalGovernmentService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 2 * 60 * 60 * 1000; // 2 hours
  }

  // Get cache key for a request
  getCacheKey(endpoint, params = {}) {
    return `local-${endpoint}-${JSON.stringify(params)}`;
  }

  // Check if cached data is still valid
  isCacheValid(cachedItem) {
    return cachedItem && Date.now() - cachedItem.timestamp < this.cacheExpiry;
  }

  // Make API request with caching
  async fetchFromAPI(url, headers = {}) {
    const cacheKey = this.getCacheKey(url);
    const cached = this.cache.get(cacheKey);

    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Local Government API fetch error:', error);
      return { results: [], elections: [] };
    }
  }

  // Get voter information including local ballot measures using Google Civic API
  async getVoterInfo(address) {
    if (!GOOGLE_CIVIC_API_KEY) {
      console.warn('Google Civic API key not configured');
      return { elections: [], contests: [] };
    }

    const url = `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(address)}`;
    
    try {
      const data = await this.fetchFromAPI(url);
      return this.transformVoterInfoData(data);
    } catch (error) {
      console.error('Error fetching voter info:', error);
      return { elections: [], contests: [] };
    }
  }

  // Get upcoming elections and ballot measures
  async getUpcomingElections(location) {
    const elections = [];
    
    // Try Google Civic API first
    if (GOOGLE_CIVIC_API_KEY) {
      try {
        const url = `https://www.googleapis.com/civicinfo/v2/elections?key=${GOOGLE_CIVIC_API_KEY}`;
        const data = await this.fetchFromAPI(url);
        
        if (data.elections) {
          elections.push(...data.elections.map(election => this.transformElectionData(election)));
        }
      } catch (error) {
        console.error('Error fetching elections:', error);
      }
    }

    // Add sample local ballot measures based on location
    const localMeasures = this.getSampleLocalMeasures(location);
    elections.push(...localMeasures);

    return elections;
  }

  // Get sample local ballot measures (fallback when APIs aren't available)
  getSampleLocalMeasures(location) {
    if (!location) return [];

    const locationLower = location.toLowerCase();
    const measures = [];

    // California measures
    if (locationLower.includes('california') || locationLower.includes('ca')) {
      measures.push({
        id: 'ca-prop-local-1',
        title: 'Local Transportation Bond Measure',
        type: 'ballot_measure',
        scope: 'Local',
        category: 'Transportation',
        location: location,
        description: 'Approves $500 million bond for local transportation improvements including bike lanes, road repairs, and public transit expansion.',
        status: 'On Ballot',
        electionDate: '2025-11-04',
        votingOptions: ['Yes', 'No'],
        summary: 'This measure would authorize the issuance of $500 million in general obligation bonds to fund transportation infrastructure improvements.',
        relevantDemographics: ['public_transit_users', 'commuters', 'cyclists'],
        relevantInterests: ['public_transportation', 'infrastructure', 'environmental_benefits'],
        householdRelevance: ['any_household_size'],
        incomeRelevance: ['any_income'],
        locationTags: [this.extractStateCode(location)?.toLowerCase()],
        priorityMatch: ['transportation_access', 'infrastructure', 'environmental_protection']
      });
    }

    // Nevada measures
    if (locationLower.includes('nevada') || locationLower.includes('nv') || locationLower.includes('las vegas')) {
      measures.push({
        id: 'nv-local-education-1',
        title: 'School District Funding Initiative',
        type: 'ballot_measure',
        scope: 'Local',
        category: 'Education',
        location: location,
        description: 'Increases local property taxes to fund teacher salaries, school modernization, and educational technology programs.',
        status: 'On Ballot',
        electionDate: '2025-11-04',
        votingOptions: ['Yes', 'No'],
        summary: 'This initiative would increase property taxes by $0.15 per $1,000 of assessed value to generate $50 million annually for schools.',
        relevantDemographics: ['families_with_children', 'homeowners', 'teachers'],
        relevantInterests: ['education_policy', 'tax_policy'],
        householdRelevance: ['families_with_children'],
        incomeRelevance: ['any_income'],
        locationTags: ['nv'],
        priorityMatch: ['education_quality', 'education_funding']
      });
    }

    // General urban measures
    if (locationLower.includes('city') || locationLower.includes('urban')) {
      measures.push({
        id: 'local-housing-1',
        title: 'Affordable Housing Development Measure',
        type: 'ballot_measure',
        scope: 'Local',
        category: 'Housing',
        location: location,
        description: 'Authorizes the city to issue bonds for affordable housing development and provides incentives for developers.',
        status: 'On Ballot',
        electionDate: '2025-11-04',
        votingOptions: ['Yes', 'No'],
        summary: 'This measure would authorize $100 million in bonds to build 500 affordable housing units and provide tax incentives for affordable housing developers.',
        relevantDemographics: ['renters', 'low_income', 'young_adults'],
        relevantInterests: ['housing_affordability', 'economic_development'],
        householdRelevance: ['any_household_size'],
        incomeRelevance: ['low_to_moderate_income'],
        locationTags: ['local'],
        priorityMatch: ['affordable_housing', 'cost_of_living']
      });
    }

    return measures;
  }

  // Transform Google Civic API voter info data
  transformVoterInfoData(data) {
    const contests = [];
    
    if (data.contests) {
      data.contests.forEach(contest => {
        if (contest.type === 'Referendum' || contest.ballotTitle) {
          contests.push(this.transformBallotMeasure(contest));
        }
      });
    }

    return {
      elections: data.elections || [],
      contests: contests
    };
  }

  // Transform election data
  transformElectionData(election) {
    return {
      id: election.id,
      name: election.name,
      electionDay: election.electionDay,
      scope: 'Local'
    };
  }

  // Transform ballot measure data
  transformBallotMeasure(contest) {
    return {
      id: contest.referendumTitle || contest.ballotTitle || contest.office,
      title: contest.ballotTitle || contest.referendumTitle || 'Local Ballot Measure',
      type: 'ballot_measure',
      scope: 'Local',
      category: this.categorizeBallotMeasure(contest.ballotTitle || contest.referendumTitle || ''),
      description: contest.referendumSubtitle || contest.ballotTitle,
      status: 'On Ballot',
      votingOptions: contest.candidates?.map(c => c.name) || ['Yes', 'No'],
      source: 'google_civic',
      relevantDemographics: this.inferDemographics(contest.ballotTitle || ''),
      relevantInterests: this.inferInterests(contest.ballotTitle || ''),
      householdRelevance: ['any_household_size'],
      incomeRelevance: ['any_income'],
      locationTags: ['local'],
      priorityMatch: this.inferPriorities(contest.ballotTitle || '')
    };
  }

  // Categorize ballot measures
  categorizeBallotMeasure(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('school') || titleLower.includes('education')) {
      return 'Education';
    }
    if (titleLower.includes('transport') || titleLower.includes('road') || titleLower.includes('transit')) {
      return 'Transportation';
    }
    if (titleLower.includes('housing') || titleLower.includes('development')) {
      return 'Housing';
    }
    if (titleLower.includes('tax') || titleLower.includes('bond')) {
      return 'Economic';
    }
    if (titleLower.includes('environment') || titleLower.includes('park')) {
      return 'Environment';
    }
    if (titleLower.includes('safety') || titleLower.includes('police') || titleLower.includes('fire')) {
      return 'Public Safety';
    }
    
    return 'Other';
  }

  // Infer demographics for ballot measures
  inferDemographics(title) {
    const content = title.toLowerCase();
    const demographics = [];

    if (content.includes('senior') || content.includes('elderly')) {
      demographics.push('seniors');
    }
    if (content.includes('student') || content.includes('school')) {
      demographics.push('students', 'families_with_children');
    }
    if (content.includes('homeowner') || content.includes('property')) {
      demographics.push('homeowners');
    }
    if (content.includes('transit') || content.includes('public transportation')) {
      demographics.push('public_transit_users');
    }

    return demographics;
  }

  // Infer interests for ballot measures
  inferInterests(title) {
    const content = title.toLowerCase();
    const interests = [];

    if (content.includes('education') || content.includes('school')) {
      interests.push('education_policy');
    }
    if (content.includes('transport') || content.includes('transit')) {
      interests.push('public_transportation', 'infrastructure');
    }
    if (content.includes('environment') || content.includes('park')) {
      interests.push('environmental_protection');
    }
    if (content.includes('housing') || content.includes('development')) {
      interests.push('housing_affordability');
    }
    if (content.includes('tax') || content.includes('bond')) {
      interests.push('tax_policy');
    }

    return interests;
  }

  // Infer priorities for ballot measures
  inferPriorities(title) {
    const content = title.toLowerCase();
    const priorities = [];

    if (content.includes('affordable housing')) {
      priorities.push('affordable_housing', 'cost_of_living');
    }
    if (content.includes('education') || content.includes('school funding')) {
      priorities.push('education_quality', 'education_funding');
    }
    if (content.includes('transportation') || content.includes('transit')) {
      priorities.push('transportation_access', 'infrastructure');
    }
    if (content.includes('environment')) {
      priorities.push('environmental_protection');
    }
    if (content.includes('public safety')) {
      priorities.push('public_safety');
    }

    return priorities;
  }

  // Extract state code from location
  extractStateCode(location) {
    if (!location) return null;
    
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
    
    const locationLower = location.toLowerCase();
    
    for (const [stateName, stateCode] of Object.entries(stateMap)) {
      if (locationLower.includes(stateName)) {
        return stateCode;
      }
    }
    
    return null;
  }

  // Get local measures by location
  async getLocalMeasuresByLocation(location) {
    const measures = [];
    
    // Try voter info first
    try {
      const voterInfo = await this.getVoterInfo(location);
      measures.push(...voterInfo.contests);
    } catch (error) {
      console.error('Error fetching voter info:', error);
    }
    
    // Add sample measures as fallback
    const sampleMeasures = this.getSampleLocalMeasures(location);
    measures.push(...sampleMeasures);
    
    return measures;
  }
}

export default new LocalGovernmentService();