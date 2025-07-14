// Error handler for api.data.gov standardized errors

export class ApiError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function handleApiResponse(response, responseData) {
  // Handle successful responses with rate limit headers
  if (response.ok) {
    const rateLimitInfo = {
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      resetTime: response.headers.get('X-RateLimit-Reset')
    };
    
    return { data: responseData, rateLimitInfo };
  }
  
  // Handle api.data.gov standard errors
  const errorCode = responseData?.error?.code;
  const errorMessage = responseData?.error?.message || 'Unknown API error';
  
  switch (response.status) {
    case 400:
      if (errorCode === 'HTTPS_REQUIRED') {
        throw new ApiError('HTTPS_REQUIRED', 'API requests must be made over HTTPS', 400);
      }
      throw new ApiError('BAD_REQUEST', errorMessage, 400);
      
    case 403:
      switch (errorCode) {
        case 'API_KEY_MISSING':
          throw new ApiError('API_KEY_MISSING', 'API key was not supplied. Get one at https://api.data.gov', 403);
        case 'API_KEY_INVALID':
          throw new ApiError('API_KEY_INVALID', 'Invalid API key supplied. Check your key or signup for a new one', 403);
        case 'API_KEY_DISABLED':
          throw new ApiError('API_KEY_DISABLED', 'API key has been disabled by administrator', 403);
        case 'API_KEY_UNAUTHORIZED':
          throw new ApiError('API_KEY_UNAUTHORIZED', 'API key not authorized for this service', 403);
        case 'API_KEY_UNVERIFIED':
          throw new ApiError('API_KEY_UNVERIFIED', 'API key not verified. Check your email', 403);
        default:
          throw new ApiError('FORBIDDEN', errorMessage, 403);
      }
      
    case 404:
      throw new ApiError('NOT_FOUND', 'API endpoint not found. Check your URL', 404);
      
    case 429:
      const retryAfter = response.headers.get('Retry-After') || '3600'; // Default to 1 hour
      throw new ApiError('OVER_RATE_LIMIT', `Rate limit exceeded. Try again in ${retryAfter} seconds`, 429);
      
    case 500:
    case 502:
    case 503:
    case 504:
      throw new ApiError('SERVER_ERROR', 'API server error. Please try again later', response.status);
      
    default:
      throw new ApiError('UNKNOWN_ERROR', errorMessage, response.status);
  }
}

export function isRetryableError(error) {
  // Determine if an error is worth retrying
  if (error instanceof ApiError) {
    return ['SERVER_ERROR', 'OVER_RATE_LIMIT'].includes(error.code);
  }
  return false;
}

export function getRetryDelay(error, attempt = 1) {
  // Exponential backoff for retryable errors
  if (error.code === 'OVER_RATE_LIMIT') {
    return 60 * 60 * 1000; // 1 hour for rate limit
  }
  
  if (error.code === 'SERVER_ERROR') {
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
  }
  
  return 1000; // Default 1 second
}