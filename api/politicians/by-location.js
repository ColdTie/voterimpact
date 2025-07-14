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

    // Step 1: Get federal representatives from Congress.gov
    try {
      const stateCode = state || extractStateFromAddress(address);
      if (stateCode) {
        const congressResponse = await fetch(
          `/api/politicians/congress?state=${stateCode}`,
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

    // Step 2: TODO - Add state/local politicians from OpenStates
    // Step 3: TODO - Add governors, mayors from other APIs

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
      sources: ['congress.gov'],
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
  
  // Simple state extraction - could be enhanced
  const stateRegex = /\b([A-Z]{2})\b/g;
  const matches = address.match(stateRegex);
  return matches ? matches[matches.length - 1] : null;
}