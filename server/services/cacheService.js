const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    try {
      await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        ttlSeconds
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
}

module.exports = CacheService;
