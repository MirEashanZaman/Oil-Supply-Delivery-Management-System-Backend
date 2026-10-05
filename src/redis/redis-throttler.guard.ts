import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from './redis.service';

export const RATE_LIMIT_KEY = 'rate_limit_options';

export interface RateLimitOptions {
  limit: number;
  ttlSeconds: number;
  keyPrefix?: string;
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RedisThrottlerGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Default rate limit: 10 requests per 60s for guarded endpoints
    const limit = options?.limit ?? 10;
    const ttl = options?.ttlSeconds ?? 60;
    const prefix = options?.keyPrefix ?? 'rate_limit';

    const req = context.switchToHttp().getRequest();
    const clientIp =
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    // Granular key combining route, IP, and optional user email
    const route = req.path || req.url;
    const identifier = req.body?.email || req.body?.userName || clientIp;
    const rateLimitKey = `${prefix}:${route}:${identifier}`;

    const currentCount = await this.redisService.incr(rateLimitKey, ttl);

    if (currentCount > limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Security Protection: Rate limit exceeded (${currentCount}/${limit}). Try again in ${ttl} seconds.`,
          retryAfter: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
