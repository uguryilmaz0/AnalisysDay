/**
 * Client-side logs API
 * POST /api/logs - Client'tan gelen logları Firestore'a kaydet
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  level: LogLevel;
  message: string;
  context?: {
    userId?: string;
    action?: string;
    component?: string;
    [key: string]: unknown;
  };
  timestamp: number;
}

/**
 * POST - Client-side log kaydet
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as LogData;
    const { level, message, context, timestamp } = body;

    // Validate
    if (!level || !message) {
      return NextResponse.json(
        { error: 'Level and message are required' },
        { status: 400 }
      );
    }

    // Firestore'a kaydet (Admin SDK ile - Security Rules bypass)
    // Undefined değerleri filtrele
    const logData: Record<string, any> = {
      level,
      message,
      context: context || {},
      timestamp,
      createdAt: new Date(),
      source: 'client',
    };

    // Optional fields - sadece tanımlıysa ekle
    if (context?.userId) logData.userId = context.userId;
    if (context?.action) logData.action = context.action;
    if (context?.component) logData.component = context.component;

    await adminDb.collection('system_logs').add(logData);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[API /logs] Failed to save log:', error);
    return NextResponse.json(
      { error: 'Failed to save log' },
      { status: 500 }
    );
  }
}
