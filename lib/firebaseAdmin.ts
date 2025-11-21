/**
 * Firebase Admin SDK Configuration
 * Server-side Firebase operations için kullanılır
 * 
 * Özellikler:
 * - Server-side authentication
 * - Firestore admin operations (security rules bypass)
 * - User management (role assignment, premium status)
 * - Secure token verification
 */

import * as admin from 'firebase-admin';

// Singleton pattern - sadece bir kez initialize et
let app: admin.app.App | undefined;

/**
 * Firebase Admin SDK'yı initialize eder
 * Service account credentials kullanır (environment variables)
 */
function initializeFirebaseAdmin() {
  // Zaten initialize edilmişse tekrar etme
  if (app) {
    return app;
  }

  try {
    // Service account credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

    // Admin SDK'yı initialize et
    if (admin.apps.length === 0) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });

      console.log('[Firebase Admin] SDK initialized', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    } else {
      app = admin.apps[0]!;
    }

    return app;
  } catch (error) {
    console.error('[Firebase Admin] Initialization failed:', error);
    throw new Error('Firebase Admin initialization failed');
  }
}

// Initialize
initializeFirebaseAdmin();

/**
 * Firebase Admin Services
 */
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

/**
 * Helper: ID Token'ı doğrula
 */
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.warn('[Firebase Admin] Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Helper: Kullanıcı bilgilerini al (role dahil)
 */
export async function getUserData(uid: string) {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    return userDoc.data();
  } catch (error) {
    console.error('[Firebase Admin] Failed to get user data:', uid, error);
    throw error;
  }
}

/**
 * Helper: Admin kontrolü
 */
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const userData = await getUserData(uid);
    return userData?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Helper: Premium kontrolü
 */
export async function isPremium(uid: string): Promise<boolean> {
  try {
    const userData = await getUserData(uid);
    
    if (userData?.role === 'admin') {
      return true; // Adminler otomatik premium
    }

    if (!userData?.isPaid) {
      return false;
    }

    // Abonelik süresini kontrol et
    const now = new Date();
    const subscriptionEnd = userData.subscriptionEndDate?.toDate();
    
    return subscriptionEnd ? subscriptionEnd > now : false;
  } catch {
    return false;
  }
}

export default app;
