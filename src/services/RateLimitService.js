// Rate limiting service for api.data.gov APIs
// Official limits: 1,000 requests per hour, DEMO_KEY: 30/hour, 50/day

class RateLimitService {
  constructor() {
    this.requestCounts = new Map();
    this.HOURLY_LIMIT = 1000; // Default for api.data.gov
    this.DEMO_KEY_HOURLY_LIMIT = 30;
    this.DEMO_KEY_DAILY_LIMIT = 50;
  }

  canMakeRequest(apiKey) {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);
    
    // Initialize tracking if not exists
    if (!this.requestCounts.has(apiKey)) {
      this.requestCounts.set(apiKey, []);
    }
    
    const requests = this.requestCounts.get(apiKey);
    
    // Clean old requests (older than 24 hours)
    const recentRequests = requests.filter(timestamp => timestamp > dayAgo);
    this.requestCounts.set(apiKey, recentRequests);
    
    // Count requests in last hour
    const hourlyRequests = recentRequests.filter(timestamp => timestamp > hourAgo);
    
    // Check limits based on key type
    const isDemoKey = apiKey === 'DEMO_KEY';
    
    if (isDemoKey) {
      // DEMO_KEY limits: 30/hour, 50/day
      if (hourlyRequests.length >= this.DEMO_KEY_HOURLY_LIMIT) {
        return { allowed: false, reason: 'DEMO_KEY hourly limit exceeded (30/hour)' };
      }
      if (recentRequests.length >= this.DEMO_KEY_DAILY_LIMIT) {
        return { allowed: false, reason: 'DEMO_KEY daily limit exceeded (50/day)' };
      }
    } else {
      // Regular API key: 1,000/hour
      if (hourlyRequests.length >= this.HOURLY_LIMIT) {
        return { allowed: false, reason: 'Hourly limit exceeded (1,000/hour)' };
      }
    }
    
    return { allowed: true };
  }
  
  recordRequest(apiKey) {
    const requests = this.requestCounts.get(apiKey) || [];
    requests.push(Date.now());
    this.requestCounts.set(apiKey, requests);
  }
  
  getRemainingRequests(apiKey) {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);
    
    if (!this.requestCounts.has(apiKey)) {
      const isDemoKey = apiKey === 'DEMO_KEY';
      return {
        hourlyRemaining: isDemoKey ? this.DEMO_KEY_HOURLY_LIMIT : this.HOURLY_LIMIT,
        dailyRemaining: isDemoKey ? this.DEMO_KEY_DAILY_LIMIT : null
      };
    }
    
    const requests = this.requestCounts.get(apiKey);
    const hourlyRequests = requests.filter(timestamp => timestamp > hourAgo);
    const dailyRequests = requests.filter(timestamp => timestamp > dayAgo);
    
    const isDemoKey = apiKey === 'DEMO_KEY';
    
    return {
      hourlyRemaining: (isDemoKey ? this.DEMO_KEY_HOURLY_LIMIT : this.HOURLY_LIMIT) - hourlyRequests.length,
      dailyRemaining: isDemoKey ? this.DEMO_KEY_DAILY_LIMIT - dailyRequests.length : null
    };
  }
}

export default new RateLimitService();