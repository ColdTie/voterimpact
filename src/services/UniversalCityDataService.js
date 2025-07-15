// Universal city data service that works for any US location
import { ContentTypes, ContentStatus, ContentCategories, ContentScope } from '../types/contentTypes';

class UniversalCityDataService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 4 * 60 * 60 * 1000; // 4 hours
    
    // Common city project types for different population sizes
    this.cityProjectTemplates = {
      large: [
        'Transportation Infrastructure Bond',
        'Public Safety Enhancement Program', 
        'Affordable Housing Development Initiative',
        'Parks and Recreation Expansion',
        'Downtown Revitalization Project'
      ],
      medium: [
        'Road Improvement Project',
        'Water System Upgrade',
        'Library Modernization',
        'Emergency Services Enhancement',
        'Community Center Development'
      ],
      small: [
        'Main Street Improvement Project',
        'Water Infrastructure Upgrade',
        'Fire Department Equipment',
        'Park Maintenance Program',
        'Municipal Building Repair'
      ]
    };
  }

  // Get content for any US location
  async getContentByLocation(userLocation) {
    if (!userLocation) return [];
    
    const locationInfo = this.parseLocation(userLocation);
    const content = [];

    // Generate city-level content
    if (locationInfo.city) {
      content.push(...this.generateCityContent(locationInfo));
    }

    // Generate county-level content
    if (locationInfo.county) {
      content.push(...this.generateCountyContent(locationInfo));
    }

    // Generate state-level content
    if (locationInfo.state) {
      content.push(...this.generateStateContent(locationInfo));
    }

    return content;
  }

  // Parse location string into components
  parseLocation(location) {
    if (!location || typeof location !== 'string') return {};
    
    const parts = location.split(',').map(part => part.trim());
    let city, county, state, stateCode;
    
    if (parts.length >= 2) {
      city = parts[0];
      const statePart = parts[parts.length - 1];
      
      // Check if it's a state code (2 letters) or full state name
      if (statePart.length === 2) {
        stateCode = statePart.toUpperCase();
        state = this.getStateNameFromCode(stateCode);
      } else {
        state = statePart;
        stateCode = this.getStateCodeFromName(statePart);
      }
      
      // If there are 3 parts, middle might be county
      if (parts.length === 3) {
        county = parts[1];
      }
    }
    
    return { city, county, state, stateCode };
  }

  // Generate generic city content based on location
  generateCityContent(locationInfo) {
    const content = [];
    const citySize = this.determineCitySize(locationInfo.city);
    
    // Infrastructure project
    content.push({
      id: `${locationInfo.city?.toLowerCase()}-infrastructure-2025`,
      type: ContentTypes.CITY_PROJECT,
      title: `${locationInfo.city} Infrastructure Improvement Project`,
      description: `Major infrastructure improvements including road repairs, water system upgrades, and public facility enhancements in ${locationInfo.city}.`,
      status: ContentStatus.PROPOSED,
      scope: ContentScope.CITY,
      category: ContentCategories.INFRASTRUCTURE,
      location: locationInfo,
      dateIntroduced: '2025-03-01',
      effectiveDate: '2025-07-01',
      estimatedCost: this.getEstimatedCost(citySize, 'infrastructure'),
      fundingSource: 'City Capital Improvement Fund',
      summary: `Multi-year infrastructure investment to improve ${locationInfo.city}'s roads, water systems, and public facilities.`,
      keyProvisions: this.getInfrastructureProvisions(citySize),
      relevantDemographics: ['commuters', 'homeowners', 'families', 'all_residents'],
      relevantInterests: ['infrastructure', 'public_safety', 'transportation'],
      priorityMatch: ['infrastructure', 'community_development', 'quality_of_life'],
      personalImpact: `This infrastructure project could improve road conditions and public services in ${locationInfo.city}.`,
      financialEffect: -200,
      timeline: '2-3 years',
      confidence: 70,
      isBenefit: true
    });

    // Budget item
    content.push({
      id: `${locationInfo.city?.toLowerCase()}-budget-2025`,
      type: ContentTypes.BUDGET_ITEM,
      title: `${locationInfo.city} Annual Budget FY 2025-26`,
      description: `Annual city budget proposal emphasizing public safety, infrastructure, and community services for ${locationInfo.city}.`,
      status: ContentStatus.PROPOSED,
      scope: ContentScope.CITY,
      category: ContentCategories.ECONOMIC,
      location: locationInfo,
      dateIntroduced: '2025-05-01',
      effectiveDate: '2025-07-01',
      estimatedCost: this.getEstimatedCost(citySize, 'budget'),
      summary: `Balanced budget maintaining essential city services while investing in community priorities.`,
      keyProvisions: this.getBudgetProvisions(citySize),
      relevantDemographics: ['all_residents'],
      relevantInterests: ['city_services', 'public_safety', 'fiscal_policy'],
      priorityMatch: ['public_safety', 'city_services', 'fiscal_responsibility'],
      personalImpact: `This budget affects all city services you use in ${locationInfo.city}.`,
      financialEffect: 0,
      timeline: '1 year',
      confidence: 85,
      isBenefit: true
    });

    return content;
  }

  // Generate county-level content
  generateCountyContent(locationInfo) {
    if (!locationInfo.county) return [];
    
    return [{
      id: `${locationInfo.county?.toLowerCase()}-county-services-2025`,
      type: ContentTypes.BALLOT_MEASURE,
      title: `${locationInfo.county} County Services Enhancement Measure`,
      description: `County-wide measure to improve public health, libraries, and emergency services in ${locationInfo.county} County.`,
      status: ContentStatus.ON_BALLOT,
      scope: ContentScope.COUNTY,
      category: ContentCategories.PUBLIC_SAFETY,
      location: locationInfo,
      electionDate: '2025-11-04',
      estimatedCost: 25000000,
      taxImpact: 0.001, // 0.1%
      votingOptions: ['Yes', 'No'],
      summary: `County-wide investment in essential services and emergency preparedness.`,
      keyProvisions: [
        'Enhanced emergency response times',
        'Expanded public health services',
        'Library system improvements',
        'County park maintenance'
      ],
      relevantDemographics: ['all_residents', 'seniors', 'families'],
      relevantInterests: ['public_safety', 'healthcare_access', 'libraries'],
      priorityMatch: ['public_safety', 'community_services'],
      personalImpact: `This measure would improve county services throughout ${locationInfo.county} County.`,
      financialEffect: -50,
      timeline: '6-12 months',
      confidence: 75,
      isBenefit: true
    }];
  }

  // Generate state-level content
  generateStateContent(locationInfo) {
    if (!locationInfo.state) return [];
    
    return [{
      id: `${locationInfo.stateCode?.toLowerCase()}-education-funding-2025`,
      type: ContentTypes.STATE_BILL,
      title: `${locationInfo.state} Education Funding Enhancement Act`,
      description: `State legislation to increase K-12 education funding and teacher compensation across ${locationInfo.state}.`,
      status: ContentStatus.IN_COMMITTEE,
      scope: ContentScope.STATE,
      category: ContentCategories.EDUCATION,
      location: locationInfo,
      dateIntroduced: '2025-02-15',
      estimatedCost: 500000000,
      summary: `Significant investment in ${locationInfo.state}'s education system to improve outcomes for all students.`,
      keyProvisions: [
        'Increase per-pupil funding by 15%',
        'Raise minimum teacher salary',
        'Additional support for rural schools',
        'Special education funding enhancement'
      ],
      sponsor: `${locationInfo.state} State Legislature`,
      relevantDemographics: ['families_with_children', 'teachers', 'all_residents'],
      relevantInterests: ['education_policy', 'tax_policy', 'child_welfare'],
      priorityMatch: ['education_quality', 'education_funding'],
      personalImpact: `This could improve education quality in ${locationInfo.state} schools through increased state funding.`,
      financialEffect: 0,
      timeline: '1-2 years',
      confidence: 60,
      isBenefit: true
    }];
  }

  // Determine city size category for scaling content
  determineCitySize(city) {
    if (!city) return 'small';
    
    // This is a simplified categorization - in a real app, you'd have a database
    const majorCities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose'];
    const mediumCities = ['austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis', 'seattle', 'denver', 'washington'];
    
    const cityLower = city.toLowerCase();
    
    if (majorCities.some(major => cityLower.includes(major))) return 'large';
    if (mediumCities.some(medium => cityLower.includes(medium))) return 'medium';
    return 'small';
  }

  // Get estimated costs based on city size and project type
  getEstimatedCost(citySize, projectType) {
    const costs = {
      infrastructure: { large: 50000000, medium: 15000000, small: 5000000 },
      budget: { large: 2000000000, medium: 500000000, small: 25000000 }
    };
    
    return costs[projectType]?.[citySize] || costs[projectType]?.small || 1000000;
  }

  // Get infrastructure provisions based on city size
  getInfrastructureProvisions(citySize) {
    const provisions = {
      large: [
        'Major highway and bridge repairs',
        'Public transit system upgrades',
        'Water treatment facility modernization',
        'Smart traffic management systems',
        'Flood control improvements'
      ],
      medium: [
        'Road resurfacing and repair',
        'Water pipe replacement program',
        'Traffic signal upgrades',
        'Storm drain improvements',
        'Sidewalk accessibility enhancements'
      ],
      small: [
        'Main street paving project',
        'Water system maintenance',
        'Traffic safety improvements',
        'Basic infrastructure repairs',
        'Emergency vehicle access upgrades'
      ]
    };
    
    return provisions[citySize] || provisions.small;
  }

  // Get budget provisions based on city size
  getBudgetProvisions(citySize) {
    const provisions = {
      large: [
        '5% increase in public safety funding',
        '$25M for infrastructure investments',
        'Expanded social services programs',
        'Technology modernization initiatives'
      ],
      medium: [
        '3% increase in police and fire funding',
        '$8M for road and facility improvements',
        'Enhanced community programs',
        'Equipment and technology upgrades'
      ],
      small: [
        'Maintain current service levels',
        '$2M for essential repairs',
        'Basic equipment replacement',
        'Emergency reserve fund maintenance'
      ]
    };
    
    return provisions[citySize] || provisions.small;
  }

  // State name/code conversion helpers
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
    return stateMap[code] || code;
  }

  getStateCodeFromName(name) {
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
}

const universalCityDataService = new UniversalCityDataService();
export default universalCityDataService;