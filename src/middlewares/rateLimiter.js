const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes)
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipFailedRequests: true, // Skip rate limiting for failed requests
  skipSuccessfulRequests: false, // Apply rate limiting to successful requests

  keyGenerator: (req) => {
    // Use the IP address as the key for rate limiting
    console.log(`Rate limit check for IP: ${req.ip}`);
    return req.ip;
  },
  skip: (req, res) => {
    // Skip rate limiting for health check endpoints
    if (req.path === "/health" || req.path === "/status") {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    // Custom response for rate limit exceeded
    res.status(429).json({
      status: "error",
      message: "Too many requests, please wait and  try again later.",
    });
  },

 


});

module.exports = rateLimiter;
