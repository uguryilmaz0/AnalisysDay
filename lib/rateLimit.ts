// Rate limiting utility using localStorage

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // milliseconds
}

interface RateLimitData {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

export class RateLimiter {
  private key: string;
  private config: RateLimitConfig;

  constructor(action: "login" | "register") {
    this.key = `ratelimit_${action}`;
    this.config = RATE_LIMIT_CONFIGS[action];
  }

  private getData(): RateLimitData | null {
    if (typeof window === "undefined") return null;

    const data = localStorage.getItem(this.key);
    if (!data) return null;

    return JSON.parse(data);
  }

  private setData(data: RateLimitData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  private clearData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.key);
  }

  /**
   * Check if the action is currently rate limited
   * @returns Object with isBlocked status and remainingTime in seconds
   */
  check(): { isBlocked: boolean; remainingTime: number } {
    const data = this.getData();
    const now = Date.now();

    if (!data) {
      return { isBlocked: false, remainingTime: 0 };
    }

    // Check if user is currently blocked
    if (data.blockedUntil && data.blockedUntil > now) {
      const remainingMs = data.blockedUntil - now;
      return {
        isBlocked: true,
        remainingTime: Math.ceil(remainingMs / 1000),
      };
    }

    // Check if window has expired
    if (now - data.firstAttempt > this.config.windowMs) {
      this.clearData();
      return { isBlocked: false, remainingTime: 0 };
    }

    // Check if max attempts reached
    if (data.attempts >= this.config.maxAttempts) {
      const blockedUntil = data.firstAttempt + this.config.windowMs;
      this.setData({ ...data, blockedUntil });
      const remainingMs = blockedUntil - now;
      return {
        isBlocked: true,
        remainingTime: Math.ceil(remainingMs / 1000),
      };
    }

    return { isBlocked: false, remainingTime: 0 };
  }

  /**
   * Record a failed attempt
   */
  recordAttempt(): void {
    const data = this.getData();
    const now = Date.now();

    if (!data) {
      this.setData({
        attempts: 1,
        firstAttempt: now,
      });
      return;
    }

    // If window expired, reset
    if (now - data.firstAttempt > this.config.windowMs) {
      this.setData({
        attempts: 1,
        firstAttempt: now,
      });
      return;
    }

    // Increment attempts
    this.setData({
      ...data,
      attempts: data.attempts + 1,
    });
  }

  /**
   * Reset the rate limit (call on successful action)
   */
  reset(): void {
    this.clearData();
  }

  /**
   * Get remaining attempts before block
   */
  getRemainingAttempts(): number {
    const data = this.getData();
    if (!data) return this.config.maxAttempts;

    const now = Date.now();
    if (now - data.firstAttempt > this.config.windowMs) {
      return this.config.maxAttempts;
    }

    return Math.max(0, this.config.maxAttempts - data.attempts);
  }
}

/**
 * Format remaining time for user display
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} saniye`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} dakika`;
}
