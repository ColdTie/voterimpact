// Congress.gov API integration for representatives and senators
import { handleApiResponse, isRetryableError, getRetryDelay } from '../../src/services/ApiErrorHandler.js';
import RateLimitService from '../../src/services/RateLimitService.js';

const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

// In-memory cache with 30-minute expiration (following ProPublica pattern)
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { state, chamber } = req.query;
    const apiKey = process.env.REACT_APP_CONGRESS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Congress API key not configured',
        fallback: true 
      });
    }

    // Check rate limits before making request
    const rateLimitCheck = RateLimitService.canMakeRequest(apiKey);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        error: rateLimitCheck.reason,
        fallback: true,
        rateLimitExceeded: true
      });
    }

    // Create cache key
    const cacheKey = `congress-${state || 'all'}-${chamber || 'all'}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.status(200).json({
        data: cached.data,
        cached: true,
        source: 'congress.gov'
      });
    }

    // Build API URL (without api_key in URL for security)
    let apiUrl = `${CONGRESS_API_BASE}/member?limit=250&currentMember=true`;
    
    if (state) {
      apiUrl += `&state=${state.toUpperCase()}`;
    }

    // Use proper api.data.gov authentication via X-Api-Key header
    const response = await fetch(apiUrl, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });
    
    // Record the API request for rate limiting
    RateLimitService.recordRequest(apiKey);
    
    const responseData = await response.json();
    const { data, rateLimitInfo } = handleApiResponse(response, responseData);
    
    // Transform Congress.gov data to our format
    const politicians = data.members?.map(member => ({
      id: member.bioguideId,
      name: member.name,
      first_name: member.firstName,
      last_name: member.lastName,
      party: member.partyName,
      state: member.state,
      district: member.district,
      chamber: member.chamber,
      title: member.chamber === 'House' ? 'Representative' : 'Senator',
      office: member.chamber === 'House' ? 'U.S. House' : 'U.S. Senate',
      phone: member.phone || '',
      email: member.email || '',
      website: member.officialWebsiteUrl || '',
      photo_url: member.depiction?.imageUrl || `https://www.congress.gov/img/member/${member.bioguideId?.toLowerCase()}.jpg`,
      voting_record: {
        progressive_percentage: null, // Will be enhanced by AI later
        bipartisan_percentage: null,
        total_votes: null
      },
      terms: member.terms || [],
      source: 'congress.gov',
      last_updated: new Date().toISOString()
    })) || [];

    // Cache the result
    cache.set(cacheKey, {
      data: politicians,
      timestamp: Date.now()
    });

    // Clean old cache entries (simple cleanup)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    res.status(200).json({
      data: politicians,
      count: politicians.length,
      cached: false,
      source: 'congress.gov'
    });

  } catch (error) {
    console.error('Congress API error:', error);
    
    // Return error with fallback flag
    res.status(500).json({
      error: error.message,
      fallback: true,
      source: 'congress.gov'
    });
  }
}