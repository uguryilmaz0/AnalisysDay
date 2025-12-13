"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button, Card } from "@/shared/components/ui";
import {
  useRequireAuth,
  usePermissions,
  useToast,
  useCopyToClipboard,
} from "@/shared/hooks";

export default function PricingPage() {
  const { user, userData } = useRequireAuth({ requireEmailVerified: true });
  const { hasPremiumAccess } = usePermissions();
  const { showToast } = useToast();
  const { copy } = useCopyToClipboard();
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] = useState<"1" | "3" | "6">("3");

  const packages: Record<
    "1" | "3" | "6",
    {
      months: number;
      price: number;
      pricePerMonth: number;
      originalPrice?: number;
    }
  > = {
    "1": { months: 1, price: 400, pricePerMonth: 400, originalPrice: 1000 }, // Aralık kampanyası
    "3": { months: 3, price: 2750, pricePerMonth: 917 },
    "6": { months: 6, price: 5500, pricePerMonth: 917 },
  };

  const currentPackage = packages[selectedPackage];

  const iban =
    process.env.NEXT_PUBLIC_IBAN || "TR00 0000 0000 0000 0000 0000 00";
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Banka Adı";
  const accountHolder =
    process.env.NEXT_PUBLIC_ACCOUNT_HOLDER || "Hesap Sahibi";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905xxxxxxxxx";

  const copyToClipboard = async (text: string) => {
    const success = await copy(text);
    if (success) {
      showToast("Kopylandı!", "success");
    }
  };

  // Zaten premium ise
  if (hasPremiumAccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 py-12">
        <Card padding="lg" className="max-w-2xl w-full text-center">
          <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Zaten Premium Üyesiniz! ✅
          </h1>
          <p className="text-gray-400 mb-6">
            Günlük analizlere sınırsız erişiminiz bulunmaktadır.
          </p>
          {userData?.subscriptionEndDate && (
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400">Abonelik Bitiş Tarihi</p>
              <p className="text-xl font-bold text-blue-400">
                {new Date(
                  userData.subscriptionEndDate.toDate()
                ).toLocaleDateString("tr-TR")}
              </p>
            </div>
          )}
          <Button
            onClick={() => router.push("/analysis")}
            variant="primary"
            size="lg"
          >
            Analizlere Git
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Deneme Süresi Bilgilendirme Banner */}
        {userData && userData.subscriptionEndDate && !userData.isPaid && (
          <div className="mb-8 bg-linear-to-r from-green-900/50 via-green-800/50 to-green-900/50 border-2 border-green-500/50 rounded-2xl p-6 shadow-2xl shadow-green-500/20">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 rounded-full p-3 shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  🎁 1 Günlük Deneme Süreniz Aktif!
                </h3>
                <p className="text-green-200">
                  Yeni üyemiz olduğunuz için sistemi keşfetmeniz için{" "}
                  <span className="font-bold">1 günlük ücretsiz erişim</span>{" "}
                  tanımladık. Bu süre içinde tüm premium özellikleri
                  deneyebilirsiniz.
                </p>
                <p className="text-sm text-green-300 mt-2">
                  Deneme süreniz:{" "}
                  <span className="font-bold">
                    {new Date(
                      userData.subscriptionEndDate.toDate()
                    ).toLocaleDateString("tr-TR")}{" "}
                    tarihine kadar
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

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
            Günlük teknik analizler, veri okuma dersleri ve profesyonel eğitim
            içerikleriyle öğrenmeye başlayın
          </p>
        </div>

        {/* Paket Seçimi */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            {/* 1 Aylık Paket */}
            <button
              onClick={() => setSelectedPackage("1")}
              className={`p-6 rounded-xl border-2 transition-all relative ${
                selectedPackage === "1"
                  ? "border-blue-500 bg-blue-900/30 shadow-xl shadow-blue-500/20"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              {/* Kampanya Etiketi .*/}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-red-600 text-white text-xs py-1 px-1 rounded-full font-semibold animate-pulse">
                  🎄 Aralık Kampanyası
                </span>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">1 Aylık</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <p className="text-lg line-through text-gray-500">1.000 TL</p>
                  <p className="text-3xl font-bold text-red-400">400 TL</p>
                </div>
                <p className="text-sm text-gray-400">400 TL / Ay</p>
                <p className="text-xs text-red-400 mt-1">%60 İndirim!</p>
              </div>
            </button>

            {/* 3 Aylık Paket */}
            <button
              onClick={() => setSelectedPackage("3")}
              className={`p-6 rounded-xl border-2 transition-all relative ${
                selectedPackage === "3"
                  ? "border-purple-500 bg-purple-900/30 shadow-xl shadow-purple-500/20"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  Popüler
                </span>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">3 Aylık</p>
                <p className="text-3xl font-bold text-white mb-1">2.750 TL</p>
                <p className="text-sm text-green-400">917 TL / Ay</p>
              </div>
            </button>

            {/* 6 Aylık Paket */}
            <button
              onClick={() => setSelectedPackage("6")}
              className={`p-6 rounded-xl border-2 transition-all relative ${
                selectedPackage === "6"
                  ? "border-green-500 bg-green-900/30 shadow-xl shadow-green-500/20"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  En Avantajlı
                </span>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">6 Aylık</p>
                <p className="text-3xl font-bold text-white mb-1">5.500 TL</p>
                <p className="text-sm text-green-400">917 TL / Ay</p>
              </div>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sol: Paket Detayları */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 hover:border-gray-700 transition-all">
            <div className="bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-2">
                {currentPackage.months} Aylık Abonelik
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {currentPackage.price}
                </span>
                <span className="text-2xl">TL</span>
              </div>
              <p className="text-blue-100 mt-2">
                Aylık {currentPackage.pricePerMonth} TL
              </p>
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
                    {currentPackage.months * 30} gün boyunca tüm analizlere
                    erişim
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
                      "Merhaba, Analiz Günü için ödeme yaptım.\n\nKayıtlı Email: " +
                        (user?.email || "") +
                        "\nPaket: " +
                        currentPackage.months +
                        " Ay" +
                        "\nÖdeme Tutarı: " +
                        currentPackage.price +
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
