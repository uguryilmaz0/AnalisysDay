/**
 * Admin User Management API
 * GET /api/admin/users/[id] - Kullanıcı bilgilerini getir
 * PUT /api/admin/users/[id] - Kullanıcı güncelle (premium status, role)
 * DELETE /api/admin/users/[id] - Kullanıcı sil
 * 
 * Auth: Admin only
 * Special: Role update requires Super Admin
 */

import { NextRequest } from 'next/server';
import { requireAdmin, requireSuperAdmin } from '@/middleware/auth';
import { withRateLimit } from '@/lib/rateLimitServer';
import { UpdateUserPremiumSchema, UpdateUserRoleSchema } from '@/lib/validationSchemas';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { serverLogger as logger } from '@/lib/serverLogger';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET - Get user details
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'api-general');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user as { uid: string; email: string | null };

    // 3. Get user from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Get Firebase Auth data
    const authUser = await adminAuth.getUser(userId);

    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
      emailVerified: authUser.emailVerified,
    };

    logger.info('User retrieved', {
      userId,
      requestedBy: admin.uid,
    });

    return Response.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    logger.error('Failed to get user', { error });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT - Update user
 * 
 * Body options:
 * - isPaid, subscriptionEndDate (Admin)
 * - role (Super Admin only)
 */
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'admin-update');
    if (rateLimitError) return rateLimitError;

    // 2. Parse body
    const body = await req.json();

    // 3. Check if role update (requires Super Admin)
    if ('role' in body) {
      const authResult = await requireSuperAdmin(req);
      if ('error' in authResult) {
        return Response.json({ error: authResult.error }, { status: authResult.status });
      }
      const admin = authResult.user as { uid: string; email: string | null };
      const validatedData = UpdateUserRoleSchema.parse(body);

      // Update role
      await adminDb.collection('users').doc(userId).update({
        role: validatedData.role,
        updatedAt: new Date().toISOString(),
      });

      logger.info('User role updated', {
        userId,
        newRole: validatedData.role,
        updatedBy: admin.uid,
      });

      return Response.json({
        success: true,
        message: 'User role updated',
      });
    }

    // 4. Premium status update (Regular Admin)
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user as { uid: string; email: string | null };
    const validatedData = UpdateUserPremiumSchema.parse(body);

    // Calculate subscription end date if making premium
    let subscriptionEndDate = validatedData.subscriptionEndDate;
    if (validatedData.isPaid && !subscriptionEndDate) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Default 30 days
      subscriptionEndDate = endDate.toISOString();
    }

    // Update Firestore
    await adminDb.collection('users').doc(userId).update({
      isPaid: validatedData.isPaid,
      subscriptionEndDate: subscriptionEndDate || null,
      lastPaymentDate: validatedData.isPaid ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    });

    logger.info('User premium status updated', {
      userId,
      isPaid: validatedData.isPaid,
      subscriptionEndDate,
      updatedBy: admin.uid,
    });

    return Response.json({
      success: true,
      message: 'User premium status updated',
      data: {
        isPaid: validatedData.isPaid,
        subscriptionEndDate,
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

    logger.error('Failed to update user', { error });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE - Delete user (Super Admin only)
 */
export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'admin-delete');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization (Super Admin only)
    const authResult = await requireSuperAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user as { uid: string; email: string | null };

    // 3. Check if user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Delete from Firebase Auth
    await adminAuth.deleteUser(userId);

    // 5. Delete from Firestore
    await adminDb.collection('users').doc(userId).delete();

    logger.info('User deleted', {
      userId,
      deletedBy: admin.uid,
    });

    return Response.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    logger.error('Failed to delete user', { error });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
