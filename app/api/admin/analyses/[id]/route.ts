/**
 * Admin Single Analysis API
 * GET /api/admin/analyses/[id] - Tek analiz getir
 * PUT /api/admin/analyses/[id] - Analiz güncelle
 * DELETE /api/admin/analyses/[id] - Analiz sil
 * 
 * Auth: Admin only
 */

import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { withRateLimit } from '@/lib/rateLimitServer';
import { UpdateAnalysisSchema } from '@/lib/validationSchemas';
import { adminDb } from '@/lib/firebaseAdmin';
import { serverLogger as logger } from '@/lib/serverLogger';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET - Get single analysis
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'api-general');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user as { uid: string; email: string | null };

    // 3. Get analysis
    const doc = await adminDb.collection('daily_analysis').doc(id).get();

    if (!doc.exists) {
      return Response.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    logger.info('Analysis retrieved', {
      id,
      requestedBy: admin.uid,
    });

    return Response.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    logger.error('Failed to get analysis', { error });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT - Update analysis
 */
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'admin-update');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user as { uid: string; email: string | null };

    // 3. Validate body
    const body = await req.json();
    const validatedData = UpdateAnalysisSchema.parse(body);

    // 4. Check if exists
    const doc = await adminDb.collection('daily_analysis').doc(id).get();
    if (!doc.exists) {
      return Response.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // 5. Update
    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: admin.uid,
    };

    await adminDb.collection('daily_analysis').doc(id).update(updateData);

    logger.info('Analysis updated', {
      id,
      updatedBy: admin.uid,
      fields: Object.keys(validatedData),
    });

    return Response.json({
      success: true,
      data: {
        id,
        ...updateData,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    logger.error('Failed to update analysis', { error });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE - Delete analysis
 */
export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'admin-delete');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user as { uid: string; email: string | null };

    // 3. Check if exists
    const doc = await adminDb.collection('daily_analysis').doc(id).get();
    if (!doc.exists) {
      return Response.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // 4. Delete
    await adminDb.collection('daily_analysis').doc(id).delete();

    logger.info('Analysis deleted', {
      id,
      deletedBy: admin.uid,
    });

    return Response.json({
      success: true,
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    logger.error('Failed to delete analysis', { error });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
