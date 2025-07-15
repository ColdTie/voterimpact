// Utility for parsing location information from user profile

class LocationParser {
  constructor() {
    this.stateMap = {
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

    this.stateNameMap = Object.fromEntries(
      Object.entries(this.stateMap).map(([name, code]) => [code, name])
    );
  }

  // Parse location string to extract components
  parseLocation(locationString) {
    if (!locationString) {
      return {
        city: null,
        state: null,
        stateCode: null,
        county: null,
        zipCode: null,
        fullLocation: null
      };
    }

    const location = locationString.trim();
    const locationLower = location.toLowerCase();

    // Extract zip code
    const zipMatch = location.match(/\b(\d{5}(-\d{4})?)\b/);
    const zipCode = zipMatch ? zipMatch[1] : null;

    // Extract state
    const stateCode = this.extractStateCode(locationLower);
    const stateName = stateCode ? this.getFullStateName(stateCode) : null;

    // Extract city (everything before the state or comma)
    let city = null;
    if (stateCode) {
      const statePattern = new RegExp(`\\b${stateName.toLowerCase()}\\b|\\b${stateCode.toLowerCase()}\\b`);
      const beforeState = location.split(statePattern)[0];
      city = beforeState.replace(/,$/, '').trim() || null;
    } else {
      // If no state found, try to extract city from comma-separated format
      const parts = location.split(',');
      if (parts.length > 0) {
        city = parts[0].trim() || null;
      }
    }

    return {
      city,
      state: stateName,
      stateCode,
      county: null, // Would need additional parsing logic
      zipCode,
      fullLocation: location,
      isValid: !!stateCode
    };
  }

  // Extract state code from location string
  extractStateCode(locationLower) {
    // First try to find full state names
    for (const [stateName, stateCode] of Object.entries(this.stateMap)) {
      if (locationLower.includes(stateName)) {
        return stateCode;
      }
    }
    
    // Then look for state abbreviations (2-letter codes at word boundaries)
    const stateAbbreviations = Object.values(this.stateMap);
    const stateRegex = new RegExp(`\\b(${stateAbbreviations.join('|')})\\b`, 'i');
    const match = locationLower.match(stateRegex);
    if (match) {
      return match[1].toUpperCase();
    }
    
    return null;
  }

  // Get full state name from abbreviation
  getFullStateName(stateCode) {
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
    
    return stateNames[stateCode?.toUpperCase()] || stateCode;
  }

  // Determine if location is urban, suburban, or rural (simplified heuristic)
  getLocationType(parsedLocation) {
    if (!parsedLocation.city) {
      return 'unknown';
    }

    const city = parsedLocation.city.toLowerCase();
    
    // Major cities (simplified list)
    const majorCities = [
      'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
      'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
      'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis',
      'seattle', 'denver', 'washington', 'boston', 'el paso', 'detroit',
      'nashville', 'portland', 'memphis', 'oklahoma city', 'las vegas',
      'louisville', 'baltimore', 'milwaukee', 'albuquerque', 'tucson',
      'fresno', 'mesa', 'sacramento', 'atlanta', 'kansas city', 'colorado springs',
      'omaha', 'raleigh', 'miami', 'long beach', 'virginia beach', 'oakland',
      'minneapolis', 'tulsa', 'tampa', 'new orleans', 'wichita', 'cleveland'
    ];

    if (majorCities.some(majorCity => city.includes(majorCity))) {
      return 'urban';
    }

    // If it has "city" in the name or is a state capital, likely urban/suburban
    if (city.includes('city') || this.isStateCapital(city, parsedLocation.stateCode)) {
      return 'suburban';
    }

    // Default to suburban for named cities
    return 'suburban';
  }

  // Check if city is a state capital (simplified list)
  isStateCapital(city, stateCode) {
    const capitals = {
      'AL': 'montgomery', 'AK': 'juneau', 'AZ': 'phoenix', 'AR': 'little rock', 'CA': 'sacramento',
      'CO': 'denver', 'CT': 'hartford', 'DE': 'dover', 'FL': 'tallahassee', 'GA': 'atlanta',
      'HI': 'honolulu', 'ID': 'boise', 'IL': 'springfield', 'IN': 'indianapolis', 'IA': 'des moines',
      'KS': 'topeka', 'KY': 'frankfort', 'LA': 'baton rouge', 'ME': 'augusta', 'MD': 'annapolis',
      'MA': 'boston', 'MI': 'lansing', 'MN': 'saint paul', 'MS': 'jackson', 'MO': 'jefferson city',
      'MT': 'helena', 'NE': 'lincoln', 'NV': 'carson city', 'NH': 'concord', 'NJ': 'trenton',
      'NM': 'santa fe', 'NY': 'albany', 'NC': 'raleigh', 'ND': 'bismarck', 'OH': 'columbus',
      'OK': 'oklahoma city', 'OR': 'salem', 'PA': 'harrisburg', 'RI': 'providence', 'SC': 'columbia',
      'SD': 'pierre', 'TN': 'nashville', 'TX': 'austin', 'UT': 'salt lake city', 'VT': 'montpelier',
      'VA': 'richmond', 'WA': 'olympia', 'WV': 'charleston', 'WI': 'madison', 'WY': 'cheyenne'
    };

    return capitals[stateCode]?.toLowerCase() === city.toLowerCase();
  }

  // Format location for display
  formatLocationForDisplay(parsedLocation) {
    if (!parsedLocation.isValid) {
      return parsedLocation.fullLocation || 'Unknown Location';
    }

    const parts = [];
    if (parsedLocation.city) {
      parts.push(parsedLocation.city);
    }
    if (parsedLocation.state) {
      parts.push(parsedLocation.state);
    }

    return parts.join(', ') || parsedLocation.fullLocation;
  }

  // Get jurisdiction information for API calls
  getJurisdictionInfo(parsedLocation) {
    return {
      state: parsedLocation.stateCode?.toLowerCase(),
      stateCode: parsedLocation.stateCode,
      stateName: parsedLocation.state,
      city: parsedLocation.city,
      hasState: !!parsedLocation.stateCode,
      hasCity: !!parsedLocation.city
    };
  }
}

const locationParser = new LocationParser();
export default locationParser;