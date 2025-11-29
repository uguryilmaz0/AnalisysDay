"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, User, Lock } from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { logger } from "@/lib/logger";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, user, userData } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Eğer kullanıcı zaten giriş yapmışsa ve email doğrulanmışsa yönlendir
  useEffect(() => {
    if (user && userData) {
      if (userData.role === "admin" || user.emailVerified) {
        router.push("/analysis");
      }
    }
  }, [user, userData, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Server-side rate limit + user validation check
      const checkResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const checkData = await checkResponse.json();

      // Rate limit exceeded (429)
      if (checkResponse.status === 429) {
        showToast(
          checkData.message ||
            "Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.",
          "error",
          5000
        );
        setLoading(false);
        return;
      }

      // User not found
      if (checkData.error === "USER_NOT_FOUND") {
        showToast("Kullanıcı adı veya email bulunamadı!", "error");
        setLoading(false);
        return;
      }

      // Other server errors
      if (!checkResponse.ok) {
        showToast(checkData.error || "Beklenmeyen bir hata oluştu", "error");
        setLoading(false);
        return;
      }

      // Server OK - proceed with Firebase auth
      await signIn(emailOrUsername, password);

      // Başarılı login sonrası rate limitlerini temizle
      try {
        localStorage.removeItem("ratelimit_v2_login");
        localStorage.removeItem("ratelimit_analysis");
        console.log("✅ Rate limits cleared after successful login");
      } catch (err) {
        console.warn("Rate limit clear failed:", err);
      }

      router.push("/analysis");
    } catch (err) {
      const error = err as { code?: string; message?: string };

      // Hatalı giriş denemesini logla
      logger.warn("Login attempt failed", {
        emailOrUsername,
        errorCode: error.code,
        errorMessage: error.message,
        action: "login_failed",
      });

      // Email verification error
      if (error.message === "EMAIL_NOT_VERIFIED") {
        showToast(
          "⚠️ Email adresiniz doğrulanmamış! Lütfen email kutunuzu kontrol edin.",
          "warning",
          5000
        );
        setTimeout(() => {
          router.push("/register/verify-email");
        }, 3000);
        return;
      }

      // Firebase auth errors
      if (error.message === "Kullanıcı bulunamadı") {
        showToast("Kullanıcı adı veya email bulunamadı!", "error");
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        showToast("Kullanıcı adı/email veya şifre hatalı!", "error");
      } else if (error.code === "auth/invalid-email") {
        showToast("Geçersiz email adresi!", "error");
      } else {
        showToast("Giriş yapılamadı. Lütfen tekrar deneyin.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Giriş Yap"
      description="Analiz Günü hesabınıza giriş yapın"
      icon={LogIn}
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Kullanıcı Adı veya Email"
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          icon={<User className="h-5 w-5" />}
          placeholder="kullaniciadi veya ornek@email.com"
          helperText="Kullanıcı adınız veya email adresiniz ile giriş yapabilirsiniz"
          required
          fullWidth
        />

        <div>
          <Input
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
            placeholder="••••••••"
            required
            minLength={6}
            fullWidth
          />
          <div className="text-right mt-2">
            <Link
              href="/forgot-password"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Şifremi Unuttum
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="success"
          size="lg"
          loading={loading}
          fullWidth
        >
          Giriş Yap
        </Button>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400">
            Henüz hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
