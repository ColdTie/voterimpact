// Service for fetching city-specific data from various sources
import { ContentTypes, ContentStatus, ContentCategories, ContentScope } from '../types/contentTypes';

class CityDataService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 4 * 60 * 60 * 1000; // 4 hours
  }

  // Get Menifee-specific content
  async getMenifeeContent() {
    const content = [];
    
    // City projects
    content.push(
      {
        id: 'menifee-bradley-bridge',
        type: ContentTypes.CITY_PROJECT,
        title: 'Bradley Road Bridge over Salt Creek Construction',
        description: 'Construction project to prevent flooding of Bradley Road during rain events and enhance first responder response times.',
        status: ContentStatus.APPROVED,
        scope: ContentScope.CITY,
        category: ContentCategories.INFRASTRUCTURE,
        location: {
          city: 'Menifee',
          county: 'Riverside',
          state: 'California',
          stateCode: 'CA'
        },
        dateIntroduced: '2024-10-15',
        effectiveDate: '2025-08-01',
        estimatedCost: 12500000,
        fundingSource: 'City Capital Improvement Fund',
        summary: 'This capital improvement project will construct a new bridge over Salt Creek to prevent road flooding and improve emergency vehicle access.',
        keyProvisions: [
          'New bridge construction over Salt Creek',
          'Improved drainage systems',
          'Enhanced emergency vehicle access',
          'Expected completion by 2026'
        ],
        relevantDemographics: ['commuters', 'homeowners', 'families'],
        relevantInterests: ['infrastructure', 'public_safety', 'transportation'],
        priorityMatch: ['infrastructure', 'public_safety', 'flood_prevention']
      },
      {
        id: 'menifee-hills-open-space',
        type: ContentTypes.CITY_PROJECT,
        title: 'Menifee Hills Open Space Preservation',
        description: 'City secures nearly 400 acres of open space for future recreational opportunities.',
        status: ContentStatus.COMPLETED,
        scope: ContentScope.CITY,
        category: ContentCategories.ENVIRONMENT,
        location: {
          city: 'Menifee',
          county: 'Riverside',
          state: 'California',
          stateCode: 'CA'
        },
        dateIntroduced: '2024-11-01',
        effectiveDate: '2025-01-15',
        estimatedCost: 8200000,
        fundingSource: 'City Parks Fund and State Grants',
        summary: '19 parcels totaling 400 acres preserved for open space and future recreational development at below-market rate.',
        keyProvisions: [
          '400 acres of preserved open space',
          '19 parcels in Menifee Hills area',
          'Future trail development planned',
          'Wildlife habitat preservation'
        ],
        relevantDemographics: ['outdoor_enthusiasts', 'families', 'seniors'],
        relevantInterests: ['environmental_protection', 'recreation', 'quality_of_life'],
        priorityMatch: ['environmental_protection', 'recreation', 'community_development']
      }
    );

    // Tax measures
    content.push({
      id: 'menifee-stax-2025',
      type: ContentTypes.TAX_MEASURE,
      title: 'STAX Property Tax Information System',
      description: 'Online system providing Menifee residents easy access to special district tax information.',
      status: ContentStatus.ACTIVE,
      scope: ContentScope.CITY,
      category: ContentCategories.TAX_POLICY,
      location: {
        city: 'Menifee',
        county: 'Riverside',
        state: 'California',
        stateCode: 'CA'
      },
      summary: 'STAX Property Finder allows property owners to obtain details about special district taxes and access tax resources.',
      relevantDemographics: ['homeowners', 'property_owners'],
      relevantInterests: ['tax_policy', 'property_taxes'],
      priorityMatch: ['tax_transparency', 'property_ownership']
    });

    // Budget items
    content.push({
      id: 'menifee-budget-2025-27',
      type: ContentTypes.BUDGET_ITEM,
      title: 'Menifee Biennial Budget 2025/26-2026/27',
      description: 'Two-year budget maintaining strong investments in public safety and local infrastructure.',
      status: ContentStatus.APPROVED,
      scope: ContentScope.CITY,
      category: ContentCategories.ECONOMIC,
      location: {
        city: 'Menifee',
        county: 'Riverside',
        state: 'California',
        stateCode: 'CA'
      },
      dateIntroduced: '2025-05-01',
      effectiveDate: '2025-07-01',
      estimatedCost: 156000000, // Total 2-year budget
      summary: 'Balanced financial plan addressing key priorities while maintaining healthy reserves.',
      keyProvisions: [
        'Increased public safety funding by 8%',
        'Infrastructure investment of $24 million',
        'Maintained 20% reserve fund',
        'No new taxes or fee increases'
      ],
      relevantDemographics: ['all_residents'],
      relevantInterests: ['public_safety', 'infrastructure', 'fiscal_responsibility'],
      priorityMatch: ['public_safety', 'infrastructure', 'economic_stability']
    });

    // Elections and candidates
    content.push({
      id: 'menifee-election-2024',
      type: ContentTypes.ELECTION,
      title: '2024 Menifee General Municipal Election',
      description: 'Election for Mayor (at-large), District 1, and District 3 council seats.',
      status: ContentStatus.ACTIVE,
      scope: ContentScope.CITY,
      category: ContentCategories.OTHER,
      location: {
        city: 'Menifee',
        county: 'Riverside',
        state: 'California',
        stateCode: 'CA'
      },
      electionDate: '2024-11-05',
      summary: 'Municipal election for city leadership positions.',
      votingOptions: ['Mayor', 'District 1 Council', 'District 3 Council'],
      relevantDemographics: ['registered_voters'],
      relevantInterests: ['local_politics', 'civic_engagement'],
      priorityMatch: ['civic_participation', 'local_governance']
    });

    // Add candidate information
    const candidates = [
      {
        id: 'menifee-mayor-sobek',
        type: ContentTypes.CANDIDATE,
        title: 'Lesa Sobek - Mayor Candidate',
        status: ContentStatus.ACTIVE,
        scope: ContentScope.CITY,
        category: ContentCategories.OTHER,
        location: { city: 'Menifee', county: 'Riverside', state: 'California', stateCode: 'CA' },
        electionDate: '2024-11-05',
        summary: 'Incumbent Mayor seeking re-election.'
      },
      {
        id: 'menifee-mayor-estrada',
        type: ContentTypes.CANDIDATE,
        title: 'Ricky Estrada - Mayor Candidate',
        status: ContentStatus.ACTIVE,
        scope: ContentScope.CITY,
        category: ContentCategories.OTHER,
        location: { city: 'Menifee', county: 'Riverside', state: 'California', stateCode: 'CA' },
        electionDate: '2024-11-05',
        summary: 'Challenger for Mayor position.'
      }
    ];
    
    content.push(...candidates);

    return content;
  }

  // Get content for any California city
  async getCaliforniaCityContent(cityName) {
    const content = [];
    
    // Common California initiatives
    content.push({
      id: `ca-${cityName.toLowerCase()}-housing-2025`,
      type: ContentTypes.BALLOT_MEASURE,
      title: `${cityName} Affordable Housing Initiative`,
      description: 'Local measure to increase affordable housing development through zoning changes and developer incentives.',
      status: ContentStatus.ON_BALLOT,
      scope: ContentScope.CITY,
      category: ContentCategories.HOUSING,
      location: {
        city: cityName,
        state: 'California',
        stateCode: 'CA'
      },
      electionDate: '2025-11-04',
      estimatedCost: 50000000,
      summary: 'Requires 15% of new developments to include affordable units and provides tax incentives for developers.',
      votingOptions: ['Yes', 'No'],
      relevantDemographics: ['renters', 'low_income', 'young_adults'],
      relevantInterests: ['housing_affordability', 'urban_development'],
      priorityMatch: ['affordable_housing', 'cost_of_living']
    });

    // California-wide propositions
    content.push({
      id: 'ca-prop-2025-water',
      type: ContentTypes.BALLOT_MEASURE,
      title: 'California Water Infrastructure Bond',
      description: 'Statewide bond measure to fund water storage, conservation, and quality projects.',
      status: ContentStatus.ON_BALLOT,
      scope: ContentScope.STATE,
      category: ContentCategories.INFRASTRUCTURE,
      location: {
        state: 'California',
        stateCode: 'CA'
      },
      electionDate: '2025-11-04',
      estimatedCost: 8500000000,
      summary: '$8.5 billion bond for water infrastructure including storage, recycling, and groundwater cleanup.',
      votingOptions: ['Yes', 'No'],
      keyProvisions: [
        '$2.5 billion for water storage projects',
        '$1.5 billion for groundwater sustainability',
        '$1 billion for water recycling',
        '$2 billion for safe drinking water'
      ],
      relevantDemographics: ['all_residents', 'farmers', 'homeowners'],
      relevantInterests: ['environmental_protection', 'infrastructure', 'agriculture'],
      priorityMatch: ['water_security', 'environmental_protection', 'infrastructure']
    });

    return content;
  }

  // Get content based on user location
  async getContentByLocation(location) {
    if (!location) return [];
    
    const locationLower = location.toLowerCase();
    let content = [];

    // Check for specific cities
    if (locationLower.includes('menifee')) {
      content = await this.getMenifeeContent();
    } else if (locationLower.includes('california') || locationLower.includes(' ca')) {
      // Extract city name and get California content
      const cityMatch = location.match(/^([^,]+),/);
      const cityName = cityMatch ? cityMatch[1].trim() : 'Your City';
      content = await this.getCaliforniaCityContent(cityName);
    }

    // Add generic local content based on common issues
    content.push(...this.getGenericLocalContent(location));

    return content;
  }

  // Generic local content that applies to most cities
  getGenericLocalContent(location) {
    return [
      {
        id: 'local-infrastructure-bond',
        type: ContentTypes.BALLOT_MEASURE,
        title: 'Local Infrastructure Improvement Bond',
        description: 'Bond measure to fund road repairs, sidewalk improvements, and storm drain upgrades.',
        status: ContentStatus.ON_BALLOT,
        scope: ContentScope.LOCAL,
        category: ContentCategories.INFRASTRUCTURE,
        location: { city: location },
        electionDate: '2025-11-04',
        estimatedCost: 75000000,
        summary: 'General obligation bond to fund critical infrastructure repairs and improvements.',
        votingOptions: ['Yes', 'No'],
        relevantDemographics: ['commuters', 'homeowners', 'businesses'],
        relevantInterests: ['infrastructure', 'public_safety', 'property_values'],
        priorityMatch: ['infrastructure', 'community_development']
      },
      {
        id: 'local-public-safety-tax',
        type: ContentTypes.TAX_MEASURE,
        title: 'Public Safety Sales Tax Measure',
        description: 'Quarter-cent sales tax increase to fund police, fire, and emergency services.',
        status: ContentStatus.ON_BALLOT,
        scope: ContentScope.LOCAL,
        category: ContentCategories.PUBLIC_SAFETY,
        location: { city: location },
        electionDate: '2025-11-04',
        taxImpact: 0.0025, // 0.25%
        summary: '0.25% sales tax increase generating approximately $10 million annually for public safety.',
        votingOptions: ['Yes', 'No'],
        relevantDemographics: ['all_residents'],
        relevantInterests: ['public_safety', 'tax_policy'],
        priorityMatch: ['public_safety', 'emergency_services']
      }
    ];
  }
}

export default new CityDataService();