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
  // Referral sistemi
  referralCode?: string; // Benzersiz referral kodu (örn: "ABG4X9K2")
  referredBy?: string; // Davet eden kullanıcının UID'si
  referredUsers?: string[]; // Davet edilen kullanıcıların UID'leri
  premiumReferrals?: string[]; // Premium olan davet edilenlerin UID'leri
}

export interface DailyAnalysis {
  id: string;
  type: 'daily' | 'ai'; // Analiz tipi
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
  // Yapay Zeka Analizi için ek alanlar
  ideal?: string; // İdeal Tercih (max 30 karakter)
  alternative?: string; // Alternatif (max 30 karakter)
  possibleScore?: string; // Olası Skor (max 30 karakter)
  percentage?: string; // Yüzde (max 30 karakter)
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

export interface LoginLog {
  id: string;
  userId?: string; // Başarısız girişlerde olmayabilir
  email: string; // Giriş denemesinde kullanılan email/username
  ipAddress: string;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'bot';
  country?: string;
  isp?: string;
  asn?: string;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  success: boolean; // Giriş başarılı mı?
  failReason?: string; // Başarısız ise nedeni (WRONG_PASSWORD, USER_NOT_FOUND, etc.)
  timestamp: number;
  createdAt: Timestamp;
}
