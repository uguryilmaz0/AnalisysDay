"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useFormValidation, useToast } from "@/shared/hooks";
import { AuthLayout } from "@/shared/components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();
  const { validate } = useFormValidation();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    // Validate email
    const validationResult = validate({ email }, { validateEmail: true });

    if (!validationResult.isValid) {
      showToast(validationResult.errors[0].message, "error");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      showToast(
        "Şifre sıfırlama linki email adresinize gönderildi!",
        "success"
      );
      setEmail("");
    } catch (err) {
      const error = err as { code?: string };
      if (error.code === "auth/user-not-found") {
        showToast("Bu email adresi ile kayıtlı kullanıcı bulunamadı!", "error");
      } else if (error.code === "auth/invalid-email") {
        showToast("Geçersiz email adresi!", "error");
      } else {
        showToast(
          "Şifre sıfırlama linki gönderilemedi. Lütfen tekrar deneyin.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Şifremi Unuttum"
      description="Email adresinize şifre sıfırlama linki gönderelim"
      icon={Mail}
    >
      {/* Back Button */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Giriş Sayfasına Dön
      </Link>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl"
        >
          {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
        </button>
      </form>

      {/* Success Message */}
      {success && (
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4">
          <p className="text-sm text-emerald-200">
            ✅ <strong>Başarılı!</strong> Şifre sıfırlama linki email adresinize
            gönderildi.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          💡 <strong>İpucu:</strong> Email gelmezse spam klasörünü kontrol edin.
          Link 1 saat içinde geçerlidir.
        </p>
      </div>
    </AuthLayout>
  );
}
