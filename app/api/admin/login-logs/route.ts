import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireSuperAdmin } from '@/middleware/auth';

/**
 * GET - Login loglarını getir
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
    const email = searchParams.get('email');
    const success = searchParams.get('success'); // 'true', 'false', or null for all
    const vpnOnly = searchParams.get('vpnOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = adminDb
      .collection('login_logs')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    // Apply filters
    if (email) {
      query = query.where('email', '==', email);
    }

    if (success === 'true') {
      query = query.where('success', '==', true);
    } else if (success === 'false') {
      query = query.where('success', '==', false);
    }

    if (vpnOnly) {
      query = query.where('isVPN', '==', true);
    }

    // Execute query
    const snapshot = await query.get();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = snapshot.docs.map((doc): any => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get stats
    const stats = {
      total: logs.length,
      successful: logs.filter((l) => l.success).length,
      failed: logs.filter((l) => l.success === false).length,
      vpnCount: logs.filter((l) => l.isVPN || l.isProxy || l.isTor).length,
      byCountry: logs.reduce(
        (acc, log) => {
          const country = log.country || 'Unknown';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      topEmails: Object.entries(
        logs.reduce(
          (acc, log) => {
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
