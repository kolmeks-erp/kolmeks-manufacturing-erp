const rateMap = new Map();

// Clean up stale rate limit entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateMap.entries()) {
    if (now > record.resetTime) {
      rateMap.delete(ip);
    }
  }
}, 15 * 60 * 1000);

/**
 * Rate Limiter Middleware for public endpoints (e.g., RFQ submissions)
 * Allows max 5 requests per 15-minute window per IP.
 */
const rfqRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxLimit = 5;

  const record = rateMap.get(ip);

  if (!record) {
    rateMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return next();
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }

  if (record.count >= maxLimit) {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many quote requests submitted from your connection. Please wait 15 minutes before submitting another request.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  }

  record.count += 1;
  next();
};

module.exports = {
  rfqRateLimiter,
};
