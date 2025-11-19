"use client";

import { useState } from "react";
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      setResendError("Oturum bulunamadı. Lütfen tekrar kayıt olun.");
      return;
    }

    setResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login?verified=true`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      setResendError("Email gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-emerald-500/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Email Doğrulama Gerekli
          </h1>
          <p className="text-gray-400">Kaydınız başarıyla oluşturuldu!</p>
        </div>

        {/* Success Message */}
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-2">
                Doğrulama linki gönderildi!
              </p>
              <p className="text-gray-300 text-sm">
                Email adresinize bir doğrulama linki gönderdik. Sisteme giriş
                yapabilmek için email adresinizi doğrulamanız gerekmektedir.
              </p>
            </div>
          </div>
        </div>

        {/* Resend Success/Error Messages */}
        {resendSuccess && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-4">
            <p className="text-green-200 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Doğrulama emaili yeniden gönderildi!
            </p>
          </div>
        )}

        {resendError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {resendError}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-4 mb-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                1
              </span>
              Email kutunuzu kontrol edin
            </h3>
            <p className="text-gray-400 text-sm ml-8">
              Spam/Gereksiz klasörünü de kontrol etmeyi unutmayın.
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                2
              </span>
              Doğrulama linkine tıklayın
            </h3>
            <p className="text-gray-400 text-sm ml-8">
              Email içindeki butona tıklayarak hesabınızı aktif edin.
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                3
              </span>
              Giriş yapın
            </h3>
            <p className="text-gray-400 text-sm ml-8">
              Email doğrulaması yaptıktan sonra giriş yaparak sistemi kullanmaya
              başlayabilirsiniz.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Giriş Sayfasına Git
            <ArrowRight className="h-5 w-5" />
          </Link>

          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <RefreshCw
              className={`h-5 w-5 ${resending ? "animate-spin" : ""}`}
            />
            {resending ? "Gönderiliyor..." : "Email'i Yeniden Gönder"}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Email gelmediyse birkaç dakika bekleyin veya spam klasörünü kontrol
            edin.
          </p>
        </div>
      </div>
    </div>
  );
}
