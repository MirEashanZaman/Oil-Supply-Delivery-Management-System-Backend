import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;
  private readonly redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  private inMemoryCache: Map<string, { value: string; expiresAt: number | null }> = new Map();

  async onModuleInit() {
    await this.initRedis();
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
    }
  }

  private async initRedis() {
    try {
      this.logger.log(`Connecting to Redis at: ${this.redisUrl}...`);
      this.client = new Redis(this.redisUrl, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('[Redis] Connected to Redis server successfully.');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
      });

      await this.client.connect();
      this.isConnected = true;
    } catch (err: any) {
      this.isConnected = false;
      this.logger.warn(
        `[Redis] Redis server offline (${err.message || 'connection refused'}). Using In-Memory RAM Cache Fallback mode.`
      );
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);

    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.set(key, stringVal, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, stringVal);
        }
        return true;
      } catch (err: any) {
        this.logger.warn(`[Redis Set Error] ${err.message}. Falling back to memory.`);
      }
    }

    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.inMemoryCache.set(key, { value: stringVal, expiresAt });
    return true;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.get(key);
        if (raw !== null) {
          try {
            return JSON.parse(raw) as T;
          } catch {
            return raw as unknown as T;
          }
        }
      } catch (err: any) {
        this.logger.warn(`[Redis Get Error] ${err.message}. Falling back to memory.`);
      }
    }

    const item = this.inMemoryCache.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.inMemoryCache.delete(key);
      return null;
    }

    try {
      return JSON.parse(item.value) as T;
    } catch {
      return item.value as unknown as T;
    }
  }

  async del(key: string): Promise<boolean> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch {}
    }
    this.inMemoryCache.delete(key);
    return true;
  }

  async incr(key: string, ttlSeconds: number = 60): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        const count = await this.client.incr(key);
        if (count === 1) {
          await this.client.expire(key, ttlSeconds);
        }
        return count;
      } catch {}
    }

    const item = this.inMemoryCache.get(key);
    let count = 1;
    if (item && (!item.expiresAt || Date.now() <= item.expiresAt)) {
      count = (parseInt(item.value, 10) || 0) + 1;
    }
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.inMemoryCache.set(key, { value: String(count), expiresAt });
    return count;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      redisUrl: this.redisUrl,
      mode: this.isConnected ? 'Redis Server Engine' : 'In-Memory RAM Cache Fallback',
      memoryKeysCount: this.inMemoryCache.size,
    };
  }
}
