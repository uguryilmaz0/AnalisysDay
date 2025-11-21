"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, CheckCircle2, Bell, User } from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { useFormValidation, useToast, useRateLimit } from "@/shared/hooks";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { KVKKConsent } from "@/shared/components/KVKKConsent";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
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
  const rateLimit = useRateLimit({ key: "register" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    if (!rateLimit.checkAndNotify()) {
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
      await signUp(
        email,
        username,
        firstName,
        lastName,
        password,
        emailNotifications
      );
      rateLimit.reset(); // Reset on success

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
      rateLimit.recordAttempt(); // Record failed attempt

      const error = err as { code?: string; message?: string };
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
