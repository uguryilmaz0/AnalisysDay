/**
 * Cron Job: Unverified Users Cleanup
 * 
 * Her gün saat 02:00'de çalışır (Vercel Cron)
 * 3 günden eski ve email doğrulanmamış kullanıcıları siler
 * 
 * Endpoint: GET /api/cron/cleanup-unverified-users
 * Auth: Vercel Cron Secret (CRON_SECRET env variable)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { serverLogger as logger } from '@/lib/serverLogger';

export async function GET(req: NextRequest) {
  try {
    // Vercel Cron authentication
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Production'da cron secret kontrolü
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        logger.error('CRON_SECRET not configured');
        return NextResponse.json(
          { error: 'Cron secret not configured' },
          { status: 500 }
        );
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        logger.warn('Unauthorized cron job attempt', {
          authHeader,
          ip: req.headers.get('x-forwarded-for'),
        });
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const now = Date.now();
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000); // 3 gün önce

    // Firestore'dan doğrulanmamış kullanıcıları al
    const usersSnapshot = await adminDb.collection('users')
      .where('emailVerified', '==', false)
      .where('role', '!=', 'admin') // Admin'leri asla silme
      .get();

    let deletedCount = 0;
    const deletePromises: Promise<void>[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const createdAt = userData.createdAt?._seconds * 1000 || now;

      // 3 günden eski mi?
      if (createdAt < threeDaysAgo) {
        const userId = userDoc.id;
        
        deletePromises.push(
          (async () => {
            try {
              // Referral temizleme - bu kullanıcıyı davet eden kişinin listelerinden çıkar
              if (userData?.referredBy) {
                const referrerDoc = await adminDb.collection('users').doc(userData.referredBy).get();
                if (referrerDoc.exists) {
                  const referrerData = referrerDoc.data();
                  const updatedReferredUsers = (referrerData?.referredUsers || []).filter((id: string) => id !== userId);
                  const updatedPremiumReferrals = (referrerData?.premiumReferrals || []).filter((id: string) => id !== userId);
                  
                  await adminDb.collection('users').doc(userData.referredBy).update({
                    referredUsers: updatedReferredUsers,
                    premiumReferrals: updatedPremiumReferrals,
                  });
                }
              }

              // Firebase Auth'dan sil
              await adminAuth.deleteUser(userId);
              
              // Firestore'dan sil
              await adminDb.collection('users').doc(userId).delete();
              
              deletedCount++;
              
              logger.info('Unverified user deleted (3+ days old)', {
                userId,
                email: userData.email,
                createdAt: new Date(createdAt).toISOString(),
              });
            } catch (error) {
              logger.error('Failed to delete unverified user', {
                userId,
                error,
              });
            }
          })()
        );
      }
    }

    // Tüm silme işlemlerini paralel çalıştır
    await Promise.all(deletePromises);

    logger.info('Cron: Unverified users cleanup completed', {
      deletedCount,
      checkedCount: usersSnapshot.size,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      deletedCount,
      checkedCount: usersSnapshot.size,
      message: `${deletedCount} unverified users deleted (3+ days old)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cron: Cleanup unverified users failed', { error });
    
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Vercel Cron: Node.js runtime (Firebase Admin SDK için)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
