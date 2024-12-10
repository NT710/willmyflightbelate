const Redis = require('ioredis');

// Create a Redis client instance
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1', // Default to localhost
  port: process.env.REDIS_PORT || 6379, // Default Redis port
  password: process.env.REDIS_PASSWORD || null, // Add if using Redis with authentication
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redis;
