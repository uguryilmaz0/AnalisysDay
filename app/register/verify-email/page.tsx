"use client";

import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-emerald-500/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Email Doğrulama (Opsiyonel)
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
                Email adresinize bir doğrulama linki gönderdik. İsterseniz email
                kutunuzu kontrol edip linke tıklayarak hesabınızı
                doğrulayabilirsiniz.
                <span className="block mt-2 text-emerald-300 font-semibold">
                  Not: Email doğrulaması yapmasanız da sisteme giriş
                  yapabilirsiniz.
                </span>
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
              Giriş yapın veya ödeme yapın
            </h3>
            <p className="text-gray-400 text-sm ml-8">
              Email doğrulama yapmadan da sisteme giriş yapabilir ve premium
              üyelik alabilirsiniz.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href="/analysis"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          Sisteme Git
          <ArrowRight className="h-5 w-5" />
        </Link>

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
