// Simple in-memory cache implementation
class CacheService {
  constructor() {
    this.cache = new Map();
  }

  async get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key, value, ttlSeconds = 300) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }
}

module.exports = CacheService;
