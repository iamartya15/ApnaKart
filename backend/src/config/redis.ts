import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => {
  console.warn('Redis Client Connection Error, caching might not be active:', err);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Redis successfully connected.');
  } catch (error) {
    console.warn('Redis failed to connect. Running backend with cache-bypass settings.', error);
  }
};
