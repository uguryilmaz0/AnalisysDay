/**
 * Cron Job: Weekly Old Analyses Cleanup
 * 
 * Her Cumartesi sabahı 05:00'da çalışır (Vercel Cron)
 * 1 hafta önceki tüm analizleri siler (günlük + yapay zeka)
 * 
 * Endpoint: GET /api/cron/cleanup-old-analyses
 * Auth: Vercel Cron Secret (CRON_SECRET env variable)
 * Schedule: Cumartesi 05:00 (0 5 * * 6)
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteOldAnalyses } from '@/lib/db';
import { serverLogger as logger } from '@/lib/serverLogger';

export async function GET(req: NextRequest) {
  try {
    // Vercel Cron authentication
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Production'da cron secret kontrolü
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        logger.error('CRON_SECRET not configured');
        return NextResponse.json(
          { error: 'Cron secret not configured' },
          { status: 500 }
        );
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        logger.warn('Unauthorized cron job attempt', {
          authHeader,
          ip: req.headers.get('x-forwarded-for'),
        });
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // 1 hafta önceki analizleri sil
    const result = await deleteOldAnalyses();

    logger.info('Cron: Weekly old analyses cleanup completed', {
      dailyDeleted: result.dailyDeleted,
      aiDeleted: result.aiDeleted,
      total: result.dailyDeleted + result.aiDeleted,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      dailyDeleted: result.dailyDeleted,
      aiDeleted: result.aiDeleted,
      total: result.dailyDeleted + result.aiDeleted,
      message: `${result.dailyDeleted} günlük + ${result.aiDeleted} AI analiz silindi`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cron: Weekly cleanup failed', { error });
    
    return NextResponse.json(
      { 
        error: 'Weekly cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Vercel Cron: Node.js runtime (Firebase için)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
