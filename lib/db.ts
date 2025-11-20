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
import { User, DailyAnalysis, PaymentRequest } from '@/types';

// ==================== USER İŞLEMLERİ ====================

export async function getUserById(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Kullanıcı bulunamadı:', error);
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

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => doc.data() as User);
    // Sort by createdAt client-side
    return users.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
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
    const analysisData: Omit<DailyAnalysis, 'id'> = {
      title,
      imageUrls,
      description,
      date: Timestamp.now(),
      isVisible: true,
      createdBy,
    };

    const docRef = await addDoc(collection(db, 'daily_analysis'), analysisData);
    return docRef.id;
  } catch (error) {
    console.error('Analiz oluşturulamadı:', error);
    throw error;
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

// ==================== GÖRSEL YÜKLEMESİ (CLOUDINARY) ====================
// Not: Cloudinary upload işlemleri client-side'da yapılacak
// Bu fonksiyonlar sadece URL'leri kaydetmek için kullanılacak

// ==================== ÖDEME TALEPLERİ ====================

export async function createPaymentRequest(
  userId: string,
  userEmail: string,
  amount: number,
  receiptUrl?: string
): Promise<string> {
  try {
    const paymentData: Omit<PaymentRequest, 'id'> = {
      userId,
      userEmail,
      amount,
      receiptUrl,
      status: 'pending',
      requestedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'payment_requests'), paymentData);
    return docRef.id;
  } catch (error) {
    console.error('Ödeme talebi oluşturulamadı:', error);
    throw error;
  }
}

export async function getPendingPaymentRequests(): Promise<PaymentRequest[]> {
  try {
    const q = query(
      collection(db, 'payment_requests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentRequest));
  } catch (error) {
    console.error('Ödeme talepleri alınamadı:', error);
    return [];
  }
}

export async function approvePaymentRequest(
  requestId: string,
  adminUid: string,
  userId: string
): Promise<void> {
  try {
    // Ödeme talebini onayla
    await updateDoc(doc(db, 'payment_requests', requestId), {
      status: 'approved',
      processedAt: Timestamp.now(),
      processedBy: adminUid,
    });

    // Kullanıcının isPaid durumunu güncelle (30 günlük)
    await updateUserPaidStatus(userId, true, 30);
  } catch (error) {
    console.error('Ödeme onaylanamadı:', error);
    throw error;
  }
}

export async function rejectPaymentRequest(
  requestId: string,
  adminUid: string,
  notes?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'payment_requests', requestId), {
      status: 'rejected',
      processedAt: Timestamp.now(),
      processedBy: adminUid,
      notes,
    });
  } catch (error) {
    console.error('Ödeme reddedilemedi:', error);
    throw error;
  }
}
