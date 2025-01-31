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