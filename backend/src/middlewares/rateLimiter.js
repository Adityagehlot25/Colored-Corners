const rateLimit = require('express-rate-limit');

// 1. Auth Limiter: Prevents Brute Force and Credential Stuffing
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Checkout Limiter: Prevents DDoS and "Card Testing" Fraud
exports.checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 checkout attempts per hour
  message: { message: 'Too many checkout attempts from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Global API Limiter: Prevents scraping and general DDoS
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Allow 150 requests per 15 minutes per IP
  message: { message: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});