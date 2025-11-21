/**
 * Server-side Rate Limiting
 * Upstash Redis ile güvenli rate limiting
 * 
 * Özellikler:
 * - Server-side (bypass edilemez)
 * - Redis tabanlı (distributed)
 * - Action-specific limits
 * - IP + User based
 * 
 * Kullanım:
 * ```ts
 * const result = await checkRateLimit(req, 'admin-create');
 * if (!result.success) {
 *   return createErrorResponse('Too many requests', 429);
 * }
 * ```
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';
import { logger } from './logger';

/**
 * Rate Limit Configurations
 */
const rateLimitConfigs = {
  // Admin Operations (güvenli olmalı)
  'admin-create': {
    requests: 10,
    window: '1 m',
  },
  'admin-update': {
    requests: 20,
    window: '1 m',
  },
  'admin-delete': {
    requests: 5,
    window: '1 m',
  },
  
  // Auth Operations
  'auth-login': {
    requests: 5,
    window: '15 m',
  },
  'auth-register': {
    requests: 3,
    window: '1 h',
  },
  'auth-password-reset': {
    requests: 3,
    window: '1 h',
  },
  
  // General API
  'api-general': {
    requests: 100,
    window: '1 m',
  },
} as const;

type RateLimitAction = keyof typeof rateLimitConfigs;

/**
 * Redis client (singleton)
 */
let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      logger.warn('Upstash Redis not configured, rate limiting disabled');
      throw new Error('Redis not configured');
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}

/**
 * Rate limiter cache (action bazlı)
 */
const rateLimiters = new Map<RateLimitAction, Ratelimit>();

function getRateLimiter(action: RateLimitAction): Ratelimit {
  if (!rateLimiters.has(action)) {
    const config = rateLimitConfigs[action];
    const redis = getRedisClient();

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `@ratelimit/${action}`,
    });

    rateLimiters.set(action, limiter);
  }

  return rateLimiters.get(action)!;
}

/**
 * Request'ten identifier çıkar (IP + optional userId)
 */
export function getRequestIdentifier(req: NextRequest, userId?: string): string {
  // IP adresi al (Vercel headers)
  const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'anonymous';

  // User ID varsa ekle
  if (userId) {
    return `${ip}:${userId}`;
  }

  return ip;
}

/**
 * Rate limit kontrolü yap
 * 
 * @returns success: boolean, limit bilgileri
 */
export async function checkRateLimit(
  req: NextRequest,
  action: RateLimitAction,
  userId?: string
) {
  try {
    // Upstash Redis credentials kontrolü
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      logger.warn('Upstash Redis not configured, rate limiting disabled', {
        action,
        hasUrl: !!url,
        hasToken: !!token,
      });
      
      // Redis yoksa fail open (dev) veya fail closed (prod)
      if (process.env.NODE_ENV === 'production') {
        return {
          success: false,
          limit: 0,
          remaining: 0,
          reset: Date.now(),
          error: 'Rate limiting not available',
        };
      }
      
      // Development'ta devam et
      return {
        success: true,
        limit: 999,
        remaining: 999,
        reset: Date.now() + 60000,
      };
    }

    const limiter = getRateLimiter(action);
    const identifier = getRequestIdentifier(req, userId);

    const result = await limiter.limit(identifier);

    // Log
    if (!result.success) {
      logger.warn('Rate limit exceeded', {
        action,
        identifier,
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset),
      });
    }

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // Redis error - fail open (güvenlik için kapalı tutulabilir)
    logger.error('Rate limit check failed', { action, error });
    
    // Production'da fail closed (rate limit yoksa deny)
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now(),
        error: 'Rate limiting error',
      };
    }

    // Development'ta fail open (devam et)
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Rate limit middleware wrapper
 * 
 * Kullanım:
 * ```ts
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await withRateLimit(req, 'admin-create');
 *   if (rateLimitResult) return rateLimitResult; // Error response
 *   
 *   // ... normal logic
 * }
 * ```
 */
export async function withRateLimit(
  req: NextRequest,
  action: RateLimitAction,
  userId?: string
): Promise<Response | null> {
  const result = await checkRateLimit(req, action, userId);

  if (!result.success) {
    const resetDate = new Date(result.reset);
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

    return Response.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again after ${resetDate.toLocaleTimeString()}`,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Redis connection test
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.ping();
    logger.info('Redis connection successful');
    return true;
  } catch (error) {
    logger.error('Redis connection failed', { error });
    return false;
  }
}
