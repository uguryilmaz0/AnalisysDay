import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export interface UseRequireAuthOptions {
  /**
   * Kullanıcının admin olması gerekiyor mu?
   */
  requireAdmin?: boolean;

  /**
   * Email doğrulaması gerekli mi? (Admin kullanıcılar için otomatik false)
   */
  requireEmailVerified?: boolean;

  /**
   * Giriş yapmamış kullanıcılar için yönlendirme URL'i
   * @default "/login"
   */
  redirectTo?: string;

  /**
   * Email doğrulanmamış kullanıcılar için yönlendirme URL'i
   * @default "/register/verify-email"
   */
  verifyEmailRedirectTo?: string;

  /**
   * Admin olmayan kullanıcılar için yönlendirme URL'i
   * @default "/"
   */
  unauthorizedRedirectTo?: string;
}

/**
 * Sayfalarda auth kontrolü yapmak için kullanılan hook.
 * Her sayfadaki tekrarlayan useEffect kodlarını tek bir yerde toplar.
 *
 * @example
 * ```tsx
 * // Sadece giriş yapmış kullanıcılar
 * useRequireAuth();
 *
 * // Admin kontrolü
 * useRequireAuth({ requireAdmin: true });
 *
 * // Email doğrulama kontrolü (admin hariç)
 * useRequireAuth({ requireEmailVerified: true });
 * ```
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const {
    requireAdmin = false,
    requireEmailVerified = false,
    redirectTo = "/login",
    verifyEmailRedirectTo = "/register/verify-email",
    unauthorizedRedirectTo = "/",
  } = options;

  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Loading bitene kadar bekle
    if (loading) return;

    // Kullanıcı giriş yapmamışsa login'e yönlendir
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // userData yüklenene kadar bekle
    if (!userData) return;

    // Admin kontrolü (admin veya super admin)
    if (requireAdmin && userData.role !== "admin" && !userData.superAdmin) {
      router.push(unauthorizedRedirectTo);
      return;
    }

    // Email doğrulama kontrolü (admin değilse)
    if (requireEmailVerified && userData.role !== "admin" && !user.emailVerified) {
      router.push(verifyEmailRedirectTo);
      return;
    }
  }, [
    user,
    userData,
    loading,
    requireAdmin,
    requireEmailVerified,
    redirectTo,
    verifyEmailRedirectTo,
    unauthorizedRedirectTo,
    router,
  ]);

  return {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    isAdmin: userData?.role === "admin" || userData?.superAdmin,
    isEmailVerified: user?.emailVerified || userData?.role === "admin",
  };
}
