/**
 * Enhanced Rate Limiting
 * localStorage + future Upstash Redis support
 */

import { logger } from './logger';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitData {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
  lastAttemptIp?: string; // İleride IP tracking için
}

const CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 dakika
    blockDurationMs: 30 * 60 * 1000, // 30 dakika block
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 saat
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 saat block
  },
  support: {
    maxAttempts: 3,
    windowMs: 30 * 60 * 1000, // 30 dakika
    blockDurationMs: 60 * 60 * 1000, // 1 saat block
  },
  'password-reset': {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 saat
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 saat block
  },
};

export class EnhancedRateLimiter {
  private key: string;
  private config: RateLimitConfig;
  private action: string;

  constructor(action: keyof typeof CONFIGS) {
    this.action = action;
    this.key = `ratelimit_v2_${action}`;
    this.config = CONFIGS[action];
  }

  private getLocalData(): RateLimitData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.warn('Rate limit data parse error', { action: this.action, error });
      return null;
    }
  }

  private setLocalData(data: RateLimitData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      logger.warn('Rate limit data save error', { action: this.action, error });
    }
  }

  private clearLocalData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      logger.warn('Rate limit data clear error', { action: this.action, error });
    }
  }

  /**
   * Rate limit kontrolü yap
   */
  check(): { isBlocked: boolean; remainingTime: number; remainingAttempts: number } {
    const data = this.getLocalData();
    const now = Date.now();

    if (!data) {
      return {
        isBlocked: false,
        remainingTime: 0,
        remainingAttempts: this.config.maxAttempts,
      };
    }

    // Block kontrolü
    if (data.blockedUntil && data.blockedUntil > now) {
      const remainingTime = Math.ceil((data.blockedUntil - now) / 1000);
      
      logger.warn('Rate limit blocked', {
        action: this.action,
        remainingTime,
        attempts: data.attempts,
      });

      return {
        isBlocked: true,
        remainingTime,
        remainingAttempts: 0,
      };
    }

    // Window süresi doldu mu?
    if (now - data.firstAttempt > this.config.windowMs) {
      this.clearLocalData();
      logger.debug('Rate limit window expired', { action: this.action });
      
      return {
        isBlocked: false,
        remainingTime: 0,
        remainingAttempts: this.config.maxAttempts,
      };
    }

    // Max attempts aşıldı mı?
    if (data.attempts >= this.config.maxAttempts) {
      const blockedUntil = now + this.config.blockDurationMs;
      this.setLocalData({ ...data, blockedUntil });

      logger.warn('Rate limit exceeded', {
        action: this.action,
        attempts: data.attempts,
        maxAttempts: this.config.maxAttempts,
      });

      return {
        isBlocked: true,
        remainingTime: Math.ceil(this.config.blockDurationMs / 1000),
        remainingAttempts: 0,
      };
    }

    return {
      isBlocked: false,
      remainingTime: 0,
      remainingAttempts: this.config.maxAttempts - data.attempts,
    };
  }

  /**
   * Başarısız deneme kaydet
   */
  recordAttempt(): void {
    const data = this.getLocalData();
    const now = Date.now();

    if (!data || now - data.firstAttempt > this.config.windowMs) {
      this.setLocalData({ 
        attempts: 1, 
        firstAttempt: now,
      });
      
      logger.debug('Rate limit first attempt', { action: this.action });
    } else {
      const newAttempts = data.attempts + 1;
      this.setLocalData({ ...data, attempts: newAttempts });
      
      logger.debug('Rate limit attempt recorded', {
        action: this.action,
        attempts: newAttempts,
        remaining: this.config.maxAttempts - newAttempts,
      });
    }
  }

  /**
   * Başarılı işlem - sıfırla
   */
  reset(): void {
    this.clearLocalData();
    logger.debug('Rate limit reset', { action: this.action });
  }

  /**
   * İnsan dostu zaman formatı
   */
  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} saniye`;
    }
    
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) {
      return `${minutes} dakika`;
    }
    
    const hours = Math.ceil(minutes / 60);
    return `${hours} saat`;
  }

  /**
   * Kalan deneme sayısını al
   */
  getRemainingAttempts(): number {
    const result = this.check();
    return result.remainingAttempts;
  }

  /**
   * Bloke durumunu kontrol et ve formatlı mesaj döndür
   */
  getStatusMessage(): string | null {
    const result = this.check();
    
    if (result.isBlocked) {
      return `Çok fazla deneme yaptınız. ${this.formatTime(result.remainingTime)} sonra tekrar deneyin.`;
    }
    
    if (result.remainingAttempts < this.config.maxAttempts) {
      return `Kalan deneme hakkı: ${result.remainingAttempts}`;
    }
    
    return null;
  }
}

/**
 * Rate limit helper - Hook benzeri kullanım için
 */
export function createRateLimiter(action: keyof typeof CONFIGS) {
  return new EnhancedRateLimiter(action);
}
