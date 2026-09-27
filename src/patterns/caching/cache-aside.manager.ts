export interface CacheStore<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class MemoryCacheStore<T = any> implements CacheStore<T> {
  private cache: Map<string, { value: T; expiresAt: number }> = new Map();

  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

export class CacheAsideManager<T> {
  constructor(private store: CacheStore<T>, private defaultTtlSeconds: number = 60) {}

  async getOrFetch(key: string, fetchFn: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.store.get(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fetchFn();
    await this.store.set(key, fresh, ttlSeconds || this.defaultTtlSeconds);
    return fresh;
  }

  async invalidate(key: string): Promise<void> {
    await this.store.del(key);
  }
}
