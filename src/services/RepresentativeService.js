// Service for fetching accurate representatives based on user location
class RepresentativeService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Extract zip code from city, state format or use address as-is
  async getZipCodeFromLocation(location) {
    if (!location) return null;
    
    // If location already contains a zip code, extract it
    const zipMatch = location.match(/\b\d{5}(-\d{4})?\b/);
    if (zipMatch) {
      return zipMatch[0].slice(0, 5); // Return just the 5-digit zip
    }
    
    // For city, state format, return null to let Google Civic API handle the lookup
    // This is more reliable than trying to guess zip codes
    return null;
  }

  // Get representatives using Google Civic Information API
  async getRepresentativesByLocation(location) {
    if (!location) {
      throw new Error('Location is required');
    }

    // Check cache first
    const cacheKey = `reps-${location.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // Try to get zip code first for more accurate results
      const zipCode = await this.getZipCodeFromLocation(location);
      const searchLocation = zipCode ? `${location} ${zipCode}` : location;

      const apiKey = process.env.REACT_APP_GOOGLE_CIVIC_API_KEY;
      if (!apiKey) {
        console.warn('Google Civic API key not configured, using fallback');
        return this.getFallbackRepresentatives(location);
      }

      const params = new URLSearchParams({
        key: apiKey,
        address: searchLocation,
        levels: 'federal',
        roles: 'legislatorUpperBody,legislatorLowerBody'
      });

      const response = await fetch(`https://www.googleapis.com/civicinfo/v2/representatives?${params}`);
      
      if (!response.ok) {
        throw new Error(`Google Civic API error: ${response.status}`);
      }

      const data = await response.json();
      const representatives = this.transformGoogleCivicData(data, location);

      // Cache the results
      this.cache.set(cacheKey, {
        data: representatives,
        timestamp: Date.now()
      });

      return representatives;

    } catch (error) {
      console.error('Error fetching representatives:', error);
      return this.getFallbackRepresentatives(location);
    }
  }

  // Transform Google Civic API data to our format
  transformGoogleCivicData(data, location) {
    const representatives = [];
    
    if (!data.officials || !data.offices) {
      return representatives;
    }

    for (const office of data.offices) {
      if (office.name && (office.name.includes('Senate') || office.name.includes('House'))) {
        for (const officialIndex of office.officialIndices || []) {
          const official = data.officials[officialIndex];
          if (official) {
            representatives.push({
              id: `civic-${officialIndex}-${Date.now()}`,
              name: official.name,
              title: office.name.includes('Senate') ? 'Senator' : 'Representative',
              position: office.name.includes('Senate') ? 'Senator' : 'Representative',
              party: official.party || 'Unknown',
              state: this.extractStateFromLocation(location),
              office: office.name,
              phone: official.phones?.[0] || '',
              email: official.emails?.[0] || '',
              website: official.urls?.[0] || '',
              photo_url: official.photoUrl || this.getBioguidePhoto(official.name),
              photo: official.photoUrl || this.getBioguidePhoto(official.name),
              address: this.formatAddress(official.address?.[0]),
              source: 'google-civic',
              votingRecord: { progressive: null, bipartisan: null }
            });
          }
        }
      }
    }

    return representatives;
  }

  // Fallback representatives for all US states when API fails
  getFallbackRepresentatives(location) {
    const state = this.extractStateFromLocation(location);
    const stateFullName = this.getFullStateName(state);
    
    if (!state) {
      return [{
        id: 'unknown-location',
        name: 'Location Not Recognized',
        title: 'Representative',
        position: 'Representative',
        party: 'Unknown',
        state: 'Unknown',
        office: 'Unknown',
        photo_url: null,
        photo: null,
        website: '',
        source: 'fallback',
        note: 'Please visit house.gov and senate.gov to find your representatives.'
      }];
    }

    // Get senators for the state (this would ideally be a comprehensive database)
    const senators = this.getFallbackSenatorsForState(state, stateFullName);
    
    // Add generic House representative
    const houseRep = {
      id: `${state.toLowerCase()}-house-fallback`,
      name: 'Your House Representative',
      title: 'Representative',
      position: 'Representative',
      party: 'Determining...',
      state: stateFullName,
      office: 'U.S. House',
      photo_url: null,
      photo: null,
      website: 'https://www.house.gov/representatives/find-your-representative',
      source: 'fallback',
      note: 'Exact representative depends on your specific district. Please visit house.gov to find your representative.'
    };

    return [...senators, houseRep];
  }

  // Get fallback senators for each state (partial list - would need complete database)
  getFallbackSenatorsForState(stateCode, stateName) {
    const senators = [];
    
    // This is a simplified fallback - in production you'd want a complete, up-to-date database
    const senatorData = {
      'CA': [
        { name: 'Alex Padilla', party: 'Democratic', bioguide: 'P000145' },
        { name: 'Laphonza Butler', party: 'Democratic', bioguide: 'B001311' }
      ],
      'NY': [
        { name: 'Chuck Schumer', party: 'Democratic', bioguide: 'S000148' },
        { name: 'Kirsten Gillibrand', party: 'Democratic', bioguide: 'G000555' }
      ],
      'TX': [
        { name: 'John Cornyn', party: 'Republican', bioguide: 'C001056' },
        { name: 'Ted Cruz', party: 'Republican', bioguide: 'C001098' }
      ],
      'FL': [
        { name: 'Marco Rubio', party: 'Republican', bioguide: 'R000595' },
        { name: 'Rick Scott', party: 'Republican', bioguide: 'S001217' }
      ],
      'IL': [
        { name: 'Dick Durbin', party: 'Democratic', bioguide: 'D000563' },
        { name: 'Tammy Duckworth', party: 'Democratic', bioguide: 'D000622' }
      ],
      'OH': [
        { name: 'Sherrod Brown', party: 'Democratic', bioguide: 'B000944' },
        { name: 'J.D. Vance', party: 'Republican', bioguide: 'V000137' }
      ],
      'PA': [
        { name: 'Bob Casey Jr.', party: 'Democratic', bioguide: 'C001070' },
        { name: 'John Fetterman', party: 'Democratic', bioguide: 'F000479' }
      ],
      'MI': [
        { name: 'Debbie Stabenow', party: 'Democratic', bioguide: 'S000770' },
        { name: 'Gary Peters', party: 'Democratic', bioguide: 'P000595' }
      ],
      'WA': [
        { name: 'Patty Murray', party: 'Democratic', bioguide: 'M001111' },
        { name: 'Maria Cantwell', party: 'Democratic', bioguide: 'C000127' }
      ],
      'AZ': [
        { name: 'Kyrsten Sinema', party: 'Independent', bioguide: 'S001191' },
        { name: 'Mark Kelly', party: 'Democratic', bioguide: 'K000377' }
      ]
    };

    const stateSenatorsData = senatorData[stateCode];
    if (stateSenatorsData) {
      stateSenatorsData.forEach((senatorInfo, index) => {
        senators.push({
          id: `${stateCode.toLowerCase()}-senator-${index + 1}`,
          name: senatorInfo.name,
          title: 'Senator',
          position: 'Senator',
          party: senatorInfo.party,
          state: stateName,
          office: 'U.S. Senate',
          photo_url: `https://theunitedstates.io/images/congress/450x550/${senatorInfo.bioguide}.jpg`,
          photo: `https://theunitedstates.io/images/congress/450x550/${senatorInfo.bioguide}.jpg`,
          website: '',
          source: 'fallback'
        });
      });
    } else {
      // Generic fallback for states not in our database
      senators.push(
        {
          id: `${stateCode.toLowerCase()}-senator-1`,
          name: `${stateName} Senator 1`,
          title: 'Senator',
          position: 'Senator',
          party: 'Unknown',
          state: stateName,
          office: 'U.S. Senate',
          photo_url: null,
          photo: null,
          website: 'https://www.senate.gov',
          source: 'fallback',
          note: 'Please visit senate.gov to find your current senators.'
        },
        {
          id: `${stateCode.toLowerCase()}-senator-2`,
          name: `${stateName} Senator 2`,
          title: 'Senator',
          position: 'Senator',
          party: 'Unknown',
          state: stateName,
          office: 'U.S. Senate',
          photo_url: null,
          photo: null,
          website: 'https://www.senate.gov',
          source: 'fallback',
          note: 'Please visit senate.gov to find your current senators.'
        }
      );
    }

    return senators;
  }

  // Extract state from location string
  extractStateFromLocation(location) {
    if (!location) return null;
    
    const locationLower = location.toLowerCase();
    
    // Complete state name to abbreviation mapping for all 50 states
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
  }

  // Convert state abbreviation to full name
  getFullStateName(stateCode) {
    if (!stateCode) return 'Unknown';
    
    const stateNames = {
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
    
    return stateNames[stateCode.toUpperCase()] || stateCode;
  }

  // Generate bioguide photo URL from name
  getBioguidePhoto(name) {
    if (!name) return null;
    
    // This is a simplified approach - in a real app you'd need bioguide ID mapping
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f2937&color=fff&size=450`;
  }

  // Format address from Google Civic API
  formatAddress(address) {
    if (!address) return '';
    
    const parts = [
      address.line1,
      address.city,
      address.state,
      address.zip
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.cache.clear();
  }
}

const representativeService = new RepresentativeService();
export default representativeService;