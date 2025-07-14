// Smart data service that handles static vs dynamic politician data
// Zero-breaking-change implementation with intelligent fallback

class PoliticianService {
  constructor() {
    this.useRealData = process.env.REACT_APP_USE_REAL_POLITICIANS === 'true';
    this.apiUrl = process.env.REACT_APP_API_URL || '';
    this.fallbackToStatic = true;
  }

  async getPoliticians(userLocation = null) {
    // If real data is disabled, return static data immediately
    if (!this.useRealData) {
      return this.getStaticPoliticians();
    }

    try {
      // Attempt to fetch real politician data
      const realPoliticians = await this.getRealPoliticians(userLocation);
      
      if (realPoliticians && realPoliticians.length > 0) {
        console.log('✅ Using real politician data from APIs');
        return realPoliticians;
      }
      
      throw new Error('No real politician data available');
      
    } catch (error) {
      console.warn('⚠️ Real politician API failed, falling back to static data:', error.message);
      
      if (this.fallbackToStatic) {
        return this.getStaticPoliticians();
      }
      
      throw error;
    }
  }

  async getRealPoliticians(userLocation) {
    if (!userLocation) {
      // No default state - require location to be passed in
      throw new Error('User location is required for accurate representative lookup');
    }

    const params = new URLSearchParams();
    if (userLocation.state) params.append('state', userLocation.state);
    if (userLocation.address) params.append('address', userLocation.address);
    if (userLocation.zip) params.append('zip', userLocation.zip);

    const response = await fetch(`${this.apiUrl}/api/politicians/by-location?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.fallback) {
      throw new Error(data.message || 'API returned fallback signal');
    }

    return data.data || [];
  }

  getStaticPoliticians() {
    // Return the existing hardcoded politicians from App.js
    // This ensures zero breaking changes
    return [
      {
        id: 1,
        name: 'Bernie Sanders',
        title: 'Senator',
        party: 'Independent',
        state: 'Vermont',
        office: 'U.S. Senate',
        photo_url: 'https://theunitedstates.io/images/congress/450x550/S000033.jpg',
        phone: '(202) 224-5141',
        email: 'senator@sanders.senate.gov',
        website: 'https://www.sanders.senate.gov',
        voting_record: {
          progressive_percentage: 95,
          bipartisan_percentage: 15,
          total_votes: 1247
        },
        source: 'static'
      },
      {
        id: 2,
        name: 'Elizabeth Warren',
        title: 'Senator',
        party: 'Democratic',
        state: 'Massachusetts',
        office: 'U.S. Senate',
        photo_url: 'https://theunitedstates.io/images/congress/450x550/W000817.jpg',
        phone: '(202) 224-4543',
        email: 'senator_warren@warren.senate.gov',
        website: 'https://www.warren.senate.gov',
        voting_record: {
          progressive_percentage: 92,
          bipartisan_percentage: 18,
          total_votes: 1156
        },
        source: 'static'
      },
      {
        id: 3,
        name: 'Catherine Cortez Masto',
        title: 'Senator',
        party: 'Democratic',
        state: 'Nevada',
        office: 'U.S. Senate',
        photo_url: 'https://theunitedstates.io/images/congress/450x550/C001113.jpg',
        phone: '(202) 224-3542',
        email: 'senator@cortezmasto.senate.gov',
        website: 'https://www.cortezmasto.senate.gov',
        voting_record: {
          progressive_percentage: 78,
          bipartisan_percentage: 32,
          total_votes: 892
        },
        source: 'static'
      },
      {
        id: 4,
        name: 'Jacky Rosen',
        title: 'Senator',
        party: 'Democratic',
        state: 'Nevada',
        office: 'U.S. Senate',
        photo_url: 'https://theunitedstates.io/images/congress/450x550/R000608.jpg',
        phone: '(202) 224-6244',
        email: 'senator_rosen@rosen.senate.gov',
        website: 'https://www.rosen.senate.gov',
        voting_record: {
          progressive_percentage: 76,
          bipartisan_percentage: 35,
          total_votes: 743
        },
        source: 'static'
      },
      {
        id: 5,
        name: 'Jon Tester',
        title: 'Senator',
        party: 'Democratic',
        state: 'Montana',
        office: 'U.S. Senate',
        photo_url: 'https://theunitedstates.io/images/congress/450x550/T000464.jpg',
        phone: '(202) 224-2644',
        email: 'senator@tester.senate.gov',
        website: 'https://www.tester.senate.gov',
        voting_record: {
          progressive_percentage: 70,
          bipartisan_percentage: 45,
          total_votes: 1389
        },
        source: 'static'
      },
      {
        id: 6,
        name: 'Mark Takano',
        title: 'Representative',
        party: 'Democratic',
        state: 'California',
        office: 'U.S. House',
        photo_url: 'https://theunitedstates.io/images/congress/450x550/T000472.jpg',
        phone: '(202) 225-2305',
        email: 'rep.takano@takano.house.gov',
        website: 'https://takano.house.gov',
        voting_record: {
          progressive_percentage: 88,
          bipartisan_percentage: 22,
          total_votes: 1034
        },
        source: 'static'
      }
    ];
  }

  // Helper method to determine if we're using real data
  isUsingRealData() {
    return this.useRealData;
  }

  // Helper method to get data source info
  getDataSourceInfo() {
    return {
      useRealData: this.useRealData,
      fallbackEnabled: this.fallbackToStatic,
      apiUrl: this.apiUrl,
      sources: this.useRealData ? ['congress.gov', 'static-fallback'] : ['static']
    };
  }
}

const politicianService = new PoliticianService();
export default politicianService;