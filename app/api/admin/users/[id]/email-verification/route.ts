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
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    const updateData: any = {
      emailVerified: emailVerified,
      updatedAt: new Date().toISOString(),
    };
    
    // 🎁 Email doğrulaması yapılıyorsa ve deneme süresi yoksa/geçmişse, 1 günlük süre ver
    if (emailVerified && userData) {
      const currentSubscriptionEnd = userData.subscriptionEndDate?.toDate();
      const now = new Date();
      
      if (!currentSubscriptionEnd || currentSubscriptionEnd <= now) {
        const oneDay = new Date();
        oneDay.setDate(oneDay.getDate() + 1);
        updateData.subscriptionEndDate = oneDay;
        
        serverLogger.info('Trial subscription granted on email verification', {
          userId,
          newSubscriptionEnd: oneDay.toISOString(),
        });
      }
    }
    
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
