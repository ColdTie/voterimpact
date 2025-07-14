// Congress.gov API integration for federal legislation
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

// Cache with 4-hour expiration for legislation (updated 6x daily)
const cache = new Map();
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { congress = '118', type = 'all', limit = '50' } = req.query;
    const apiKey = process.env.REACT_APP_CONGRESS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Congress API key not configured',
        fallback: true 
      });
    }

    // Create cache key
    const cacheKey = `congress-bills-${congress}-${type}-${limit}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.status(200).json({
        data: cached.data,
        cached: true,
        source: 'congress.gov'
      });
    }

    // Build API URL - get recent bills from current congress  
    let apiUrl = `${CONGRESS_API_BASE}/bill/${congress}?limit=${limit}&sort=updateDate+desc`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Congress API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Congress.gov bills to our format
    const bills = await Promise.all(
      (data.bills || []).map(async (bill) => {
        try {
          // Get additional bill details
          const detailResponse = await fetch(
            `${CONGRESS_API_BASE}/bill/${congress}/${bill.type}/${bill.number}`,
            {
              headers: {
                'X-Api-Key': apiKey,
                'Accept': 'application/json'
              }
            }
          );
          
          let detailData = {};
          if (detailResponse.ok) {
            const details = await detailResponse.json();
            detailData = details.bill || {};
          }

          return {
            id: `${bill.type}${bill.number}-${congress}`,
            title: bill.title || `${bill.type} ${bill.number}`,
            status: determineStatus(bill.latestAction, detailData),
            category: categorizeBySubject(detailData.subjects || []),
            scope: 'Federal',
            description: detailData.summary?.text || bill.title || 'No description available',
            sponsor: transformSponsor(detailData.sponsors?.[0]),
            cosponsors: (detailData.cosponsors || []).slice(0, 3).map(transformSponsor),
            congress: congress,
            billType: bill.type,
            billNumber: bill.number,
            introducedDate: bill.introducedDate,
            lastAction: bill.latestAction?.text || 'No recent action',
            lastActionDate: bill.latestAction?.actionDate,
            url: bill.url,
            source: 'congress.gov',
            last_updated: new Date().toISOString(),
            // Placeholder values for personal impact (will be filled by AI)
            personalImpact: null,
            financialEffect: null,
            timeline: null,
            confidence: null,
            isBenefit: null,
            votingRecord: {
              committee: null,
              floor: null
            }
          };
        } catch (error) {
          console.error(`Error processing bill ${bill.type}${bill.number}:`, error);
          return null;
        }
      })
    );

    // Filter out failed bill transformations
    const validBills = bills.filter(bill => bill !== null);

    // Cache the result
    cache.set(cacheKey, {
      data: validBills,
      timestamp: Date.now()
    });

    res.status(200).json({
      data: validBills,
      count: validBills.length,
      cached: false,
      source: 'congress.gov',
      congress: congress
    });

  } catch (error) {
    console.error('Congress legislation API error:', error);
    
    res.status(500).json({
      error: error.message,
      fallback: true,
      source: 'congress.gov'
    });
  }
}

// Helper functions
function determineStatus(latestAction, detailData) {
  const actionText = latestAction?.text?.toLowerCase() || '';
  
  if (actionText.includes('signed by president') || actionText.includes('became public law')) {
    return 'Signed into Law';
  }
  if (actionText.includes('passed house') && actionText.includes('passed senate')) {
    return 'Passed Both Chambers';
  }
  if (actionText.includes('passed house') || actionText.includes('passed senate')) {
    return 'Passed One Chamber';
  }
  if (actionText.includes('committee')) {
    return 'In Committee';
  }
  if (actionText.includes('introduced')) {
    return 'Introduced';
  }
  
  return 'In Progress';
}

function categorizeBySubject(subjects) {
  if (!subjects || subjects.length === 0) return 'Other';
  
  const subject = subjects[0]?.name?.toLowerCase() || '';
  
  if (subject.includes('health') || subject.includes('medicare') || subject.includes('medicaid')) {
    return 'Healthcare';
  }
  if (subject.includes('housing') || subject.includes('urban')) {
    return 'Housing';
  }
  if (subject.includes('veteran') || subject.includes('military')) {
    return 'Veterans Affairs';
  }
  if (subject.includes('tax') || subject.includes('economic') || subject.includes('finance')) {
    return 'Economic';
  }
  if (subject.includes('environment') || subject.includes('climate') || subject.includes('energy')) {
    return 'Environment';
  }
  if (subject.includes('transport') || subject.includes('infrastructure')) {
    return 'Transportation';
  }
  if (subject.includes('social') || subject.includes('civil rights') || subject.includes('immigration')) {
    return 'Social Issues';
  }
  
  return 'Other';
}

function transformSponsor(sponsor) {
  if (!sponsor) return null;
  
  return {
    id: sponsor.bioguideId,
    name: sponsor.fullName || `${sponsor.firstName} ${sponsor.lastName}`,
    party: sponsor.party,
    state: sponsor.state
  };
}