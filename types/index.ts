import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'moderator'; // moderator: sadece analiz yükleme yetkisi
  superAdmin?: boolean; // Super adminler tüm yetkilere sahip
  isPaid: boolean;
  subscriptionEndDate: Timestamp | null;
  lastPaymentDate: Timestamp | null;
  emailNotifications: boolean;
  emailVerified: boolean;
  createdAt: Timestamp;
  trialEndDate: Timestamp | null; // 3 günlük deneme bitiş tarihi
  trialUsed: boolean; // Deneme hakkı kullanıldı mı?
}

export interface DailyAnalysis {
  id: string;
  imageUrls: string[]; // Birden fazla görsel
  title: string;
  description?: string;
  date: Timestamp; // Oluşturulma tarihi
  expiresAt: Timestamp; // Otomatik silinme zamanı (ertesi gün 08:00)
  isVisible: boolean;
  createdBy: string; // Admin/Moderator UID
  createdByUsername: string; // Admin/Moderator kullanıcı adı
  createdAt: Timestamp; // Oluşturulma zamanı
  status: 'pending' | 'won' | 'lost'; // Analiz sonucu
  resultConfirmedBy?: string; // Sonucu onaylayan admin UID
  resultConfirmedAt?: Timestamp; // Onay zamanı
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  receiptUrl?: string; // Dekont görseli (opsiyonel)
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  requestedAt: Timestamp;
  processedAt?: Timestamp;
  processedBy?: string; // Admin UID
}
