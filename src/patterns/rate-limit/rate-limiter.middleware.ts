import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ClientBucket {
  tokens: number;
  lastRefill: number;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  // Configurable window and capacity
  private static defaultWindowMs: number = 60 * 1000; // 1 minute
  private static defaultMaxRequests: number = 120; // 120 requests per minute per IP
  private static authMaxRequests: number = 25; // 25 attempts per minute for auth/login

  private static buckets: Map<string, ClientBucket> = new Map();

  use(req: Request, res: Response, next: NextFunction): void {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const path = req.originalUrl || req.url || '';
    const isAuthRoute =
      path.includes('/login') ||
      path.includes('/auth') ||
      path.includes('/signin') ||
      path.includes('/signup');

    const maxRequests = isAuthRoute
      ? RateLimiterMiddleware.authMaxRequests
      : RateLimiterMiddleware.defaultMaxRequests;
    const windowMs = RateLimiterMiddleware.defaultWindowMs;

    const key = `${clientIp}:${isAuthRoute ? 'auth' : 'general'}`;
    const now = Date.now();

    let bucket = RateLimiterMiddleware.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: maxRequests, lastRefill: now };
      RateLimiterMiddleware.buckets.set(key, bucket);
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;
    if (timePassed > 0) {
      const tokensToAdd = (timePassed / windowMs) * maxRequests;
      bucket.tokens = Math.min(maxRequests, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }

    // Rate Limit Headers
    const remaining = Math.max(0, Math.floor(bucket.tokens));
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining - 1));
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return next();
    }

    const retryAfterSec = Math.max(1, Math.ceil(((1 - bucket.tokens) * (windowMs / maxRequests)) / 1000));
    res.setHeader('Retry-After', retryAfterSec);

    res.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${maxRequests} requests per minute allowed. Please wait ${retryAfterSec} seconds before retrying.`,
      retryAfter: retryAfterSec,
    });
  }

  public static getRateLimitStatus() {
    return {
      activeTrackedIps: RateLimiterMiddleware.buckets.size,
      windowSeconds: RateLimiterMiddleware.defaultWindowMs / 1000,
      generalLimit: RateLimiterMiddleware.defaultMaxRequests,
      authLimit: RateLimiterMiddleware.authMaxRequests,
    };
  }
}
