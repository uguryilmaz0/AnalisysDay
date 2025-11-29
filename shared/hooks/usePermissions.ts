import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export interface UserPermissions {
  /**
   * Kullanıcı analizleri görebilir mi?
   */
  canViewAnalysis: boolean;

  /**
   * Kullanıcı analiz yükleyebilir mi?
   */
  canUploadAnalysis: boolean;

  /**
   * Kullanıcı analizleri silebilir mi?
   */
  canDeleteAnalysis: boolean;

  /**
   * Kullanıcı kullanıcıları yönetebilir mi?
   */
  canManageUsers: boolean;

  /**
   * Kullanıcı admin yetkisi verebilir mi?
   */
  canManageAdmins: boolean;

  /**
   * Kullanıcı premium içeriğe erişebilir mi?
   */
  hasPremiumAccess: boolean;

  /**
   * Kullanıcı admin mi?
   */
  isAdmin: boolean;

  /**
   * Kullanıcı super admin mi?
   */
  isSuperAdmin: boolean;

  /**
   * Kullanıcı premium üye mi?
   */
  isPremium: boolean;
}

/**
 * Kullanıcının yetkilerini döndüren hook.
 * Role-based access control için kullanılır.
 *
 * @example
 * ```tsx
 * const { canUploadAnalysis, hasPremiumAccess } = usePermissions();
 *
 * if (canUploadAnalysis) {
 *   return <AnalysisUploadForm />;
 * }
 * ```
 */
export function usePermissions(): UserPermissions {
  const { userData } = useAuth();

  return useMemo(() => {
    const isAdmin = userData?.role === "admin";
    const isSuperAdmin = userData?.superAdmin === true;
    const isPremium = userData?.isPaid === true;

    return {
      // Analiz görüntüleme: Admin veya premium
      canViewAnalysis: isAdmin || isPremium,

      // Analiz yükleme: Sadece admin
      canUploadAnalysis: isAdmin,

      // Analiz silme: Sadece admin
      canDeleteAnalysis: isAdmin,

      // Kullanıcı yönetimi: Sadece admin
      canManageUsers: isAdmin,

      // Admin yönetimi: Sadece super admin
      canManageAdmins: isSuperAdmin,

      // Premium erişim: Admin veya premium
      hasPremiumAccess: isAdmin || isPremium,

      // Role checks
      isAdmin,
      isSuperAdmin,
      isPremium,
    };
  }, [userData]);
}
