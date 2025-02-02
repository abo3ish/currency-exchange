import { createClient } from "redis";
import dotenv from 'dotenv';
dotenv.config();
export const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

// Connect to redis
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