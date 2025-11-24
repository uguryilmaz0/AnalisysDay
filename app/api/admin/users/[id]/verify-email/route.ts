import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { updateUserEmailVerified } from '@/lib/db';
import { requireAdmin } from '@/middleware/auth';
import { withRateLimit } from '@/lib/rateLimitServer';
import { serverLogger as logger } from '@/lib/serverLogger';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH - Toggle email verification status
 * Firebase Auth + Firestore sync
 */
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;
    const body = await req.json();
    const { emailVerified } = body;

    if (typeof emailVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'emailVerified must be boolean' },
        { status: 400 }
      );
    }

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'admin-update');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user;

    // 3. Update Firebase Auth
    await adminAuth.updateUser(userId, {
      emailVerified,
    });

    // 4. Update Firestore (sync)
    await updateUserEmailVerified(userId, emailVerified);

    logger.info('Email verification status updated', {
      userId,
      emailVerified,
      updatedBy: admin.uid,
    });

    return NextResponse.json({
      success: true,
      emailVerified,
    });

  } catch (error) {
    logger.error('Failed to update email verification', { error });
    return NextResponse.json(
      { 
        error: 'Failed to update verification status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
