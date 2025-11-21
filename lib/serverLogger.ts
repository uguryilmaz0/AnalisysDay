/**
 * Server-Side Logging Service
 * Bu logger sadece API routes ve server components'te kullanılmalı
 * Firestore'a log kaydeder
 */

import { adminDb } from './firebaseAdmin';

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

  private async log(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message);

    // Console'a her zaman yaz
    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](formattedMessage, context || '');

    // Firestore'a kaydet
    try {
      await adminDb.collection('system_logs').add({
        level,
        message,
        context: context || {},
        timestamp: Date.now(),
        createdAt: new Date(),
        userId: context?.userId,
        action: context?.action,
        path: context?.path,
      });
    } catch (error) {
      // Firestore'a kaydedilemezse sadece console'a yaz
      console.error('Failed to save log to Firestore:', error);
    }
  }

  /**
   * Info log - Genel bilgi mesajları
   */
  async info(message: string, context?: LogContext) {
    await this.log('info', message, context);
  }

  /**
   * Warning log - Potansiyel problemler
   */
  async warn(message: string, context?: LogContext) {
    await this.log('warn', message, context);
  }

  /**
   * Error log - Hatalar
   */
  async error(message: string, context?: LogContext) {
    await this.log('error', message, context);
  }

  /**
   * Debug log - Sadece development'ta görünür
   */
  async debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      await this.log('debug', message, context);
    }
  }
}

export const serverLogger = new ServerLogger();
