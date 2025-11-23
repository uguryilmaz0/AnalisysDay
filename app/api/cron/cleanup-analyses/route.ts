/**
 * Cron Job: Expired Analyses Cleanup
 * 
 * Her gece saat 04:00'te çalışır (Vercel Cron)
 * expiresAt tarihi geçmiş analizleri siler
 * 
 * Endpoint: GET /api/cron/cleanup-analyses
 * Auth: Vercel Cron Secret (CRON_SECRET env variable)
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteExpiredAnalyses } from '@/lib/db';
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

    // Expired analizleri sil
    const deletedCount = await deleteExpiredAnalyses();

    logger.info('Cron: Expired analyses cleanup completed', {
      deletedCount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} expired analysis deleted`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cron: Cleanup analyses failed', { error });
    
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Vercel Cron: Edge runtime gerektirir
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
