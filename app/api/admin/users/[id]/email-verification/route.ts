import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { serverLogger } from '@/lib/serverLogger';

/**
 * PATCH /api/admin/users/[id]/email-verification
 * Manuel olarak kullanıcının email doğrulama durumunu günceller
 * Hem Firebase Auth hem de Firestore'u senkronize eder
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Admin kontrolü
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }

    const admin = authResult.user as { uid: string; email: string | null };
    const { id: userId } = await context.params;
    const body = await req.json();
    const { emailVerified } = body;

    if (typeof emailVerified !== 'boolean') {
      return Response.json(
        { error: 'emailVerified must be a boolean' },
        { status: 400 }
      );
    }

    // 1. Firebase Authentication'da email doğrulama durumunu güncelle
    await adminAuth.updateUser(userId, {
      emailVerified: emailVerified,
    });

    // 2. Firestore'da da güncelle
    const updateData: {
      emailVerified: boolean;
      updatedAt: string;
    } = {
      emailVerified: emailVerified,
      updatedAt: new Date().toISOString(),
    };
    
    await adminDb.collection('users').doc(userId).update(updateData);

    serverLogger.info('Email verification status updated by admin', {
      userId,
      emailVerified,
      adminUid: admin.uid,
      adminEmail: admin.email,
    });

    return Response.json({
      success: true,
      message: `Email verification set to ${emailVerified}`,
      emailVerified,
    });
  } catch (error) {
    serverLogger.error('Failed to update email verification', { error, userId: (await context.params).id });
    
    const err = error as { code?: string; message?: string };
    return Response.json(
      { 
        error: 'Failed to update email verification',
        details: err.message,
      },
      { status: 500 }
    );
  }
}
