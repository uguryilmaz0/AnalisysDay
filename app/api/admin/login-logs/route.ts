import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { requireSuperAdmin } from '@/middleware/auth';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * GET - Login loglarını getir (REDIS - PAGINATION)
 */
export async function GET(req: NextRequest) {
  try {
    // Super admin kontrolü
    const authResult = await requireSuperAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Query params
    const { searchParams } = new URL(req.url);
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const page = parseInt(searchParams.get('page') || '0');

    console.log('🔐 [Login Logs] Fetching from Redis - page:', page);

    // Redis'ten son login logları çek
    const start = page * pageSize;
    const end = start + pageSize;


    const logStrings = await redis.zrange('login_logs:all', start, end, { rev: true }) as string[];
    
    const hasMore = logStrings.length > pageSize;
    const logs = logStrings
      .slice(0, pageSize)
      .map((logStr) => {
        try {
          return JSON.parse(logStr);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    interface LogEntry {
      success: boolean;
      isVPN?: boolean;
      isProxy?: boolean;
      isTor?: boolean;
      country?: string;
      email: string;
    }

    const typedLogs = logs as LogEntry[];

    // Stats hesapla
    const stats = {
      total: typedLogs.length,
      successful: typedLogs.filter((l) => l.success).length,
      failed: typedLogs.filter((l) => l.success === false).length,
      vpnCount: typedLogs.filter((l) => l.isVPN || l.isProxy || l.isTor).length,
      byCountry: typedLogs.reduce(
        (acc: Record<string, number>, log) => {
          const country = log.country || 'Unknown';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      topEmails: Object.entries(
        typedLogs.reduce(
          (acc: Record<string, number>, log) => {
            acc[log.email] = (acc[log.email] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      )
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([email, count]) => ({ email, count })),
    };

    return NextResponse.json({
      logs,
      stats,
      hasMore,
      currentPage: page,
      nextPage: hasMore ? page + 1 : null,
    });
  } catch (error) {
    console.error('Get login logs error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get login logs';
    return NextResponse.json(
      { error: 'Failed to get login logs', details: errorMessage },
      { status: 500 }
    );
  }
}
