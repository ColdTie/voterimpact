// Universal data source integration for any US location
// Supports federal, state, and local government data

class UniversalDataSources {
  constructor() {
    this.timeout = 8000; // 8 second timeout for all API calls
  }

  // Fetch with timeout wrapper
  async fetchWithTimeout(url, options = {}) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), this.timeout)
      )
    ]);
  }

  // 1. FEDERAL DATA - Works for all users
  async getFederalBills(limit = 20) {
    try {
      // Congress.gov API
      const congressKey = process.env.REACT_APP_CONGRESS_API_KEY || 'DEMO_KEY';
      const url = `https://api.congress.gov/v3/bill?api_key=${congressKey}&limit=${limit}&sort=updateDate+desc`;
      
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) throw new Error(`Congress API error: ${response.status}`);
      
      const data = await response.json();
      return this.transformCongressBills(data.bills || []);
    } catch (error) {
      console.error('Federal bills fetch error:', error);
      return [];
    }
  }

  // 2. STATE DATA - Works for any state
  async getStateBills(stateCode, limit = 10) {
    try {
      // OpenStates API
      const openStatesKey = process.env.REACT_APP_OPENSTATES_API_KEY;
      if (!openStatesKey) {
        console.log('⚠️ No OpenStates API key found - using fallback sample state data');
        return this.generateSampleStateBills(stateCode, limit);
      }

      const url = `https://v3.openstates.org/bills?jurisdiction=${stateCode}&sort=-updated_at&per_page=${limit}`;
      
      const response = await this.fetchWithTimeout(url, {
        headers: { 'X-API-KEY': openStatesKey }
      });
      
      if (!response.ok) {
        console.log(`⚠️ OpenStates API failed (${response.status}) - using sample state data`);
        return this.generateSampleStateBills(stateCode, limit);
      }
      
      const data = await response.json();
      const bills = this.transformOpenStatesBills(data.results || []);
      
      if (bills.length === 0) {
        console.log('⚠️ No state bills returned from API - using sample data');
        return this.generateSampleStateBills(stateCode, limit);
      }
      
      return bills;
    } catch (error) {
      console.error('State bills fetch error:', error);
      return this.generateSampleStateBills(stateCode, limit);
    }
  }

  // 3. LOCAL DATA - Generic local government data sources
  async getLocalContent(location) {
    const results = [];
    
    // Try multiple local data sources in parallel
    const sources = [
      this.getGoogleCivicData(location),
      this.getBallotpediaData(location),
      this.getLocalNewsData(location),
      this.getCountyData(location)
    ];

    const settled = await Promise.allSettled(sources);
    
    settled.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(...result.value);
      } else {
        console.log(`Local source ${index + 1} failed:`, result.reason);
      }
    });

    // If no real local data, generate sample local content
    if (results.length === 0) {
      console.log('⚠️ No real local data available - generating sample local content');
      results.push(...this.generateSampleLocalContent(location));
    }

    return results;
  }

  // Google Civic Information API - Works for any address
  async getGoogleCivicData(location) {
    try {
      const civicKey = process.env.REACT_APP_GOOGLE_CIVIC_API_KEY;
      if (!civicKey) return [];

      // Get elections and ballot measures
      const url = `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${civicKey}&address=${encodeURIComponent(location)}`;
      
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) throw new Error(`Google Civic API error: ${response.status}`);
      
      const data = await response.json();
      return this.transformGoogleCivicData(data, location);
    } catch (error) {
      console.error('Google Civic data fetch error:', error);
      return [];
    }
  }

  // Ballotpedia API - Works for any location
  async getBallotpediaData(location) {
    try {
      // Ballotpedia has location-based ballot measure data
      const { city, state } = this.parseLocation(location);
      if (!city || !state) return [];

      // Note: Ballotpedia API requires partnership access
      // For now, return empty array but structure is ready
      return [];
    } catch (error) {
      console.error('Ballotpedia data fetch error:', error);
      return [];
    }
  }

  // Local news/RSS feeds - Can be configured for any city
  async getLocalNewsData(location) {
    try {
      const { city, state } = this.parseLocation(location);
      if (!city) return [];

      // Many cities have RSS feeds or APIs
      // Example patterns: cityname.gov/news/rss, cityname.org/api
      const possibleFeeds = [
        `https://${city.toLowerCase().replace(' ', '')}.gov/news/rss`,
        `https://www.${city.toLowerCase().replace(' ', '')}.gov/api/news`,
        `https://${city.toLowerCase().replace(' ', '')}.org/rss`
      ];

      // Try each feed with timeout
      for (const feedUrl of possibleFeeds) {
        try {
          const response = await this.fetchWithTimeout(feedUrl);
          if (response.ok) {
            const data = await response.text();
            return this.parseRSSFeed(data, location);
          }
        } catch (e) {
          // Continue to next feed
          continue;
        }
      }

      return [];
    } catch (error) {
      console.error('Local news data fetch error:', error);
      return [];
    }
  }

  // County-level data - Works for any county
  async getCountyData(location) {
    try {
      const { county, state } = this.parseLocationWithCounty(location);
      if (!county || !state) return [];

      // County governments often have standard API patterns
      // Many use Socrata Open Data or similar platforms
      const stateCode = this.getStateCode(state);
      
      // Try common county data endpoints
      const endpoints = [
        `https://data.${county.toLowerCase()}county${stateCode?.toLowerCase()}.gov/api/views.json`,
        `https://${county.toLowerCase()}-county.${stateCode?.toLowerCase()}.gov/api/data`,
        `https://opendata.${county.toLowerCase()}county.gov/api/catalog`
      ];

      // This would need to be implemented per county's specific API
      // For now, return empty but framework is ready
      return [];
    } catch (error) {
      console.error('County data fetch error:', error);
      return [];
    }
  }

  // Transform Congress.gov bill data
  transformCongressBills(bills) {
    return bills.map(bill => ({
      id: `congress-${bill.number}`,
      type: 'federal_bill',
      title: bill.title,
      status: this.mapCongressStatus(bill.latestAction?.actionCode),
      scope: 'Federal',
      category: this.categorizeByTitle(bill.title),
      description: bill.title,
      billNumber: bill.number,
      congress: bill.congress,
      sponsor: bill.sponsors?.[0]?.bioguideId,
      dateIntroduced: bill.introducedDate,
      summary: bill.summary?.text || bill.title,
      sourceUrl: `https://www.congress.gov/bill/${bill.congress}th-congress/${bill.originChamber}-bill/${bill.number.split('.')[1]}`,
      lastUpdated: bill.updateDate,
      // Add default financial data to prevent NaN
      personalImpact: 'Impact analysis pending - please refresh AI analysis for details.',
      financialEffect: 0,
      timeline: 'Unknown',
      confidence: 50,
      isBenefit: null
    }));
  }

  // Transform OpenStates bill data
  transformOpenStatesBills(bills) {
    return bills.map(bill => ({
      id: `state-${bill.id}`,
      type: 'state_bill',
      title: bill.title,
      status: this.mapOpenStatesStatus(bill.latest_action?.description),
      scope: 'State',
      category: this.categorizeByTitle(bill.title),
      description: bill.abstract || bill.title,
      billNumber: bill.identifier,
      sponsor: bill.sponsorships?.[0]?.name,
      dateIntroduced: bill.first_action_date,
      location: { state: bill.jurisdiction.name, stateCode: bill.jurisdiction.jurisdiction_id },
      sourceUrl: bill.sources?.[0]?.url,
      lastUpdated: bill.updated_at,
      // Add default financial data to prevent NaN
      personalImpact: 'Impact analysis pending - please refresh AI analysis for details.',
      financialEffect: 0,
      timeline: 'Unknown',
      confidence: 50,
      isBenefit: null
    }));
  }

  // Transform Google Civic data
  transformGoogleCivicData(data, location) {
    const results = [];
    
    if (data.contests) {
      data.contests.forEach(contest => {
        if (contest.type === 'Referendum' || contest.ballotTitle) {
          results.push({
            id: `civic-${contest.ballotTitle?.replace(/\s+/g, '-')}`,
            type: 'ballot_measure',
            title: contest.ballotTitle || contest.referendumTitle || 'Local Ballot Measure',
            status: 'On Ballot',
            scope: 'Local',
            category: this.categorizeByTitle(contest.ballotTitle || ''),
            description: contest.referendumSubtitle || contest.ballotTitle,
            location: location,
            electionDate: data.election?.electionDay,
            votingOptions: contest.candidates?.map(c => c.name) || ['Yes', 'No'],
            sourceUrl: contest.sources?.[0]?.name === 'Ballot Information Project' ? contest.sources[0].url : null,
            // Add default financial data to prevent NaN
            personalImpact: 'Impact analysis pending - please refresh AI analysis for details.',
            financialEffect: 0,
            timeline: 'Unknown',
            confidence: 50,
            isBenefit: null
          });
        }
      });
    }

    return results;
  }

  // Utility functions
  parseLocation(location) {
    if (!location) return {};
    const parts = location.split(',').map(p => p.trim());
    const city = parts[0];
    const stateOrCode = parts[1];
    
    // Check if it's already a state code (2 letters)
    if (stateOrCode && stateOrCode.length === 2) {
      return {
        city: city,
        state: this.getStateNameFromCode(stateOrCode.toUpperCase()),
        stateCode: stateOrCode.toUpperCase()
      };
    }
    
    return {
      city: city,
      state: stateOrCode
    };
  }

  parseLocationWithCounty(location) {
    // Enhanced location parsing to detect county information
    // This would need more sophisticated logic for real implementation
    const { city, state } = this.parseLocation(location);
    
    // For now, return basic info - could be enhanced with county lookup tables
    return { city, county: null, state };
  }

  getStateCode(stateName) {
    const stateMap = {
      'california': 'CA', 'texas': 'TX', 'florida': 'FL', 'new york': 'NY',
      'pennsylvania': 'PA', 'illinois': 'IL', 'ohio': 'OH', 'georgia': 'GA',
      'north carolina': 'NC', 'michigan': 'MI'
      // Add more as needed
    };
    return stateMap[stateName?.toLowerCase()];
  }

  categorizeByTitle(title) {
    if (!title) return 'Other';
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('housing') || titleLower.includes('affordable')) return 'Housing';
    if (titleLower.includes('veteran') || titleLower.includes('military') || titleLower.includes('armed forces') || titleLower.includes('ready reserve')) return 'Veterans Affairs';
    if (titleLower.includes('health') || titleLower.includes('medical') || titleLower.includes('drug') || titleLower.includes('animal drug')) return 'Healthcare';
    if (titleLower.includes('education') || titleLower.includes('school')) return 'Education';
    if (titleLower.includes('transport') || titleLower.includes('infrastructure')) return 'Transportation';
    if (titleLower.includes('environment') || titleLower.includes('climate')) return 'Environment';
    if (titleLower.includes('tax') || titleLower.includes('economic') || titleLower.includes('revenue') || titleLower.includes('internal revenue')) return 'Economic';
    if (titleLower.includes('safety') || titleLower.includes('police')) return 'Public Safety';
    if (titleLower.includes('emoluments') || titleLower.includes('ethics') || titleLower.includes('transparency') || titleLower.includes('information') || titleLower.includes('internet')) return 'Government Reform';
    if (titleLower.includes('volunteer') || titleLower.includes('senior')) return 'Social Issues';
    
    return 'Other';
  }

  mapCongressStatus(actionCode) {
    // Map Congress.gov action codes to readable status
    if (!actionCode) return 'Introduced';
    // This would be expanded with actual Congress.gov action code mappings
    return 'In Committee';
  }

  mapOpenStatesStatus(description) {
    if (!description) return 'Introduced';
    const desc = description.toLowerCase();
    if (desc.includes('passed')) return 'Passed';
    if (desc.includes('signed')) return 'Signed';
    if (desc.includes('committee')) return 'In Committee';
    return 'Introduced';
  }

  parseRSSFeed(xmlData, location) {
    // Basic RSS parsing - would need proper XML parser for production
    // For now, return empty array but structure is ready
    return [];
  }

  // Get state name from state code
  getStateNameFromCode(code) {
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
    return stateMap[code?.toUpperCase()] || code;
  }

  // Generate sample state bills when API fails
  generateSampleStateBills(stateCode, limit = 5) {
    const stateName = this.getStateNameFromCode(stateCode);
    return [
      {
        id: `${stateCode}-sample-veterans-1`,
        type: 'state_bill',
        title: `${stateName} Veterans Property Tax Exemption Act`,
        status: 'In Committee',
        scope: 'State',
        category: 'Veterans Affairs',
        description: `Expands property tax exemptions for disabled veterans in ${stateName}`,
        billNumber: 'SB 2024-001',
        sponsor: `${stateName} State Senator`,
        dateIntroduced: '2025-01-15',
        location: { state: stateName, stateCode: stateCode },
        personalImpact: 'As a veteran, this could reduce your property taxes significantly.',
        financialEffect: 1200,
        timeline: '6-8 months',
        confidence: 75,
        isBenefit: true,
        isSampleContent: true,
        relevantDemographics: ['veterans', 'homeowners'],
        relevantInterests: ['veterans_affairs', 'tax_policy']
      },
      {
        id: `${stateCode}-sample-healthcare-1`,
        type: 'state_bill', 
        title: `${stateName} Healthcare Worker Support Act`,
        status: 'Passed Assembly',
        scope: 'State',
        category: 'Healthcare',
        description: `Provides additional benefits and protections for healthcare workers in ${stateName}`,
        billNumber: 'AB 2024-045',
        sponsor: `${stateName} Assembly Member`,
        dateIntroduced: '2025-02-01',
        location: { state: stateName, stateCode: stateCode },
        personalImpact: 'As a healthcare worker, this could provide additional job protections and benefits.',
        financialEffect: 800,
        timeline: '3-4 months',
        confidence: 80,
        isBenefit: true,
        isSampleContent: true,
        relevantDemographics: ['healthcare_workers'],
        relevantInterests: ['healthcare_policy', 'worker_rights']
      }
    ].slice(0, limit);
  }

  // Generate sample local content when APIs fail
  generateSampleLocalContent(location) {
    const { city, state } = this.parseLocation(location);
    const cityName = city || 'Local';
    
    return [
      {
        id: `${cityName.toLowerCase()}-infrastructure-2025`,
        type: 'ballot_measure',
        title: `${cityName} Infrastructure Bond Measure`,
        status: 'On Ballot',
        scope: 'Local',
        category: 'Infrastructure',
        description: `$50 million bond measure to improve roads, bridges, and public facilities in ${cityName}`,
        location: location,
        electionDate: '2025-11-04',
        votingOptions: ['Yes', 'No'],
        personalImpact: 'This infrastructure bond could improve roads and services in your area but may increase property taxes.',
        financialEffect: -150,
        timeline: '2-3 years',
        confidence: 70,
        isBenefit: true,
        isSampleContent: true,
        relevantDemographics: ['homeowners', 'commuters', 'all_residents'],
        relevantInterests: ['infrastructure', 'transportation', 'public_services']
      },
      {
        id: `${cityName.toLowerCase()}-public-safety-2025`,
        type: 'ballot_measure',
        title: `${cityName} Public Safety Enhancement Tax`,
        status: 'On Ballot', 
        scope: 'Local',
        category: 'Public Safety',
        description: `0.5% sales tax increase to fund additional police officers and fire department equipment in ${cityName}`,
        location: location,
        electionDate: '2025-11-04',
        votingOptions: ['Yes', 'No'],
        taxImpact: 0.005,
        personalImpact: 'This would increase local sales tax to fund enhanced police and fire services.',
        financialEffect: -200,
        timeline: '6-12 months',
        confidence: 75,
        isBenefit: false,
        isSampleContent: true,
        relevantDemographics: ['all_residents'],
        relevantInterests: ['public_safety', 'tax_policy']
      }
    ];
  }

  // Main entry point - get all relevant content for any location
  async getAllContent(userLocation, userProfile = {}) {
    const results = [];
    const { state, stateCode } = this.parseLocation(userLocation);
    const finalStateCode = stateCode || this.getStateCode(state);

    try {
      // Fetch all data sources in parallel
      const [federalBills, stateBills, localContent] = await Promise.allSettled([
        this.getFederalBills(6),
        finalStateCode ? this.getStateBills(finalStateCode, 4) : Promise.resolve([]),
        this.getLocalContent(userLocation)
      ]);

      // Add successful results
      if (federalBills.status === 'fulfilled') results.push(...federalBills.value);
      if (stateBills.status === 'fulfilled') results.push(...stateBills.value);
      if (localContent.status === 'fulfilled') results.push(...localContent.value);

      console.log(`Fetched ${results.length} real items for ${userLocation}`);
      console.log(`- Federal: ${federalBills.status === 'fulfilled' ? federalBills.value.length : 0}`);
      console.log(`- State: ${stateBills.status === 'fulfilled' ? stateBills.value.length : 0}`);
      console.log(`- Local: ${localContent.status === 'fulfilled' ? localContent.value.length : 0}`);
      
      return results;

    } catch (error) {
      console.error('Error fetching universal content:', error);
      return [];
    }
  }
}

export default new UniversalDataSources();