/**
 * Admin Payment Management API
 * PUT /api/admin/payments/[id] - Ödeme durumunu güncelle (approve/reject)
 * 
 * Auth: Admin only
 * 
 * Actions:
 * - Approve: User'ı premium yap, subscriptionEndDate set et
 * - Reject: Payment request'i rejected olarak işaretle
 */

import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { withRateLimit } from '@/lib/rateLimitServer';
import { UpdatePaymentStatusSchema } from '@/lib/validationSchemas';
import { adminDb } from '@/lib/firebaseAdmin';
import { serverLogger as logger } from '@/lib/serverLogger';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PUT - Update payment status (approve/reject)
 */
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: paymentId } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'payment-approve');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user;

    // 3. Validate body
    const body = await req.json();
    const validatedData = UpdatePaymentStatusSchema.parse(body);

    // 4. Get payment request
    const paymentDoc = await adminDb.collection('payment_requests').doc(paymentId).get();

    if (!paymentDoc.exists) {
      return Response.json(
        { error: 'Payment request not found' },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data();

    // Check if already processed
    if (paymentData?.status !== 'pending') {
      return Response.json(
        { error: 'Payment request already processed' },
        { status: 400 }
      );
    }

    // 5. Update payment request
    await adminDb.collection('payment_requests').doc(paymentId).update({
      status: validatedData.status,
      processedAt: new Date().toISOString(),
      processedBy: admin.uid,
      processedByEmail: admin.email,
    });

    // 6. If approved, update user premium status
    if (validatedData.status === 'approved') {
      const userId = paymentData!.userId;
      const subscriptionDays = validatedData.subscriptionDays || 30;

      // Calculate subscription end date
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + subscriptionDays);

      // Update user
      await adminDb.collection('users').doc(userId).update({
        isPaid: true,
        subscriptionEndDate: endDate.toISOString(),
        lastPaymentDate: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      logger.info('Payment approved and user upgraded', {
        paymentId,
        userId,
        subscriptionDays,
        approvedBy: admin.uid,
      });

      return Response.json({
        success: true,
        message: 'Payment approved and user upgraded to premium',
        data: {
          paymentId,
          userId,
          subscriptionEndDate: endDate.toISOString(),
        },
      });
    }

    // 7. If rejected
    logger.info('Payment rejected', {
      paymentId,
      userId: paymentData!.userId,
      rejectedBy: admin.uid,
    });

    return Response.json({
      success: true,
      message: 'Payment request rejected',
      data: {
        paymentId,
        status: 'rejected',
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

    logger.error('Failed to process payment', { error });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET - Get payment request details
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: paymentId } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'api-general');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if (authResult.error) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }

    // 3. Get payment request
    const paymentDoc = await adminDb.collection('payment_requests').doc(paymentId).get();

    if (!paymentDoc.exists) {
      return Response.json(
        { error: 'Payment request not found' },
        { status: 404 }
      );
    }

    logger.info('Payment request retrieved', {
      paymentId,
      requestedBy: admin.uid,
    });

    return Response.json({
      success: true,
      data: {
        id: paymentDoc.id,
        ...paymentDoc.data(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    logger.error('Failed to get payment request', { error });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
