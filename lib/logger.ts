/**
 * Centralized Logging Service
 * Development: console
 * Production: Sentry + console
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

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

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message);

    // Development: Her şeyi console'a yaz
    if (this.isDevelopment) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](formattedMessage, context || '');
    }

    // Production: Sadece error ve warn console'a, error Sentry'e
    if (this.isProduction) {
      if (level === 'error' || level === 'warn') {
        console[level](formattedMessage, context || '');
      }

      // Sentry'e gönder (error için)
      if (level === 'error' && typeof window !== 'undefined') {
        this.sendToSentry(message, context);
      }
    }

    // Firestore'a kaydet (client-side, API üzerinden)
    if (typeof window !== 'undefined') {
      this.saveToFirestore(level, message, context).catch(() => {
        // Firestore'a kaydedilemezse sessizce devam et
      });
    }
  }

  private async saveToFirestore(level: LogLevel, message: string, context?: LogContext) {
    try {
      // API'ye log gönder
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          context: context || {},
          timestamp: Date.now(),
        }),
      });
    } catch {
      // API'ye ulaşılamazsa sessizce devam et
    }
  }

  private async sendToSentry(message: string, context?: LogContext) {
    try {
      // Sentry dinamik import (sadece gerektiğinde yüklenir)
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.captureException(new Error(message), {
        extra: context,
        tags: {
          action: context?.action,
          component: context?.component,
        },
        user: context?.userId ? { id: context.userId } : undefined,
      });
    } catch (error) {
      // Sentry kurulu değilse sessizce devam et
      if (this.isDevelopment) {
        console.warn('Sentry not available:', error);
      }
    }
  }

  /**
   * Info log - Genel bilgi mesajları
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  /**
   * Warning log - Potansiyel problemler
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  /**
   * Error log - Hatalar (Sentry'e gider)
   */
  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  /**
   * Debug log - Sadece development'ta görünür
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * User action log - Kullanıcı aksiyonları
   */
  userAction(action: string, userId: string, metadata?: Record<string, unknown>) {
    this.info(`User action: ${action}`, {
      action,
      userId,
      metadata,
    });
  }

  /**
   * API call log
   */
  apiCall(method: string, endpoint: string, status?: number, duration?: number) {
    const message = `API ${method} ${endpoint}`;
    const context = { method, endpoint, status, duration };

    if (status && status >= 400) {
      this.error(message, context);
    } else {
      this.debug(message, context);
    }
  }

  /**
   * Performance measurement
   */
  performance(label: string, duration: number) {
    const message = `Performance: ${label} took ${duration}ms`;
    
    if (duration > 1000) {
      this.warn(message, { label, duration });
    } else {
      this.debug(message, { label, duration });
    }
  }
}

export const logger = new Logger();

/**
 * Performance measurement helper
 * 
 * Usage:
 * const measure = performanceMeasure('data-fetch');
 * // ... do work
 * measure.end(); // Logs performance
 */
export function performanceMeasure(label: string) {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = Math.round(performance.now() - start);
      logger.performance(label, duration);
      return duration;
    },
  };
}
