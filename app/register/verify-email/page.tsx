"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/shared/hooks";
import { AuthLayout } from "@/shared/components/AuthLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Email doğrulandıysa otomatik yönlendir
  useEffect(() => {
    const checkEmailVerification = setInterval(async () => {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        clearInterval(checkEmailVerification);
        router.push("/analysis");
      }
    }, 3000); // Her 3 saniyede bir kontrol et

    return () => clearInterval(checkEmailVerification);
  }, [router]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      showToast("Oturum bulunamadı. Lütfen tekrar kayıt olun.", "error");
      return;
    }

    setResending(true);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login?verified=true`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      showToast("Doğrulama emaili yeniden gönderildi!", "success");
    } catch {
      showToast(
        "Email gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        "error"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Email Doğrulama Gerekli"
      description="Kaydınız başarıyla oluşturuldu!"
      icon={Mail}
    >
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
          <RefreshCw className={`h-5 w-5 ${resending ? "animate-spin" : ""}`} />
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
    </AuthLayout>
  );
}
