/**
 * Admin Analyses API
 * POST /api/admin/analyses - Yeni analiz oluştur
 * GET /api/admin/analyses - Tüm analizleri listele
 * 
 * Auth: Admin only
 * Rate Limit: 10 create/min, 20 read/min
 */

import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { withRateLimit } from '@/lib/rateLimitServer';
import { CreateAnalysisSchema } from '@/lib/validationSchemas';
import { adminDb } from '@/lib/firebaseAdmin';
import { serverLogger as logger } from '@/lib/serverLogger';
import { ZodError } from 'zod';

/**
 * POST - Create new analysis
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'admin-create');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user as { uid: string; email: string | null };

    // 3. Parse & Validate body
    const body = await req.json();
    const validatedData = CreateAnalysisSchema.parse(body);

    // 4. Create analysis in Firestore
    const analysisData = {
      ...validatedData,
      createdBy: admin.uid,
      createdByEmail: admin.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('daily_analysis').add(analysisData);

    logger.info('Analysis created', {
      id: docRef.id,
      createdBy: admin.uid,
      title: validatedData.title,
    });

    // 5. Return success
    return Response.json(
      {
        success: true,
        id: docRef.id,
        data: {
          id: docRef.id,
          ...analysisData,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Validation error
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Auth error
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return Response.json(
          { error: error.message },
          { status: error.message.includes('Forbidden') ? 403 : 401 }
        );
      }
    }

    // Generic error
    logger.error('Failed to create analysis', { error });
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - List all analyses
 * 
 * Query params:
 * - visible: boolean (filter by visibility)
 * - limit: number (default 10)
 * - offset: number (default 0)
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'admin-update');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user as { uid: string; email: string | null };

    // 3. Parse query params
    const { searchParams } = req.nextUrl;
    const visible = searchParams.get('visible');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 4. Build query
    let query = adminDb.collection('daily_analysis')
      .orderBy('createdAt', 'desc');

    // Filter by visibility
    if (visible !== null) {
      query = query.where('isVisible', '==', visible === 'true');
    }

    // Pagination
    const snapshot = await query
      .limit(limit)
      .offset(offset)
      .get();

    // 5. Format response
    const analyses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info('Analyses listed', {
      count: analyses.length,
      requestedBy: admin.uid,
      filters: { visible, limit, offset },
    });

    return Response.json({
      success: true,
      data: analyses,
      pagination: {
        limit,
        offset,
        count: analyses.length,
      },
    });
  } catch (error) {
    // Auth error
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return Response.json(
          { error: error.message },
          { status: error.message.includes('Forbidden') ? 403 : 401 }
        );
      }
    }

    // Generic error
    logger.error('Failed to list analyses', { error });
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
