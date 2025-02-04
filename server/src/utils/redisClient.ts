import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();
export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

(async () => {
  await redisClient.connect();
})();

redisClient.on('error', (error) => {
  console.error('Redis Client Error:', error);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

export const getCachedData = async (cacheKey: string) => {
  return await redisClient.get(cacheKey);
};

export const setCachedData = async (cacheKey: string, data: any, ttl: number) => {
  return await redisClient.setEx(cacheKey, ttl, JSON.stringify(data));
};

export const batchGetCachedData = async (cacheKeys: string[]) => {
  console.time('redis-batch-get');
  const pipeline = redisClient.multi();
  cacheKeys.forEach(key => pipeline.get(key));
    
  try {
    const results = await pipeline.exec();
    console.timeEnd('redis-batch-get');
    return results.map((result, index) => ({
      key: cacheKeys[index],
      value: result && typeof result === 'string' ? JSON.parse(result) : null,
    }));
  } catch (error) {
    console.error('Redis Pipeline Error:', error);
    throw error;
  }
};

export const batchSetCachedData = async (items: Array<{ key: string; data: any; ttl: number }>) => {
  console.time(`redis-batch-set-${items.length}`);
  const pipeline = redisClient.multi();
    
  items.forEach(({ key, data, ttl }) => {
    pipeline.setEx(key, ttl, JSON.stringify(data));
  });
    
  try {
    await pipeline.exec();
    console.timeEnd(`redis-batch-set-${items.length}`);
  } catch (error) {
    console.error('Redis Pipeline Error:', error);
    throw error;
  }
};

export const clearCache = async () => {
  console.time('redis-clear-all');
  try {
    await redisClient.flushDb();
    console.log('Cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw error;
  } finally {
    console.timeEnd('redis-clear-all');
  }
};

// Optional: Clear specific pattern
// exchange_rates_usd_*'
// exchange_rates_*_2023-11*
export const clearCachePattern = async (pattern: string) => {
  console.time('redis-clear-pattern');
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error(`Failed to clear cache pattern ${pattern}:`, error);
    throw error;
  } finally {
    console.timeEnd('redis-clear-pattern');
  }
};