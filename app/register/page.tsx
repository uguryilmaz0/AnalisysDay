"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  Bell,
  User,
  Gift,
} from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { useFormValidation, useToast } from "@/shared/hooks";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { KVKKConsent } from "@/shared/components/KVKKConsent";
import { logger } from "@/lib/logger";
import { validateReferralCodeFormat } from "@/lib/referralUtils";

function RegisterForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [kvkkConsents, setKvkkConsents] = useState<{
    terms: boolean;
    privacy: boolean;
    kvkk: boolean;
    explicitConsent: boolean;
    errors: string[];
  }>({
    terms: false,
    privacy: false,
    kvkk: false,
    explicitConsent: false,
    errors: [],
  });
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { validate } = useFormValidation();

  // URL'den referral kodunu oku
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam && validateReferralCodeFormat(refParam)) {
      setReferralCode(refParam.toUpperCase());
      showToast(
        `🎉 Referral kodu uygulandı: ${refParam.toUpperCase()}`,
        "success",
        4000
      );
    }
  }, [searchParams, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 18 Yaş Kontrolü - ZORUNLU
    if (!ageConfirmed) {
      showToast("18 yaşından büyük olduğunuzu onaylamalısınız", "error");
      return;
    }

    // KVKK Validation - ZORUNLU
    if (
      !kvkkConsents.terms ||
      !kvkkConsents.privacy ||
      !kvkkConsents.kvkk ||
      !kvkkConsents.explicitConsent
    ) {
      showToast("Lütfen tüm zorunlu onayları kabul edin", "error");
      return;
    }

    // Validation with useFormValidation hook
    const validationResult = validate(
      { email, username, firstName, lastName, password, confirmPassword },
      {
        validateEmail: true,
        validateUsername: true,
        validatePassword: true,
        validateConfirmPassword: true,
      }
    );

    if (!validationResult.isValid) {
      showToast(validationResult.errors[0].message, "error");
      return;
    }

    setLoading(true);

    try {
      // Her denemede server-side rate limit check
      const checkResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();

        // Server-side rate limit exceeded
        if (checkResponse.status === 429) {
          showToast(
            errorData.message ||
              "Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin.",
            "error",
            5000
          );
          setLoading(false);
          return;
        }

        // Email not verified - redirect to verification
        if (errorData.error === "EMAIL_NOT_VERIFIED") {
          showToast(
            "Bu email adresi ile kayıt başlatılmış ancak doğrulanmamış. Email adresinizi kontrol edin.",
            "warning",
            7000
          );
          router.push("/register/verify-email");
          setLoading(false);
          return;
        }

        // Email already taken
        if (errorData.error === "EMAIL_TAKEN") {
          showToast(errorData.message, "error");
          setLoading(false);
          return;
        }

        // Username already taken
        if (errorData.error === "USERNAME_TAKEN") {
          showToast(errorData.message, "error");
          setLoading(false);
          return;
        }
      }

      // Rate limit OK - proceed with Firebase auth
      await signUp(
        email,
        username,
        firstName,
        lastName,
        password,
        emailNotifications,
        referralCode || undefined
      );

      // Super admin kontrolü
      const superAdminEmails =
        process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS?.split(",").map((e) =>
          e.trim().toLowerCase()
        ) || [];
      const isSuperAdmin = superAdminEmails.includes(email.toLowerCase());

      // Admin ise login'e, değilse email doğrulama sayfasına yönlendir
      if (isSuperAdmin) {
        router.push("/login");
      } else {
        router.push("/register/verify-email");
      }
    } catch (err) {
      // Başarısız Firebase auth - server'a bildir (rate limit için)
      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username }),
        });
      } catch {
        // Server iletişim hatası, client-side rate limit devam eder
      }

      const error = err as { code?: string; message?: string };

      // Hatalı kayıt denemesini logla
      logger.warn("Registration attempt failed", {
        email,
        username,
        errorCode: error.code,
        errorMessage: error.message,
        action: "register_failed",
      });

      if (error.message === "Bu kullanıcı adı zaten kullanılıyor") {
        showToast("Bu kullanıcı adı zaten kullanılıyor!", "error");
      } else if (error.code === "auth/email-already-in-use") {
        showToast("Bu email adresi zaten kullanılıyor!", "error");
      } else if (error.code === "auth/invalid-email") {
        showToast("Geçersiz email adresi!", "error");
      } else if (error.code === "auth/weak-password") {
        showToast("Şifre çok zayıf. Daha güçlü bir şifre seçin.", "error");
      } else {
        showToast("Kayıt olunamadı. Lütfen tekrar deneyin.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Kayıt Ol"
      description="Ücretsiz hesap oluşturun ve başlayın"
      icon={UserPlus}
    >
      {/* Deneme Süresi Bilgilendirme */}
      <div className="mb-6 bg-linear-to-r from-green-900/40 via-green-800/40 to-green-900/40 border-2 border-green-500/50 rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-green-500 rounded-full p-2 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              🎁 1 Günlük Ücretsiz Deneme!
            </h3>
            <p className="text-sm text-green-200">
              Yeni üyelerimize hoş geldin hediyesi olarak{" "}
              <span className="font-bold">
                1 gün boyunca tüm premium özelliklere
              </span>{" "}
              ücretsiz erişim tanıyoruz. Sistemi keşfedin, analizleri inceleyin!
            </p>
          </div>
        </div>
      </div>

      {/* Referral Bildirimi */}
      {referralCode && (
        <div className="mb-6 bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Gift className="h-5 w-5" />
            <span className="font-semibold">
              Bir arkadaşınızın daveti ile kayıt oluyorsunuz! 🎉
            </span>
          </div>
          <p className="text-sm text-purple-300 mt-1">
            Referral Kodu:{" "}
            <span className="font-mono font-bold">{referralCode}</span>
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Adresi"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-5 w-5" />}
          placeholder="ornek@email.com"
          required
          fullWidth
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ad"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            icon={<User className="h-5 w-5" />}
            placeholder="Adınız"
            required
            minLength={2}
            fullWidth
          />

          <Input
            label="Soyad"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            icon={<User className="h-5 w-5" />}
            placeholder="Soyadınız"
            required
            minLength={2}
            fullWidth
          />
        </div>

        <Input
          label="Kullanıcı Adı"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          icon={<User className="h-5 w-5" />}
          placeholder="kullaniciadi"
          helperText="En az 3 karakter, sadece harf, rakam ve alt çizgi"
          required
          minLength={3}
          pattern="[a-zA-Z0-9_]+"
          fullWidth
        />

        <Input
          label="Şifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-5 w-5" />}
          placeholder="••••••••"
          helperText="En az 6 karakter olmalıdır"
          required
          minLength={6}
          fullWidth
        />

        <Input
          label="Şifre Tekrar"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="h-5 w-5" />}
          placeholder="••••••••"
          required
          minLength={6}
          fullWidth
        />

        {/* Email Bildirimleri */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="mt-1 h-5 w-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 bg-slate-700 border-slate-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-white">
                  Email Bildirimleri
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Yeni maç analizi yayınlandığında email ile bildirim almak
                istiyorum
              </p>
            </div>
          </label>
        </div>

        {/* 18 Yaş Onayı - ZORUNLU */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-1 h-5 w-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 bg-slate-700 border-slate-600"
              required
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-white">
                  Yaş Onayı <span className="text-red-400">*</span>
                </span>
              </div>
              <p className="text-sm text-gray-400">
                18 yaşından büyük olduğumu ve hizmet şartlarını kabul ettiğimi
                onaylıyorum
              </p>
            </div>
          </label>
        </div>

        {/* KVKK Onayları - ZORUNLU */}
        <KVKKConsent
          onAcceptAll={(consents) => setKvkkConsents(consents)}
          requiredConsents={{
            terms: true,
            privacy: true,
            kvkk: true,
            explicitConsent: true,
          }}
        />

        <Button
          type="submit"
          disabled={loading}
          variant="success"
          size="lg"
          loading={loading}
          fullWidth
        >
          Kayıt Ol
        </Button>
        {/* Success Info */}
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-1" />
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold mb-1">Kayıt sonrası:</p>
              <p>
                Email adresinize doğrulama linki gönderilecek. Sisteme giriş
                yapabilmek için email adresinizi doğrulamanız gerekmektedir.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Zaten hesabınız var mı?{" "}
            <button
              onClick={async () => {
                const { signOut: firebaseSignOut } = await import(
                  "firebase/auth"
                );
                const { auth } = await import("@/lib/firebase");
                await firebaseSignOut(auth);
                router.push("/login");
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold bg-transparent border-none cursor-pointer"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
          <div className="text-white">Yükleniyor...</div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
