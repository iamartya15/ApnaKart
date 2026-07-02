import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

// Map fallback if Redis is down
const memoryCache = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (limit: number = 100, windowSec: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${req.originalUrl}:${ip}`;
    const now = Math.floor(Date.now() / 1000);

    if (redisClient.isOpen) {
      try {
        const count = await redisClient.incr(key);
        if (count === 1) {
          await redisClient.expire(key, windowSec);
        }

        const ttl = await redisClient.ttl(key);

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));
        res.setHeader('X-RateLimit-Reset', now + ttl);

        if (count > limit) {
          res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
          });
          return;
        }
        next();
      } catch (error) {
        console.warn('Redis ratelimit failed, bypassing to memory fallback.', error);
        fallbackLimiter(ip, limit, windowSec, res, next);
      }
    } else {
      fallbackLimiter(ip, limit, windowSec, res, next);
    }
  };
};

const fallbackLimiter = (
  ip: string,
  limit: number,
  windowSec: number,
  res: Response,
  next: NextFunction,
) => {
  const now = Date.now();
  const data = memoryCache.get(ip);

  if (!data || now > data.resetTime) {
    memoryCache.set(ip, { count: 1, resetTime: now + windowSec * 1000 });
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - 1);
    res.setHeader('X-RateLimit-Reset', Math.floor((now + windowSec * 1000) / 1000));
    next();
  } else {
    data.count += 1;
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - data.count));
    res.setHeader('X-RateLimit-Reset', Math.floor(data.resetTime / 1000));

    if (data.count > limit) {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
      return;
    }
    next();
  }
};
export default rateLimiter;
