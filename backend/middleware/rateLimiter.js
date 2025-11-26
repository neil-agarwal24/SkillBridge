/**
 * Rate limiting middleware for AI endpoints
 * Prevents abuse and protects Gemini API quota
 */

// Store request counts by IP
const requestCounts = new Map();

// Store request counts by user ID for translation preview
const userRequestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.resetTime > 60000) {
      requestCounts.delete(ip);
    }
  }
  for (const [userId, data] of userRequestCounts.entries()) {
    if (now - data.resetTime > 60000) {
      userRequestCounts.delete(userId);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit AI requests
 * @param {number} maxRequests - Max requests per window (default: 30)
 * @param {number} windowMs - Time window in ms (default: 60000 = 1 minute)
 */
function rateLimitAI(maxRequests = 30, windowMs = 60000) {
  return (req, res, next) => {
    // Get client IP
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Whitelist localhost for development
    if (ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost')) {
      return next();
    }

    const now = Date.now();
    
    // Get or create rate limit data for this IP
    let rateLimitData = requestCounts.get(ip);
    
    if (!rateLimitData) {
      rateLimitData = {
        count: 0,
        resetTime: now + windowMs
      };
      requestCounts.set(ip, rateLimitData);
    }

    // Reset if window has passed
    if (now > rateLimitData.resetTime) {
      rateLimitData.count = 0;
      rateLimitData.resetTime = now + windowMs;
    }

    // Increment request count
    rateLimitData.count++;

    // Check if limit exceeded
    if (rateLimitData.count > maxRequests) {
      const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
      
      console.warn(`[Rate Limit] IP ${ip} exceeded limit: ${rateLimitData.count}/${maxRequests}`);
      
      return res.status(429).json({
        success: false,
        message: 'Too many AI requests. Please try again later.',
        retryAfter
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - rateLimitData.count);
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString());

    next();
  };
}

/**
 * Get rate limit stats (for monitoring)
 */
function getRateLimitStats() {
  const stats = {
    totalIPs: requestCounts.size,
    topRequesters: []
  };

  // Get top 10 requesters
  const sorted = Array.from(requestCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  stats.topRequesters = sorted.map(([ip, data]) => ({
    ip,
    count: data.count,
    resetTime: new Date(data.resetTime).toISOString()
  }));

  return stats;
}

/**
 * Rate limit translation preview requests (more lenient for typing)
 * Uses both per-IP and per-user limits
 */
function rateLimitTranslationPreview(req, res, next) {
  const maxRequests = 60; // 60 requests per minute
  const windowMs = 60000; // 1 minute
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = req.user?.id || req.body?.senderId;
  const now = Date.now();

  // Whitelist localhost for development
  if (ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost')) {
    return next();
  }

  // Check IP-based rate limit
  let ipData = requestCounts.get(ip);
  if (!ipData) {
    ipData = { count: 0, resetTime: now + windowMs };
    requestCounts.set(ip, ipData);
  }
  if (now > ipData.resetTime) {
    ipData.count = 0;
    ipData.resetTime = now + windowMs;
  }
  ipData.count++;

  if (ipData.count > maxRequests) {
    const retryAfter = Math.ceil((ipData.resetTime - now) / 1000);
    return res.status(429).json({
      success: false,
      message: 'Too many translation requests from this IP. Please slow down.',
      retryAfter
    });
  }

  // Check user-based rate limit (if authenticated)
  if (userId) {
    let userData = userRequestCounts.get(userId);
    if (!userData) {
      userData = { count: 0, resetTime: now + windowMs };
      userRequestCounts.set(userId, userData);
    }
    if (now > userData.resetTime) {
      userData.count = 0;
      userData.resetTime = now + windowMs;
    }
    userData.count++;

    if (userData.count > maxRequests) {
      const retryAfter = Math.ceil((userData.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: 'Too many translation requests. Please slow down your typing.',
        retryAfter
      });
    }
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - ipData.count);
  res.setHeader('X-RateLimit-Reset', new Date(ipData.resetTime).toISOString());

  next();
}

module.exports = {
  rateLimitAI,
  rateLimitTranslationPreview,
  getRateLimitStats
};
