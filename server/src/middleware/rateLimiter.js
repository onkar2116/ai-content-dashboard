const rateLimit = require('express-rate-limit')

// General API rate limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
})

// Auth rate limit: 10 requests per 15 minutes (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait 15 minutes and try again.' },
})

// Analyze rate limit: 20 requests per 15 minutes (expensive AI calls)
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Analysis rate limit reached. Please wait a few minutes before trying again.' },
})

module.exports = { generalLimiter, authLimiter, analyzeLimiter }
