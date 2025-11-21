import {
  getAllUsers,
  updateUserPaidStatus,
  cancelUserSubscription,
  deleteUser as deleteUserFromDB,
  updateUserEmailVerified,
  updateUserRole,
} from "@/lib/db";
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
   * Tüm kullanıcıları getirir
   */
  async getAll(): Promise<User[]> {
    return this.executeWithRetry(
      () => getAllUsers(),
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
   * Kullanıcıyı siler
   */
  async delete(uid: string): Promise<void> {
    return this.executeWithErrorHandling(
      () => deleteUserFromDB(uid),
      "delete"
    );
  }

  /**
   * Email doğrulama durumunu değiştirir
   */
  async toggleEmailVerified(uid: string, newStatus: boolean): Promise<void> {
    return this.executeWithErrorHandling(
      () => updateUserEmailVerified(uid, newStatus),
      "toggleEmailVerified"
    );
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
