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
}

export interface DailyAnalysis {
  id: string;
  imageUrls: string[]; // Birden fazla görsel
  title: string;
  description?: string;
  date: Timestamp; // Oluşturulma tarihi
  expiresAt: Timestamp; // Otomatik silinme zamanı (ertesi gün 04:00)
  isVisible: boolean;
  createdBy: string; // Admin/Moderator UID
  createdAt: Timestamp; // Oluşturulma zamanı
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
