/**
 * Data Caching Utility
 * Provides intelligent caching for API responses to reduce server load
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number = 100;
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  constructor(maxEntries: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Check if cache is full, remove oldest entry
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove specific entry from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
const dataCache = new DataCache();

// Auto-clear expired entries every minute
setInterval(() => {
  dataCache.clearExpired();
}, 60 * 1000);

/**
 * Cache decorator for API calls
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // Try to get from cache first
  const cached = dataCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch data
  const data = await fetcher();
  
  // Cache the result
  dataCache.set(key, data, ttl);
  
  return data;
}

/**
 * Clear cache for specific key
 */
export function clearCache(key: string): void {
  dataCache.delete(key);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  dataCache.clear();
}

/**
 * Get cache keys matching pattern
 */
export function getCacheKeys(pattern: string): string[] {
  const stats = dataCache.getStats();
  return stats.keys.filter(key => key.includes(pattern));
}

/**
 * Local storage cache for persistent data
 */
export class LocalStorageCache {
  private prefix: string = 'restaurant-cache-';

  constructor(prefix: string = 'restaurant-cache-') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to cache data in localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to delete cached data:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

// Create localStorage cache instance
const localStorageCache = new LocalStorageCache();

/**
 * Cache data in localStorage
 */
export function cacheLocally<T>(key: string, data: T, ttl?: number): void {
  localStorageCache.set(key, data, ttl);
}

/**
 * Get data from localStorage cache
 */
export function getCached<T>(key: string): T | null {
  return localStorageCache.get<T>(key);
}

/**
 * Clear localStorage cache
 */
export function clearLocalCache(key?: string): void {
  if (key) {
    localStorageCache.delete(key);
  } else {
    localStorageCache.clear();
  }
}

export default dataCache;
