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

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message);

    // Console'a her zaman yaz
    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](formattedMessage, context || '');

    // Firestore'a kaydet (fire-and-forget)
    // Undefined değerleri filtrele
    const logData: Record<string, any> = {
      level,
      message,
      context: context || {},
      timestamp: Date.now(),
      createdAt: new Date(),
    };

    // Optional fields - sadece tanımlıysa ekle
    if (context?.userId) logData.userId = context.userId;
    if (context?.action) logData.action = context.action;
    if (context?.path) logData.path = context.path;

    adminDb.collection('system_logs').add(logData).catch((error) => {
      // Firestore'a kaydedilemezse sadece console'a yaz
      console.error('[ServerLogger] Failed to save log to Firestore:', error);
    });
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
