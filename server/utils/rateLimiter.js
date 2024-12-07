const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const createLimiter = () => {
  const redis = new Redis(process.env.REDIS_URL);

  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
  });
};

// Create specific limiter for Weatherstack API (250 calls/month free tier)
const createWeatherstackLimiter = () => {
  const redis = new Redis(process.env.REDIS_URL);

  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    max: 240, // Leave small buffer for errors
    message: 'Monthly API limit reached, please try again next month.'
  });
};

module.exports = { createLimiter, createWeatherstackLimiter };
