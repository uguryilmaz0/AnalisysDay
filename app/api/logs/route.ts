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

    // Firestore'a kaydet (Admin SDK ile)
    await adminDb.collection('system_logs').add({
      level,
      message,
      context: context || {},
      timestamp,
      createdAt: new Date(),
      userId: context?.userId,
      action: context?.action,
      component: context?.component,
      source: 'client',
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to save log:', error);
    return NextResponse.json(
      { error: 'Failed to save log' },
      { status: 500 }
    );
  }
}
