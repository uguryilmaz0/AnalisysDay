"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Bell,
} from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasyon
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, emailNotifications);
      router.push("/pricing");
    } catch (err) {
      console.error(err);
      const error = err as { code?: string };
      if (error.code === "auth/email-already-in-use") {
        setError("Bu email adresi zaten kullanılıyor!");
      } else if (error.code === "auth/invalid-email") {
        setError("Geçersiz email adresi!");
      } else if (error.code === "auth/weak-password") {
        setError("Şifre çok zayıf. Daha güçlü bir şifre seçin.");
      } else {
        setError("Kayıt olunamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-emerald-500/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Kayıt Ol</h1>
          <p className="text-gray-400">Ücretsiz hesap oluşturun ve başlayın</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder-gray-500"
                placeholder="ornek@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder-gray-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              En az 6 karakter olmalıdır
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifre Tekrar
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder-gray-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl"
          >
            {loading ? "Kayıt Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>

        {/* Success Info */}
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold mb-1">Kayıt sonrası:</p>
              <p>Premium üyelik için ödeme sayfasına yönlendirileceksiniz.</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
