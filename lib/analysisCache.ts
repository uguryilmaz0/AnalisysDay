/**
 * Analysis Cache Manager
 * Firebase read'leri azaltmak için in-memory cache sistemi
 */

import { DailyAnalysis } from '@/types';
import { AnalysisStats } from '@/lib/db';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest {
  promise: Promise<unknown>;
  timestamp: number;
}

class AnalysisCacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map(); // Request deduplication
  
  private DEFAULT_TTL = 5 * 60 * 1000; // 5 dakika
  private STATS_TTL = 10 * 60 * 1000; // İstatistikler 10 dakika
  private USER_DATA_TTL = 15 * 60 * 1000; // User data 15 dakika
  private MAX_CACHE_SIZE = 100; // Max 100 entry (memory leak protection)
  private MAX_PENDING_AGE = 30 * 1000; // Pending request max 30 saniye

  /**
   * Cache'e veri ekle (LRU eviction ile)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.DEFAULT_TTL);
    
    // Max size kontrolü - en eski entry'leri temizle
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * En eski cache entry'lerini temizle (LRU)
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // En eski %20'sini temizle
    const toRemove = Math.ceil(this.cache.size * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.log(`🧹 Cache eviction: Removed ${toRemove} oldest entries`);
  }

  /**
   * Cache'den veri al
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Süre dolmuş mu kontrol et
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Belirli bir key'i temizle
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Tüm cache'i temizle
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Pattern'e göre cache temizle (örn: "analysis:*")
   */
  clearByPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Süresi dolan cache'leri temizle
   */
  cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // Eski pending request'leri de temizle
    this.cleanPendingRequests();
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Eski pending request'leri temizle
   */
  private cleanPendingRequests(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.pendingRequests.forEach((pending, key) => {
      if (now - pending.timestamp > this.MAX_PENDING_AGE) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.pendingRequests.delete(key));
  }

  /**
   * Request deduplication - aynı anda aynı veriyi birden fazla kez çekmeyi önler
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 1. Cache'den kontrol et
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    // 2. Pending request var mı kontrol et
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`⏳ Waiting for pending request: ${key}`);
      return pending.promise as Promise<T>;
    }

    // 3. Yeni request başlat
    console.log(`🔥 Fetching fresh data: ${key}`);
    const promise = fetchFn()
      .then((data) => {
        // Başarılı - cache'e kaydet ve pending'i temizle
        this.set(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        // Hata - pending'i temizle ve hatayı fırlat
        this.pendingRequests.delete(key);
        throw error;
      });

    // Pending olarak kaydet
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Cache istatistikleri - monitoring ve health check için
   */
  getCacheStats(): {
    size: number;
    keys: string[];
    validEntries: number;
    expiredEntries: number;
    pendingRequests: number;
    maxSize: number;
    utilizationPercent: number;
    estimatedSizeKB: number;
  } {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    let totalSize = 0;
    
    this.cache.forEach((entry) => {
      if (now <= entry.expiresAt) {
        validCount++;
      } else {
        expiredCount++;
      }
      // Rough size estimation
      try {
        totalSize += JSON.stringify(entry.data).length;
      } catch {
        // Skip if stringify fails
      }
    });
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      validEntries: validCount,
      expiredEntries: expiredCount,
      pendingRequests: this.pendingRequests.size,
      maxSize: this.MAX_CACHE_SIZE,
      utilizationPercent: Math.round((this.cache.size / this.MAX_CACHE_SIZE) * 100),
      estimatedSizeKB: Math.round(totalSize / 1024),
    };
  }

  // === Özel Cache Metodları ===

  /**
   * Analizleri cache'le
   */
  setAnalyses(analyses: DailyAnalysis[], type: 'all' | 'daily' | 'ai' = 'all'): void {
    this.set(`analyses:${type}`, analyses, this.DEFAULT_TTL);
  }

  /**
   * Cache'den analizleri al
   */
  getAnalyses(type: 'all' | 'daily' | 'ai' = 'all'): DailyAnalysis[] | null {
    return this.get<DailyAnalysis[]>(`analyses:${type}`);
  }

  /**
   * İstatistikleri cache'le
   */
  setStats(stats: AnalysisStats): void {
    this.set('stats:analysis', stats, this.STATS_TTL);
  }

  /**
   * Cache'den istatistikleri al
   */
  getStats(): AnalysisStats | null {
    return this.get<AnalysisStats>('stats:analysis');
  }

  /**
   * User data cache'le
   */
  setUserData(uid: string, data: unknown): void {
    this.set(`user:${uid}`, data, this.USER_DATA_TTL);
  }

  /**
   * User data cache'den al
   */
  getUserData(uid: string): unknown | null {
    return this.get(`user:${uid}`);
  }

  /**
   * Analiz değiştiğinde ilgili cache'leri temizle
   */
  invalidateAnalysisCache(): void {
    this.clearByPattern('analyses:*');
    this.clearByPattern('stats:*');
  }
}

// Singleton instance
export const analysisCache = new AnalysisCacheManager();

// Auto cleanup her 10 dakikada bir
if (typeof window !== 'undefined') {
  setInterval(() => {
    analysisCache.cleanExpired();
  }, 10 * 60 * 1000);
}
