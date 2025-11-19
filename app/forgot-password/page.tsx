"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      const error = err as { code?: string };
      if (error.code === "auth/user-not-found") {
        setError("Bu email adresi ile kayıtlı kullanıcı bulunamadı!");
      } else if (error.code === "auth/invalid-email") {
        setError("Geçersiz email adresi!");
      } else {
        setError("Şifre sıfırlama linki gönderilemedi. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-emerald-500/20">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Giriş Sayfasına Dön
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Şifremi Unuttum
          </h1>
          <p className="text-gray-400">
            Email adresinize şifre sıfırlama linki gönderelim
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-green-200 font-semibold mb-1">
                  Link Gönderildi!
                </p>
                <p className="text-green-300">
                  Email kutunuzu kontrol edin. Şifre sıfırlama linkini
                  gönderdik. Spam klasörünü de kontrol etmeyi unutmayın.
                </p>
              </div>
            </div>
          </div>
        )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl"
          >
            {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            💡 <strong>İpucu:</strong> Email gelmezse spam klasörünü kontrol
            edin. Link 1 saat içinde geçerlidir.
          </p>
        </div>
      </div>
    </div>
  );
}
