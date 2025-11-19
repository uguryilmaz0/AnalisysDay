"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, AlertCircle, Shield } from "lucide-react";
import { RateLimiter, formatRemainingTime } from "@/lib/rateLimit";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");

  const { signIn } = useAuth();
  const router = useRouter();
  const rateLimiter = new RateLimiter("login");

  // Check rate limit on mount
  useEffect(() => {
    const { isBlocked, remainingTime } = rateLimiter.check();
    if (isBlocked) {
      setRateLimitError(
        `Çok fazla başarısız deneme. Lütfen ${formatRemainingTime(
          remainingTime
        )} sonra tekrar deneyin.`
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRateLimitError("");

    // Check rate limit
    const { isBlocked, remainingTime } = rateLimiter.check();
    if (isBlocked) {
      setRateLimitError(
        `Çok fazla başarısız deneme. Lütfen ${formatRemainingTime(
          remainingTime
        )} sonra tekrar deneyin.`
      );
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      rateLimiter.reset(); // Reset on success
      router.push("/analysis");
    } catch (err) {
      rateLimiter.recordAttempt(); // Record failed attempt

      const error = err as { code?: string; message?: string };
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        const remaining = rateLimiter.getRemainingAttempts();
        setError(
          `Email veya şifre hatalı! ${
            remaining > 0 ? `(Kalan deneme: ${remaining})` : ""
          }`
        );
      } else if (error.code === "auth/invalid-email") {
        setError("Geçersiz email adresi!");
      } else {
        setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
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
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Giriş Yap</h1>
          <p className="text-gray-400">AnalysisDay hesabınıza giriş yapın</p>
        </div>

        {/* Rate Limit Error */}
        {rateLimitError && (
          <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-orange-200 text-sm">{rateLimitError}</p>
          </div>
        )}

        {/* Error Message */}
        {error && !rateLimitError && (
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
          </div>

          <button
            type="submit"
            disabled={loading || !!rateLimitError}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

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
      </div>
    </div>
  );
}
