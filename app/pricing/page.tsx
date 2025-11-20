"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Copy,
  MessageCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";

export default function PricingPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  // Email doğrulanmamışsa ve admin değilse verify sayfasına yönlendir
  useEffect(() => {
    if (user && userData && userData.role !== "admin" && !user.emailVerified) {
      router.push("/register/verify-email");
    }
  }, [user, userData, router]);

  const price = process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE || "500";
  const iban =
    process.env.NEXT_PUBLIC_IBAN || "TR00 0000 0000 0000 0000 0000 00";
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Banka Adı";
  const accountHolder =
    process.env.NEXT_PUBLIC_ACCOUNT_HOLDER || "Hesap Sahibi";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905xxxxxxxxx";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Kopyalandı!");
  };

  // Zaten premium ise
  if (userData?.isPaid) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Zaten Premium Üyesiniz! ✅
          </h1>
          <p className="text-gray-400 mb-6">
            Günlük analizlere sınırsız erişiminiz bulunmaktadır.
          </p>
          {userData.subscriptionEndDate && (
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400">Abonelik Bitiş Tarihi</p>
              <p className="text-xl font-bold text-blue-400">
                {new Date(
                  userData.subscriptionEndDate.toDate()
                ).toLocaleDateString("tr-TR")}
              </p>
            </div>
          )}
          <button
            onClick={() => router.push("/analysis")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Analizlere Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/50 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">
              Premium Üyelik
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-purple-400 to-blue-400">
              Profesyonel Analizlere
            </span>
            <br />
            <span className="text-white">Sınırsız Erişim</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Günlük teknik analizler, hedef fiyatlar ve profesyonel tahminlerle
            kazanmaya başlayın
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sol: Paket Detayları */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 hover:border-gray-700 transition-all">
            <div className="bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-2">Aylık Abonelik</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{price}</span>
                <span className="text-2xl">TL</span>
                <span className="text-blue-100">/ Ay</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    Günlük Profesyonel Analiz
                  </p>
                  <p className="text-sm text-gray-400">
                    Her gün güncellenen detaylı teknik analizler
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Sınırsız Erişim</p>
                  <p className="text-sm text-gray-400">
                    30 gün boyunca tüm analizlere erişim
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">WhatsApp Desteği</p>
                  <p className="text-sm text-gray-400">
                    7/24 WhatsApp üzerinden destek
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Email Bildirimleri</p>
                  <p className="text-sm text-gray-400">
                    Yeni analiz yayınlandığında anında bildirim
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">
                  Teknik Analiz
                </p>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">
                  Hedef Fiyatlar
                </p>
              </div>
              <div className="text-center">
                <CreditCard className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">
                  Güvenli Ödeme
                </p>
              </div>
            </div>
          </div>

          {/* Sağ: Ödeme Talimatları */}
          <div className="space-y-6">
            {/* IBAN Bilgileri */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 hover:border-gray-700 transition-all">
              <h3 className="text-2xl font-bold text-white mb-6">
                Ödeme Bilgileri
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <label className="text-sm text-gray-400 mb-1 block">
                    Banka
                  </label>
                  <p className="font-semibold text-white">{bankName}</p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <label className="text-sm text-gray-400 mb-1 block">
                    Hesap Sahibi
                  </label>
                  <p className="font-semibold text-white">{accountHolder}</p>
                </div>

                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                  <label className="text-sm text-gray-400 mb-2 block">
                    IBAN
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-lg font-bold text-blue-400">
                      {iban}
                    </code>
                    <button
                      onClick={() => copyToClipboard(iban)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-2">
                        Önemli Not:
                      </p>
                      <p className="text-sm text-gray-300 mb-2">
                        Havale açıklama kısmına kayıt olduğunuz email adresini
                        yazınız:
                      </p>
                      <p className="font-mono text-sm bg-gray-800 text-blue-400 px-3 py-2 rounded">
                        {user?.email || "email@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp İletişim */}
            {user && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 hover:border-gray-700 transition-all">
                <div className="text-center">
                  <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Ödeme Sonrası İletişim
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Ödemenizi yaptıktan sonra WhatsApp üzerinden bize ulaşın,
                    hesabınızı anında aktif edelim
                  </p>

                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                      "Merhaba, AnalysisDay için ödeme yaptım.\n\nKayıtlı Email: " +
                        (user?.email || "") +
                        "\nÖdeme Tutarı: " +
                        price +
                        " TL"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition shadow-xl hover:shadow-green-500/20 text-lg"
                  >
                    <MessageCircle className="h-6 w-6" />
                    WhatsApp ile İletişime Geç
                  </a>

                  <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      <strong className="text-blue-400">Hızlı Onay:</strong>{" "}
                      WhatsApp ile dekont görseli gönderirseniz hesabınız 15
                      dakika içinde aktif edilir
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-6">
                <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-center text-white mb-4">
                  Ödeme yapabilmek için giriş yapmalısınız
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Giriş Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
