/**
 * Server-Side Logging Service
 * Bu logger sadece API routes ve server components'te kullanılmalı
 * Redis'e log kaydeder (Firebase quota sorunu yok)
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  path?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

class ServerLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private readonly LOG_KEY_PREFIX = 'system_logs:';
  private readonly MAX_LOGS = 1000; // Redis'te max 1000 log tut

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
    }[level];

    return `${emoji} [${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private async log(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(level, message);

    // Console'a her zaman yaz
    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](formattedMessage, context || '');

    // Redis'e kaydet (fire-and-forget)
    const timestamp = Date.now();
    const logData = {
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      context: context || {},
      timestamp,
      userId: context?.userId,
      action: context?.action,
      path: context?.path,
    };

    try {
      // ZADD ile sorted set'e ekle (timestamp score olarak)
      await redis.zadd(`${this.LOG_KEY_PREFIX}all`, {
        score: timestamp,
        member: JSON.stringify(logData),
      });

      // Level bazlı ayrı set (filtreleme için)
      await redis.zadd(`${this.LOG_KEY_PREFIX}${level}`, {
        score: timestamp,
        member: JSON.stringify(logData),
      });

      // Eski logları temizle (sadece son 1000 log kalsın)
      await redis.zremrangebyrank(`${this.LOG_KEY_PREFIX}all`, 0, -this.MAX_LOGS - 1);
      await redis.zremrangebyrank(`${this.LOG_KEY_PREFIX}${level}`, 0, -this.MAX_LOGS - 1);
    } catch (error) {
      console.error('[ServerLogger] Failed to save log to Redis:', error);
    }
  }

  /**
   * Info log - Genel bilgi mesajları
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning log - Potansiyel problemler
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error log - Hatalar
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  /**
   * Debug log - Sadece development'ta görünür
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }
}

export const serverLogger = new ServerLogger();
