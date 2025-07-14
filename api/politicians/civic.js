// Google Civic Information API integration for precise district lookup
// This API provides accurate congressional district and representative information by address

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    const apiKey = process.env.GOOGLE_CIVIC_API_KEY;

    if (!address) {
      return res.status(400).json({ 
        error: 'Address parameter required' 
      });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Google Civic API key not configured',
        fallback: true 
      });
    }

    // Build Google Civic Information API URL
    const baseUrl = 'https://www.googleapis.com/civicinfo/v2/representatives';
    const params = new URLSearchParams({
      key: apiKey,
      address: address,
      levels: 'federal',
      roles: 'legislatorUpperBody,legislatorLowerBody'
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Civic API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Google Civic data to our format
    const politicians = [];
    
    if (data.officials && data.offices) {
      for (const office of data.offices) {
        if (office.name.includes('Senate') || office.name.includes('House')) {
          for (const officialIndex of office.officialIndices || []) {
            const official = data.officials[officialIndex];
            if (official) {
              politicians.push({
                id: `civic-${officialIndex}`,
                name: official.name,
                title: office.name.includes('Senate') ? 'Senator' : 'Representative',
                party: official.party || 'Unknown',
                office: office.name,
                phone: official.phones?.[0] || '',
                email: official.emails?.[0] || '',
                website: official.urls?.[0] || '',
                photo_url: official.photoUrl || null,
                address: official.address?.[0] ? 
                  `${official.address[0].line1 || ''} ${official.address[0].city || ''}, ${official.address[0].state || ''} ${official.address[0].zip || ''}`.trim() : '',
                source: 'google-civic',
                last_updated: new Date().toISOString()
              });
            }
          }
        }
      }
    }

    // Also include district information if available
    let district = null;
    if (data.divisions) {
      for (const [divisionId, division] of Object.entries(data.divisions)) {
        if (divisionId.includes('/cd:')) {
          const districtMatch = divisionId.match(/cd:(\d+)/);
          if (districtMatch) {
            district = {
              number: parseInt(districtMatch[1]),
              name: division.name || `District ${districtMatch[1]}`,
              id: divisionId
            };
          }
        }
      }
    }

    res.status(200).json({
      data: politicians,
      district: district,
      count: politicians.length,
      source: 'google-civic',
      address: address
    });

  } catch (error) {
    console.error('Google Civic API error:', error);
    
    res.status(500).json({
      error: error.message,
      fallback: true,
      source: 'google-civic'
    });
  }
}