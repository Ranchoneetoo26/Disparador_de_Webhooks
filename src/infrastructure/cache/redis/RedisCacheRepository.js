export default class RedisCacheRepository {

    async get(key) {
        console.log(`[Cache] GET ${key}`);
        return null; 
    }

    async set(key, value, options = {}) {
        const { ttl } = options;
        console.log(`[Cache] SET ${key} (TTL: ${ttl})`);
        return true; 
    }

}