import {
  getAllUsers,
  updateUserPaidStatus,
  cancelUserSubscription,
  updateUserEmailVerified,
  updateUserRole,
} from "@/lib/db";
import { authFetchJSON } from "@/lib/authFetch";
import { User } from "@/types";
import { BaseService } from "@/shared/services/BaseService";

/**
 * UserService - Kullanıcı yönetimi için servis katmanı
 * Tüm kullanıcı işlemleri merkezi olarak yönetilir
 */
class UserService extends BaseService {
  constructor() {
    super("UserService");
  }

  /**
   * Tüm kullanıcıları getirir (admin için tüm kullanıcılar)
   */
  async getAll(): Promise<User[]> {
    return this.executeWithRetry(
      () => getAllUsers(), // Limit kaldırıldı - tüm kullanıcıları çek
      "getAll",
      { maxRetries: 2 }
    );
  }

  /**
   * Kullanıcıları email verification durumları ile getirir
   */
  async getAllWithAuthData(): Promise<Array<User & { emailVerified: boolean }>> {
    return this.executeWithErrorHandling(async () => {
      const users = await getAllUsers();
      
      // Firebase Auth'dan email verification durumlarını al
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      
      const usersWithAuth = await Promise.all(
        users.map(async (u) => {
          // Client-side'da sadece mevcut kullanıcının bilgilerini alabiliriz
          const isCurrentUser = auth.currentUser?.uid === u.uid;
          return {
            ...u,
            emailVerified: isCurrentUser
              ? auth.currentUser?.emailVerified || false
              : false,
          };
        })
      );

      return usersWithAuth;
    }, "getAllWithAuthData");
  }

  /**
   * Kullanıcıyı premium yapar
   */
  async makePremium(uid: string, days: number = 30): Promise<void> {
    return this.executeWithErrorHandling(
      () => updateUserPaidStatus(uid, true, days),
      "makePremium"
    );
  }

  /**
   * Kullanıcının aboneliğini iptal eder
   */
  async cancelSubscription(uid: string): Promise<void> {
    return this.executeWithErrorHandling(
      () => cancelUserSubscription(uid),
      "cancelSubscription"
    );
  }

  /**
   * Kullanıcıyı siler (Server-side API kullanır)
   * Firebase Auth + Firestore'dan tamamen siler
   */
  async delete(uid: string): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await authFetchJSON(`/api/admin/users/${uid}`, {
        method: 'DELETE',
      });
    }, "delete");
  }

  /**
   * Email doğrulama durumunu değiştirir (Firebase Auth + Firestore sync)
   */
  async toggleEmailVerified(uid: string, newStatus: boolean): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await authFetchJSON(`/api/admin/users/${uid}/email-verification`, {
        method: 'PATCH',
        body: JSON.stringify({ emailVerified: newStatus }),
      });
    }, "toggleEmailVerified");
  }

  /**
   * Email doğrulama linkini tekrar gönderir
   */
  async resendVerificationEmail(uid: string): Promise<{ verificationLink: string; email: string }> {
    return this.executeWithErrorHandling(async () => {
      const response = await authFetchJSON<{ verificationLink: string; email: string }>(
        `/api/admin/users/${uid}/resend-verification`,
        { method: 'POST' }
      );
      return response;
    }, "resendVerificationEmail");
  }

  /**
   * Kullanıcıyı admin yapar
   */
  async makeAdmin(uid: string, isSuperAdmin: boolean = false): Promise<void> {
    return this.executeWithErrorHandling(
      () => updateUserRole(uid, "admin", isSuperAdmin),
      "makeAdmin"
    );
  }

  /**
   * Admin yetkisini kaldırır
   */
  async removeAdmin(uid: string): Promise<void> {
    return this.executeWithErrorHandling(
      () => updateUserRole(uid, "user"),
      "removeAdmin"
    );
  }

  /**
   * Super Admin yetkisini toggle eder
   */
  async toggleSuperAdmin(uid: string, currentStatus: boolean): Promise<void> {
    return this.executeWithErrorHandling(
      () => updateUserRole(uid, "admin", !currentStatus),
      "toggleSuperAdmin"
    );
  }
}

// Singleton instance
export const userService = new UserService();
