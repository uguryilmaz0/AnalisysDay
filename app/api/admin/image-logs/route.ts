/**
 * Admin Image Tracking Logs API
 * GET /api/admin/image-logs - Get all image tracking logs
 * DELETE /api/admin/image-logs - Clear all logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    // Verify admin
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const userId = searchParams.get('userId');
    const analysisId = searchParams.get('analysisId');
    const vpnOnly = searchParams.get('vpnOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query - start with basic query without orderBy
    let query = adminDb
      .collection('image_tracking')
      .limit(limit);

    // Apply filters
    if (type !== 'all') {
      query = query.where('type', '==', type);
    }

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    if (analysisId) {
      query = query.where('analysisId', '==', analysisId);
    }

    if (vpnOnly) {
      query = query.where('isVPN', '==', true);
    }

    // Execute query
    const snapshot = await query.get();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let logs = snapshot.docs.map((doc): any => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by timestamp in memory (descending - newest first)
    logs = logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Get stats
    const stats = {
      total: logs.length,
      byType: {
        view: logs.filter((l) => l.type === 'view').length,
        right_click: logs.filter((l) => l.type === 'right_click').length,
        screenshot: logs.filter((l) => l.type === 'screenshot').length,
        download: logs.filter((l) => l.type === 'download').length,
      },
      vpnCount: logs.filter((l) => l.isVPN || l.isProxy || l.isTor).length,
      botCount: logs.filter((l) => l.deviceType === 'bot').length,
      byCountry: logs.reduce(
        (acc, log) => {
          const country = log.country || 'Unknown';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      topUsers: Object.entries(
        logs.reduce(
          (acc, log) => {
            acc[log.userEmail] = (acc[log.userEmail] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      )
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([email, count]) => ({ email, count })),
    };

    return NextResponse.json({ logs, stats }, { status: 200 });
  } catch (error) {
    console.error('[API /admin/image-logs] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to load logs' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verify super admin
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Get all documents
    const snapshot = await adminDb.collection('image_tracking').get();

    // Delete in batches (Firestore limit: 500 per batch)
    const batchSize = 500;
    const batches = [];

    let batch = adminDb.batch();
    let count = 0;

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;

      if (count === batchSize) {
        batches.push(batch.commit());
        batch = adminDb.batch();
        count = 0;
      }
    }

    // Commit remaining
    if (count > 0) {
      batches.push(batch.commit());
    }

    await Promise.all(batches);

    return NextResponse.json(
      { success: true, deleted: snapshot.size },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /admin/image-logs] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete logs' },
      { status: 500 }
    );
  }
}
