// Main endpoint for getting politicians by user location
// Integrates multiple data sources with intelligent fallback

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lat, lng, address, state, zip } = req.query;
    
    if (!lat && !lng && !address && !state && !zip) {
      return res.status(400).json({ 
        error: 'Location parameter required (lat/lng, address, state, or zip)' 
      });
    }

    const politicians = [];
    const errors = [];

    // Step 1: Try Google Civic API for precise district-level lookup (if address provided)
    if (address && !state) {
      try {
        const baseUrl = req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'] 
          ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
          : process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000';
        
        const civicResponse = await fetch(
          `${baseUrl}/api/politicians/civic?address=${encodeURIComponent(address)}`,
          { headers: req.headers }
        );
        
        if (civicResponse.ok) {
          const civicData = await civicResponse.json();
          if (!civicData.fallback && civicData.data && civicData.data.length > 0) {
            politicians.push(...civicData.data);
            // If Google Civic found representatives, we can return early as this is most accurate
            return res.status(200).json({
              data: politicians,
              district: civicData.district,
              count: politicians.length,
              fallback: false,
              location: { address },
              sources: ['google-civic'],
              errors: errors.length > 0 ? errors : undefined
            });
          }
        }
      } catch (error) {
        errors.push({ source: 'google-civic', error: error.message });
      }
    }

    // Step 2: Fallback to Congress.gov API for state-level lookup
    try {
      const stateCode = state || extractStateFromAddress(address);
      if (stateCode) {
        const baseUrl = req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'] 
          ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
          : process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000';
          
        const congressResponse = await fetch(
          `${baseUrl}/api/politicians/congress?state=${stateCode}`,
          { headers: req.headers }
        );
        
        if (congressResponse.ok) {
          const congressData = await congressResponse.json();
          if (!congressData.fallback && congressData.data) {
            politicians.push(...congressData.data);
          }
        }
      }
    } catch (error) {
      errors.push({ source: 'congress.gov', error: error.message });
    }

    // Step 3: TODO - Add state/local politicians from OpenStates
    // Step 4: TODO - Add governors, mayors from other APIs

    // If we have no politicians and no real APIs worked, signal fallback needed
    if (politicians.length === 0) {
      return res.status(200).json({
        data: [],
        fallback: true,
        errors,
        message: 'No API data available, fallback to static data recommended'
      });
    }

    // Success - return combined politician data
    res.status(200).json({
      data: politicians,
      count: politicians.length,
      fallback: false,
      location: { state, address, zip },
      sources: politicians.length > 0 ? ['congress.gov'] : [],
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('By-location API error:', error);
    res.status(500).json({
      error: error.message,
      fallback: true
    });
  }
}

// Helper function to extract state code from address
function extractStateFromAddress(address) {
  if (!address) return null;
  
  const addressLower = address.toLowerCase();
  
  // State name to abbreviation mapping
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
    if (addressLower.includes(stateName)) {
      return stateCode;
    }
  }
  
  // Then look for state abbreviations (2-letter codes at word boundaries)
  const stateAbbreviations = Object.values(stateMap);
  const stateRegex = new RegExp(`\\b(${stateAbbreviations.join('|')})\\b`, 'i');
  const match = address.match(stateRegex);
  if (match) {
    return match[1].toUpperCase();
  }
  
  return null;
}