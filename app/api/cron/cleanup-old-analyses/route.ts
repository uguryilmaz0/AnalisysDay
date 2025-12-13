/**
 * Cron Job: Old Analyses Cleanup (3 Days)
 * 
 * Her gün akşam 23:00 TR saatinde çalışır (20:00 UTC = 23:00 TR)
 * 3 gün önceki tüm analizleri siler (günlük + yapay zeka)
 * Firebase dokümanları + Cloudinary görselleri temizlenir
 * 
 * Endpoint: GET /api/cron/cleanup-old-analyses
 * Auth: Vercel Cron Secret (CRON_SECRET env variable) - Production only
 * Schedule: Her gün 20:00 UTC / 23:00 TR (0 20 * * *)
 * 
 * Local Test: http://localhost:3000/api/cron/cleanup-old-analyses
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteOldAnalyses } from '@/lib/dbServer';
import { serverLogger as logger } from '@/lib/serverLogger';

export async function GET(req: NextRequest) {
  try {
    // Vercel Cron authentication
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    logger.info('Cron: cleanup-old-analyses triggered', {
      hasAuthHeader: !!authHeader,
      hasCronSecret: !!cronSecret,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      turkeyTime: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
    });

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

    logger.info('Cron: Authentication successful, starting cleanup...');

    // 3 gün önceki analizleri sil (Cloudinary görselleri dahil)
    const result = await deleteOldAnalyses();

    logger.info('Cron: Old analyses cleanup completed', {
      dailyDeleted: result.dailyDeleted,
      aiDeleted: result.aiDeleted,
      imagesDeleted: result.imagesDeleted,
      total: result.dailyDeleted + result.aiDeleted,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      dailyDeleted: result.dailyDeleted,
      aiDeleted: result.aiDeleted,
      imagesDeleted: result.imagesDeleted,
      total: result.dailyDeleted + result.aiDeleted,
      message: `${result.dailyDeleted} günlük + ${result.aiDeleted} AI analiz (${result.imagesDeleted} görsel) silindi`,
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
