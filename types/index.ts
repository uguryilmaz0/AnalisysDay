import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  superAdmin?: boolean; // Super adminler diğer adminleri yönetebilir
  isPaid: boolean;
  subscriptionEndDate: Timestamp | null;
  lastPaymentDate: Timestamp | null;
  emailNotifications: boolean;
  emailVerified: boolean;
  createdAt: Timestamp;
}

export interface DailyAnalysis {
  id: string;
  imageUrls: string[]; // Birden fazla görsel için
  title: string;
  description?: string;
  date: Timestamp;
  isVisible: boolean;
  createdBy: string; // Admin UID
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
