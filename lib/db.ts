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
  limit,
  startAfter
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

    // Premium olduysa ve davet edilmişse, davet edenin istatistiklerini güncelle
    if (isPaid) {
      await updateReferrerPremiumStats(uid);
    }
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

/**
 * Kullanıcıları getir (OPTİMİZE EDİLMİŞ - PAGINATION + CACHE)
 * @param limitCount - Kaç kullanıcı çekilecek (varsayılan: 100, tümü için: undefined)
 */
export async function getAllUsers(limitCount?: number): Promise<User[]> {
  try {
    // Cache kontrolü (sadece full list için)
    if (!limitCount) {
      const { analysisCache } = await import('@/lib/analysisCache');
      const cachedUsers = analysisCache.get<User[]>('users:all');

      if (cachedUsers) {
        console.log('📦 Users loaded from cache (0 reads)');
        return cachedUsers;
      }
    }

    console.log(`🔥 Fetching users from Firestore (limit: ${limitCount || 'all'})...`);

    // Query builder
    let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    // Limit ekle (eğer belirtilmişse)
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const usersSnapshot = await getDocs(q);
    const users = usersSnapshot.docs.map(doc => doc.data() as User);

    // Client-side sorting (Firestore compound index gerektirmez)
    users.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    });

    console.log(`✅ Fetched ${users.length} users from Firestore`);

    // Cache'e kaydet (sadece full list için, 15 dakika)
    if (!limitCount) {
      const { analysisCache } = await import('@/lib/analysisCache');
      analysisCache.set('users:all', users, 15 * 60 * 1000);
    }

    return users;
  } catch (error) {
    console.error('Kullanıcılar alınamadı:', error);
    return [];
  }
}

/**
 * ⚡ DİNAMİK USERS PAGİNATİON: Sadece istenen 10+1 kullanıcı çekilir
 */
export async function getUsersPaginated(
  page: number = 1,
  pageSize: number = 10,
  lastDocId?: string // Son doküman ID'si (cursor)
): Promise<{ users: User[]; hasMore: boolean; lastDocId?: string; totalCount: number }> {
  try {
    let q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    // Cache key with cursor
    const { analysisCache } = await import('@/lib/analysisCache');
    const cacheKey = `users:page${page}:cursor${lastDocId || 'start'}`;

    return await analysisCache.getOrFetch(
      cacheKey,
      async () => {
        // Toplam kullanıcı sayısı (sadece ilk sayfada çek)
        let totalCount = 0;
        if (page === 1 && !lastDocId) {
          const countSnapshot = await getDocs(collection(db, 'users'));
          totalCount = countSnapshot.size;
        }

        // Cursor varsa startAfter kullan
        if (page > 1 && lastDocId) {
          const lastDocRef = doc(db, 'users', lastDocId);
          const lastDocSnap = await getDoc(lastDocRef);

          if (lastDocSnap.exists()) {
            q = query(q, startAfter(lastDocSnap));
          }
        }

        // Sadece pageSize + 1 çek (hasMore için)
        q = query(q, limit(pageSize + 1));
        const snapshot = await getDocs(q);

        const allUsers = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as User));

        // İlk pageSize kadar göster
        const paginatedUsers = allUsers.slice(0, pageSize);
        const hasMore = allUsers.length > pageSize;

        // Son kullanıcının ID'si
        const newLastDocId = paginatedUsers.length > 0
          ? paginatedUsers[paginatedUsers.length - 1].uid
          : undefined;

        console.log(`✅ Users Page ${page}: Fetched ONLY ${snapshot.docs.length} users (cursor-based) - hasMore: ${hasMore}`);

        return { users: paginatedUsers, hasMore, lastDocId: newLastDocId, totalCount };
      },
      5 * 60 * 1000 // 5 dakika cache
    );
  } catch (error) {
    console.error('Kullanıcılar sayfalama hatası:', error);
    return { users: [], hasMore: false, totalCount: 0 };
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

// ==================== REFERRAL SİSTEMİ ====================

/**
 * Referral koduna göre kullanıcı bul
 */
export async function getUserByReferralCode(referralCode: string): Promise<User | null> {
  try {
    const q = query(
      collection(db, 'users'),
      where('referralCode', '==', referralCode.toUpperCase()),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as User;
  } catch (error) {
    console.error('Referral kodu ile kullanıcı bulunamadı:', error);
    return null;
  }
}

/**
 * Kullanıcıya referral kodu ekle (ilk kez premium olduğunda)
 */
export async function setUserReferralCode(uid: string, referralCode: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      referralCode: referralCode.toUpperCase(),
    });
  } catch (error) {
    console.error('Referral kodu eklenemedi:', error);
    throw error;
  }
}

/**
 * Kullanıcıyı davet eden kişiye bağla
 * Hem davet edilen hem de davet edenin verilerini günceller
 */
export async function linkReferredUser(newUserId: string, referrerUserId: string): Promise<void> {
  try {
    console.log('🔗 linkReferredUser CALLED:', { newUserId, referrerUserId });

    // Davet edenin mevcut referral listesini al
    const referrerDoc = await getDoc(doc(db, 'users', referrerUserId));
    if (!referrerDoc.exists()) {
      console.error('❌ Referrer user not found:', referrerUserId);
      throw new Error('Referrer user not found');
    }

    const referrerData = referrerDoc.data() as User;
    const currentReferredUsers = referrerData.referredUsers || [];
    console.log('📋 Current referredUsers array:', currentReferredUsers);

    // Duplicate kontrolü
    if (currentReferredUsers.includes(newUserId)) {
      console.warn('⚠️ User already in referral list', { newUserId, referrerUserId });
      return;
    }

    // Önce yeni kullanıcının referredBy alanını set et
    console.log('📝 Setting referredBy for new user:', newUserId);
    await updateDoc(doc(db, 'users', newUserId), {
      referredBy: referrerUserId,
    });
    console.log('✅ referredBy set successfully');

    // Sonra davet edenin referredUsers dizisine ekle
    const updatedReferredUsers = [...currentReferredUsers, newUserId];
    console.log('📝 Updating referrer referredUsers array:', updatedReferredUsers);
    await updateDoc(doc(db, 'users', referrerUserId), {
      referredUsers: updatedReferredUsers,
    });
    console.log('✅ referredUsers array updated successfully');

    console.log('🎉 Referral link created successfully', {
      newUserId,
      referrerUserId,
      totalReferrals: updatedReferredUsers.length
    });
  } catch (error) {
    console.error('❌ Referral bağlantısı oluşturulamadı:', error);
    throw error; // Hata fırlat ki üst katmanda loglanabilsin
  }
}

/**
 * Premium olan kullanıcının davet edenin istatistiklerini güncelle
 */
export async function updateReferrerPremiumStats(userId: string): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return;

    const userData = userDoc.data() as User;
    if (!userData.referredBy) return; // Davet edilmemişse işlem yapma

    // Davet edenin premiumReferrals dizisine ekle
    const referrerDoc = await getDoc(doc(db, 'users', userData.referredBy));
    if (referrerDoc.exists()) {
      const referrerData = referrerDoc.data() as User;
      const currentPremiumReferrals = referrerData.premiumReferrals || [];

      if (!currentPremiumReferrals.includes(userId)) {
        await updateDoc(doc(db, 'users', userData.referredBy), {
          premiumReferrals: [...currentPremiumReferrals, userId],
        });
      }
    }
  } catch (error) {
    console.error('Referrer premium istatistikleri güncellenemedi:', error);
    // Bu fonksiyon critical değil, hata fırlatmayız
  }
}

/**
 * Kullanıcının referral istatistiklerini getir (OPTİMİZE EDİLMİŞ)
 * N+1 query problemi çözüldü - tek batch query ile tüm user'ları çekiyor
 */
export async function getReferralStats(uid: string): Promise<{
  totalReferrals: number;
  premiumReferrals: number;
  referredUsers: User[];
  premiumUsers: User[];
}> {
  try {
    console.log('📊 getReferralStats CALLED for uid:', uid);

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      console.warn('❌ User document not found:', uid);
      return { totalReferrals: 0, premiumReferrals: 0, referredUsers: [], premiumUsers: [] };
    }

    const userData = userDoc.data() as User;
    let referredUserIds = userData.referredUsers || [];
    let premiumUserIds = userData.premiumReferrals || [];

    console.log('📋 User data from Firestore:', {
      uid,
      username: userData.username,
      referredUserIds,
      premiumUserIds,
      referredUsersCount: referredUserIds.length,
      premiumReferralsCount: premiumUserIds.length,
    });

    // FALLBACK: Eğer referredUsers array'i boşsa, Firestore'dan query ile bul
    if (referredUserIds.length === 0) {
      console.log('⚠️ referredUsers array is empty, querying Firestore for referredBy...');
      try {
        const q = query(
          collection(db, 'users'),
          where('referredBy', '==', uid)
        );
        const querySnapshot = await getDocs(q);

        const foundUserIds: string[] = [];
        const foundPremiumIds: string[] = [];

        querySnapshot.forEach((doc) => {
          const user = doc.data() as User;
          foundUserIds.push(user.uid);
          if (user.isPaid) {
            foundPremiumIds.push(user.uid);
          }
        });

        console.log('✅ Found users via query:', {
          totalFound: foundUserIds.length,
          premiumFound: foundPremiumIds.length,
          userIds: foundUserIds,
        });

        // Bulunanları array'lere ekle
        referredUserIds = foundUserIds;
        premiumUserIds = foundPremiumIds;

        // Firestore'u güncelle (sonraki defalar için)
        if (foundUserIds.length > 0) {
          console.log('🔧 Updating Firestore with found users...');
          await updateDoc(doc(db, 'users', uid), {
            referredUsers: foundUserIds,
            premiumReferrals: foundPremiumIds,
          });
          console.log('✅ Firestore updated successfully');
        }
      } catch (error) {
        console.error('❌ Query failed:', error);
      }
    }

    console.log('📊 Final referredUserIds:', referredUserIds);

    // ⚡ OPTİMİZASYON: Tüm user'ları tek query'de çek (N+1 yerine 1 query)
    let allUsersMap: Map<string, User> | null = null;

    if (referredUserIds.length > 0) {
      // Firestore'da "in" query max 10 item - chunking gerekli
      const chunks: string[][] = [];
      for (let i = 0; i < referredUserIds.length; i += 10) {
        chunks.push(referredUserIds.slice(i, i + 10));
      }

      allUsersMap = new Map();

      // Her chunk için paralel query
      await Promise.all(
        chunks.map(async (chunk) => {
          const q = query(
            collection(db, 'users'),
            where('uid', 'in', chunk)
          );
          const snapshot = await getDocs(q);
          snapshot.docs.forEach((doc) => {
            const user = doc.data() as User;
            allUsersMap!.set(user.uid, user);
          });
        })
      );

      console.log(`✅ Batch fetched ${allUsersMap.size} users in ${chunks.length} queries`);
    }

    // Map'ten user'ları al
    const referredUsers: User[] = [];
    const premiumUsers: User[] = [];

    if (allUsersMap) {
      referredUserIds.forEach((userId) => {
        const user = allUsersMap!.get(userId);
        if (user) {
          referredUsers.push(user);
          if (premiumUserIds.includes(userId)) {
            premiumUsers.push(user);
          }
        }
      });
    }

    const result = {
      totalReferrals: referredUserIds.length,
      premiumReferrals: premiumUserIds.length,
      referredUsers,
      premiumUsers,
    };

    console.log('🎉 getReferralStats RESULT:', result);
    return result;
  } catch (error) {
    console.error('❌ Referral istatistikleri alınamadı:', error);
    return { totalReferrals: 0, premiumReferrals: 0, referredUsers: [], premiumUsers: [] };
  }
}

// ==================== ANALİZ İŞLEMLERİ ====================

export async function createAnalysis(
  title: string,
  imageUrls: string[],
  description: string,
  createdBy: string,
  type: 'daily' | 'ai' | 'coupon' = 'daily',
  ideal?: string,
  alternative?: string,
  possibleScore?: string,
  iyMs?: string,
  percentage?: string
): Promise<string> {
  try {
    // Kullanıcı bilgisini al (username için)
    const creatorUser = await getUserById(createdBy);
    const createdByUsername = creatorUser?.username || 'admin';

    const now = new Date();
    const createdAt = Timestamp.now();

    // Silinme zamanını hesapla
    let expiresDate: Date;

    if (type === 'coupon') {
      // Kupon: Eklenen andan tam 24 saat sonra silinir
      expiresDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (type === 'ai') {
      // Yapay Zeka Analizi: 15 gün sonra silinir
      expiresDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      expiresDate.setDate(expiresDate.getDate() + 15);
      expiresDate.setHours(8, 0, 0, 0);
    } else {
      // Günlük analiz: Ertesi günün saat 08:00'ünde silinir
      expiresDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      expiresDate.setDate(expiresDate.getDate() + 1);
      expiresDate.setHours(8, 0, 0, 0);
    }

    const expiresAt = Timestamp.fromDate(expiresDate);

    const analysisData: Partial<DailyAnalysis> = {
      type,
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

    // Yapay zeka analizi ise ek alanları ekle
    if (type === 'ai') {
      analysisData.ideal = ideal;
      analysisData.alternative = alternative;
      analysisData.possibleScore = possibleScore;
      analysisData.iyMs = iyMs;
      analysisData.percentage = percentage;
    }

    const docRef = await addDoc(collection(db, 'daily_analysis'), analysisData);

    // Cache'i invalidate et
    const { analysisCache } = await import('@/lib/analysisCache');
    analysisCache.invalidateAnalysisCache();
    console.log('🧹 Analysis cache invalidated after create');

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

    // Cache'i invalidate et
    const { analysisCache } = await import('@/lib/analysisCache');
    analysisCache.invalidateAnalysisCache();
    console.log('🧹 Analysis cache invalidated after status update');
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

/**
 * ⚡ GERÇEK DİNAMİK PAGİNATİON: Cursor-based - sadece istenen 10+1 doküman çekilir
 * lastDocSnapshot: Önceki sayfanın son dokümanı (startAfter için)
 */
export async function getCompletedAnalyses(
  analysisType: 'daily' | 'ai' | 'coupon',
  status: 'won' | 'lost' | 'all',
  page: number = 1,
  pageSize: number = 10,
  lastDocId?: string // Son doküman ID'si (cursor)
): Promise<{ analyses: DailyAnalysis[]; hasMore: boolean; lastDocId?: string }> {
  try {
    // Base query
    let q = query(
      collection(db, 'daily_analysis'),
      where('type', '==', analysisType)
    );

    // Status filter
    if (status !== 'all') {
      q = query(q, where('status', '==', status));
    } else {
      q = query(q, where('status', 'in', ['won', 'lost']));
    }

    q = query(q, orderBy('resultConfirmedAt', 'desc'));

    // ⚡ OPTİMİZE: Cache ile tekrar istek engellensin
    const { analysisCache } = await import('@/lib/analysisCache');
    const cacheKey = `completed:${analysisType}:${status}:page${page}:cursor${lastDocId || 'start'}`;

    return await analysisCache.getOrFetch(
      cacheKey,
      async () => {
        // Sayfa 1'den sonra ve cursor varsa, cursor'dan devam et
        if (page > 1 && lastDocId) {
          const lastDocRef = doc(db, 'daily_analysis', lastDocId);
          const lastDocSnap = await getDoc(lastDocRef);

          if (lastDocSnap.exists()) {
            q = query(q, startAfter(lastDocSnap));
          }
        }

        // ⚡ SADECE pageSize + 1 çek (hasMore kontrolü için)
        q = query(q, limit(pageSize + 1));
        const snapshot = await getDocs(q);

        const allDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DailyAnalysis));

        // İlk pageSize kadar göster
        const paginatedDocs = allDocs.slice(0, pageSize);

        // Bir sonraki sayfa var mı?
        const hasMore = allDocs.length > pageSize;

        // Son dokümanın ID'sini döndür (sonraki sayfa için cursor)
        const newLastDocId = paginatedDocs.length > 0
          ? paginatedDocs[paginatedDocs.length - 1].id
          : undefined;

        console.log(`✅ Page ${page}: Fetched ONLY ${snapshot.docs.length} docs (cursor-based) - hasMore: ${hasMore}`);

        return { analyses: paginatedDocs, hasMore, lastDocId: newLastDocId };
      },
      5 * 60 * 1000 // 5 dakika cache
    );
  } catch (error) {
    console.error('Sonuçlanan analizler alınamadı:', error);
    return { analyses: [], hasMore: false };
  }
}

/**
 * ⚡ OPTİMİZE EDİLMİŞ: Sadece son 3 günün pending analizlerini çeker
 * Cron job her gün 3 günden eski analizleri siliyor zaten
 */
export async function getPendingAnalyses(
  type: 'daily' | 'ai',
  days: number = 3,
  maxLimit: number = 50
): Promise<DailyAnalysis[]> {
  try {
    const { analysisCache } = await import('@/lib/analysisCache');

    return await analysisCache.getOrFetch<DailyAnalysis[]>(
      `pending:${type}:${days}days`,
      async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const q = query(
          collection(db, 'daily_analysis'),
          where('type', '==', type),
          where('status', '==', 'pending'),
          where('isVisible', '==', true),
          where('date', '>=', Timestamp.fromDate(startDate)),
          orderBy('date', 'desc'),
          limit(maxLimit)
        );

        const snapshot = await getDocs(q);
        console.log(`✅ Fetched ${snapshot.size} pending ${type} analyses (last ${days} days)`);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DailyAnalysis));
      },
      2 * 60 * 1000 // 2 dakika TTL (pending analizler sık değişebilir)
    );
  } catch (error) {
    console.error('Pending analizler alınamadı:', error);
    return [];
  }
}

/**
 * ⚡ Aktif kuponları getir (henüz süresi dolmamış)
 */
export async function getPendingCoupons(): Promise<DailyAnalysis[]> {
  try {
    const { analysisCache } = await import('@/lib/analysisCache');

    return await analysisCache.getOrFetch<DailyAnalysis[]>(
      'coupons:pending',
      async () => {
        const now = Timestamp.now();

        const q = query(
          collection(db, 'daily_analysis'),
          where('type', '==', 'coupon'),
          where('isVisible', '==', true),
          where('expiresAt', '>', now),
          orderBy('expiresAt', 'asc'),
          orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        console.log(`✅ Fetched ${snapshot.size} active coupons`);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DailyAnalysis));
      },
      2 * 60 * 1000 // 2 dakika TTL
    );
  } catch (error) {
    console.error('Kuponlar alınamadı:', error);
    return [];
  }
}

export async function getAllAnalyses(): Promise<DailyAnalysis[]> {
  try {
    // getOrFetch ile request deduplication + cache
    const { analysisCache } = await import('@/lib/analysisCache');

    return await analysisCache.getOrFetch<DailyAnalysis[]>(
      'analyses:all',
      async () => {
        console.log('🔥 Fetching analyses from Firestore...');
        const q = query(
          collection(db, 'daily_analysis'),
          orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        const analyses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DailyAnalysis));

        console.log(`✅ Fetched ${analyses.length} analyses from Firestore`);
        return analyses;
      },
      5 * 60 * 1000 // 5 dakika TTL
    );
  } catch (error) {
    console.error('Analizler alınamadı:', error);
    return [];
  }
}

export interface AnalysisStats {
  dailyPending: number;
  dailyWon: number;
  dailyLost: number;
  aiPending: number;
  aiWon: number;
  aiLost: number;
}

/**
 * ⚡ OPTİMİZE EDİLMİŞ: Client-side stats hesaplama
 * getAllAnalyses cache'inden stats hesaplar (0 ek read!)
 * Alternatif: Aggregation API kullanılabilir ama index gerektirir
 */
export async function getAnalysisStats(): Promise<AnalysisStats> {
  try {
    const { analysisCache } = await import('@/lib/analysisCache');

    return await analysisCache.getOrFetch<AnalysisStats>(
      'stats:analysis',
      async () => {
        console.log('🔥 Calculating stats...');

        // ⚡ OPTİMİZASYON: getAllAnalyses zaten cache'li
        // İki seçenek var:
        // 1. Client-side: getAllAnalyses cache'inden hesapla (0 ek read)
        // 2. Aggregation: getCountFromServer kullan (6 read ama index gerekebilir)

        // Şimdilik client-side kullan (aggregation test edilmeli)
        const allAnalyses = await getAllAnalyses(); // Cache'den gelir

        const stats: AnalysisStats = {
          dailyPending: 0,
          dailyWon: 0,
          dailyLost: 0,
          aiPending: 0,
          aiWon: 0,
          aiLost: 0,
        };

        allAnalyses.forEach((data) => {
          if (data.isVisible === false) return;

          const type = data.type || 'daily';
          const status = data.status || 'pending';

          if (type === 'daily') {
            if (status === 'pending') stats.dailyPending++;
            else if (status === 'won') stats.dailyWon++;
            else if (status === 'lost') stats.dailyLost++;
          } else if (type === 'ai') {
            if (status === 'pending') stats.aiPending++;
            else if (status === 'won') stats.aiWon++;
            else if (status === 'lost') stats.aiLost++;
          }
        });

        console.log('✅ Stats calculated (client-side):', stats);
        return stats;
      },
      5 * 60 * 1000 // 5 dakika TTL
    );
  } catch (error) {
    console.error('Analiz istatistikleri alınamadı:', error);
    return {
      dailyPending: 0,
      dailyWon: 0,
      dailyLost: 0,
      aiPending: 0,
      aiWon: 0,
      aiLost: 0,
    };
  }
}

export async function deleteAnalysis(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'daily_analysis', id));

    // Cache'i tamamen invalidate et (tüm completed pages)
    const { analysisCache } = await import('@/lib/analysisCache');
    analysisCache.invalidateAnalysisCache();

    console.log('🧹 Analysis cache invalidated after delete (including all completed pages)');
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


