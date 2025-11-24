import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, DailyAnalysis } from '@/types';
import { logger } from '@/lib/logger';

// ==================== USER İŞLEMLERİ ====================

export async function getUserById(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      logger.debug('User fetched successfully', { userId: uid });
      return userDoc.data() as User;
    }
    logger.warn('User not found', { userId: uid });
    return null;
  } catch (error) {
    logger.error('Failed to fetch user', { userId: uid, error });
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase()),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as User;
  } catch (error) {
    console.error('Kullanıcı bulunamadı:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data() as User;
  } catch (error) {
    console.error('Email lookup failed:', error);
    return null;
  }
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const user = await getUserByUsername(username);
    return user === null;
  } catch (error) {
    console.error('Username kontrolü yapılamadı:', error);
    return false;
  }
}

export async function updateUserPaidStatus(
  uid: string, 
  isPaid: boolean, 
  durationDays: number = 30
): Promise<void> {
  try {
    const now = Timestamp.now();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    await updateDoc(doc(db, 'users', uid), {
      isPaid,
      lastPaymentDate: now,
      subscriptionEndDate: Timestamp.fromDate(endDate),
    });
  } catch (error) {
    console.error('Ödeme durumu güncellenemedi:', error);
    throw error;
  }
}

// Aboneliği kontrol et ve süresi dolmuşsa isPaid'i false yap
export async function checkSubscriptionExpiry(uid: string): Promise<boolean> {
  try {
    const user = await getUserById(uid);
    if (!user || !user.isPaid || !user.subscriptionEndDate) {
      return false;
    }

    const now = new Date();
    const endDate = user.subscriptionEndDate.toDate();

    if (now > endDate) {
      await updateDoc(doc(db, 'users', uid), {
        isPaid: false,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Abonelik kontrolü yapılamadı:', error);
    return false;
  }
}

// Deneme süresini kontrol et
export async function checkTrialExpiry(uid: string): Promise<boolean> {
  try {
    const user = await getUserById(uid);
    if (!user || !user.trialEndDate) {
      return false;
    }

    const now = new Date();
    const endDate = user.trialEndDate.toDate();

    // Deneme süresi dolmuşsa
    if (now > endDate) {
      await updateDoc(doc(db, 'users', uid), {
        trialEndDate: null, // Deneme bitmiş olarak işaretle
      });
      return false;
    }

    return true; // Deneme aktif
  } catch (error) {
    console.error('Deneme süresi kontrolü yapılamadı:', error);
    return false;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => doc.data() as User);
    // Sort by createdAt client-side (handle missing createdAt)
    return users.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Kullanıcılar alınamadı:', error);
    return [];
  }
}

export async function updateUserRole(uid: string, role: 'user' | 'admin', superAdmin?: boolean): Promise<void> {
  try {
    const updateData: Partial<User> = { role };
    if (role === 'admin' && superAdmin !== undefined) {
      updateData.superAdmin = superAdmin;
    } else if (role === 'user') {
      updateData.superAdmin = false;
    }
    await updateDoc(doc(db, 'users', uid), updateData);
  } catch (error) {
    console.error('Kullanıcı rolü güncellenemedi:', error);
    throw error;
  }
}

export async function cancelUserSubscription(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      isPaid: false,
      subscriptionEndDate: null,
    });
  } catch (error) {
    console.error('Abonelik iptal edilemedi:', error);
    throw error;
  }
}

export async function deleteUser(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Kullanıcı silinemedi:', error);
    throw error;
  }
}

export async function updateUserEmailVerified(uid: string, emailVerified: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), { emailVerified });
  } catch (error) {
    console.error('Email doğrulama durumu güncellenemedi:', error);
    throw error;
  }
}

// ==================== ANALİZ İŞLEMLERİ ====================

export async function createAnalysis(
  title: string,
  imageUrls: string[],
  description: string,
  createdBy: string
): Promise<string> {
  try {
    // Kullanıcı bilgisini al (username için)
    const creatorUser = await getUserById(createdBy);
    const createdByUsername = creatorUser?.username || 'admin';

    const now = new Date();
    const createdAt = Timestamp.now();
    
    // Ertesi günün saat 08:00'ünü hesapla (local timezone)
    const expiresDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    expiresDate.setDate(expiresDate.getDate() + 1);
    expiresDate.setHours(8, 0, 0, 0); // 04:00 → 08:00
    const expiresAt = Timestamp.fromDate(expiresDate);
    
    const analysisData: Omit<DailyAnalysis, 'id'> = {
      title,
      imageUrls,
      description,
      date: createdAt,
      createdAt,
      expiresAt,
      isVisible: true,
      createdBy,
      createdByUsername,
      status: 'pending', // Başlangıçta beklemede
    };

    const docRef = await addDoc(collection(db, 'daily_analysis'), analysisData);
    return docRef.id;
  } catch (error) {
    console.error('Analiz oluşturulamadı:', error);
    throw error;
  }
}

export async function updateAnalysis(
  id: string,
  title: string,
  description: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'daily_analysis', id), {
      title,
      description,
    });
  } catch (error) {
    console.error('Analiz güncellenemedi:', error);
    throw error;
  }
}

export async function updateAnalysisStatus(
  id: string,
  status: 'pending' | 'won' | 'lost',
  confirmedBy: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'daily_analysis', id), {
      status,
      resultConfirmedBy: confirmedBy,
      resultConfirmedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Analiz durumu güncellenemedi:', error);
    throw error;
  }
}

/**
 * Bugünün tüm analizlerini getir
 */
export async function getTodayAnalyses(): Promise<DailyAnalysis[]> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const q = query(
      collection(db, 'daily_analysis'),
      where('isVisible', '==', true),
      where('date', '>=', Timestamp.fromDate(todayStart)),
      where('date', '<=', Timestamp.fromDate(todayEnd)),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DailyAnalysis));
  } catch (error) {
    console.error('Bugünün analizleri alınamadı:', error);
    return [];
  }
}

export async function getLatestAnalysis(): Promise<DailyAnalysis | null> {
  try {
    const q = query(
      collection(db, 'daily_analysis'),
      where('isVisible', '==', true),
      orderBy('date', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as DailyAnalysis;
  } catch (error) {
    console.error('Analiz alınamadı:', error);
    return null;
  }
}

export async function getAllAnalyses(): Promise<DailyAnalysis[]> {
  try {
    const q = query(
      collection(db, 'daily_analysis'),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DailyAnalysis));
  } catch (error) {
    console.error('Analizler alınamadı:', error);
    return [];
  }
}

export async function deleteAnalysis(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'daily_analysis', id));
  } catch (error) {
    console.error('Analiz silinemedi:', error);
    throw error;
  }
}

/**
 * Expired analizleri sil (Cron job için)
 */
export async function deleteExpiredAnalyses(): Promise<number> {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'daily_analysis'),
      where('expiresAt', '<=', now)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return snapshot.size; // Silinen analiz sayısı
  } catch (error) {
    console.error('Expired analizler silinemedi:', error);
    throw error;
  }
}

// ==================== GÖRSEL YÜKLEMESİ (CLOUDINARY) ====================
// Not: Cloudinary upload işlemleri client-side'da yapılacak
// Bu fonksiyonlar sadece URL'leri kaydetmek için kullanılacak
