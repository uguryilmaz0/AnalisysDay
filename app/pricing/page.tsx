"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { createPaymentRequest } from "@/lib/db";
import { uploadReceiptImage } from "@/lib/cloudinary";
import {
  CreditCard,
  CheckCircle2,
  Upload,
  Copy,
  MessageCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Target,
  Clock,
} from "lucide-react";

export default function PricingPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userData) {
      router.push("/login");
      return;
    }

    setError("");
    setUploading(true);

    try {
      let receiptUrl: string | undefined;

      // Dekont varsa yükle
      if (receiptFile) {
        receiptUrl = await uploadReceiptImage(receiptFile, user.uid);
      }

      // Ödeme talebi oluştur
      await createPaymentRequest(
        user.uid,
        userData.email,
        parseInt(price),
        receiptUrl
      );

      setSuccess(true);
      setReceiptFile(null);
    } catch (err) {
      console.error(err);
      setError("Ödeme talebi gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setUploading(false);
    }
  };

  // Zaten premium ise
  if (userData?.isPaid) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-green-50 to-blue-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Zaten Premium Üyesiniz! ✅
          </h1>
          <p className="text-gray-600 mb-6">
            Günlük analizlere sınırsız erişiminiz bulunmaktadır.
          </p>
          {userData.subscriptionEndDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Abonelik Bitiş Tarihi</p>
              <p className="text-xl font-bold text-blue-600">
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

  // Başarılı gönderim
  if (success) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-green-50 to-blue-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ödeme Talebiniz Alındı! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            Ödemeniz inceleniyor. Hesabınız en kısa sürede aktif edilecektir.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <Clock className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-700 mb-2">
              <strong>Onay Süresi:</strong> Genellikle 15 dakika içinde
            </p>
            <p className="text-sm text-gray-600">
              Sorularınız için WhatsApp üzerinden bize ulaşabilirsiniz.
            </p>
          </div>

          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              "Merhaba, ödeme yaptım. Hesabım: " + userData?.email
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp ile İletişime Geç
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Premium Üyelik
          </h1>
          <p className="text-xl text-gray-600">
            Profesyonel analizlere sınırsız erişim
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sol: Paket Detayları */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="bg-[linear-gradient(to_right,var(--tw-gradient-stops))] from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">Aylık Abonelik</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{price}</span>
                <span className="text-2xl">TL</span>
                <span className="text-blue-100">/ Ay</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Günlük Profesyonel Analiz
                  </p>
                  <p className="text-sm text-gray-600">
                    Her gün güncellenen detaylı teknik analizler
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Sınırsız Erişim</p>
                  <p className="text-sm text-gray-600">
                    30 gün boyunca tüm analizlere erişim
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">
                    WhatsApp Desteği
                  </p>
                  <p className="text-sm text-gray-600">
                    7/24 WhatsApp üzerinden destek
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Email Bildirimleri
                  </p>
                  <p className="text-sm text-gray-600">
                    Yeni analiz yayınlandığında anında bildirim
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">
                  Teknik Analiz
                </p>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">
                  Hedef Fiyatlar
                </p>
              </div>
              <div className="text-center">
                <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">
                  Güvenli Ödeme
                </p>
              </div>
            </div>
          </div>

          {/* Sağ: Ödeme Talimatları */}
          <div className="space-y-6">
            {/* IBAN Bilgileri */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Ödeme Bilgileri
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 mb-1 block">
                    Banka
                  </label>
                  <p className="font-semibold text-gray-900">{bankName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 mb-1 block">
                    Hesap Sahibi
                  </label>
                  <p className="font-semibold text-gray-900">{accountHolder}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="text-sm text-gray-600 mb-2 block">
                    IBAN
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-lg font-bold text-blue-600">
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

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600 inline mr-2" />
                  <span className="text-sm font-semibold text-gray-900">
                    Açıklama kısmına kayıt email adresinizi yazınız:
                  </span>
                  <p className="font-mono text-sm text-blue-600 mt-1">
                    {user?.email || "email@example.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dekont Yükleme Formu */}
            {user && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Dekont Yükle
                </h3>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <AlertCircle className="h-5 w-5 text-red-600 inline mr-2" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dekont / Havale Belgesi (Opsiyonel)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="cursor-pointer"
                      >
                        <span className="text-blue-600 hover:text-blue-700 font-semibold">
                          Dosya Seç
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          veya sürükleyip bırakın
                        </p>
                      </label>
                      {receiptFile && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {receiptFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Ödeme Talebini Gönder
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">
                    <strong>Hızlı Onay:</strong> Ödeme sonrası WhatsApp ile
                    dekontu gönderin
                  </p>
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                      "Merhaba, ödeme yaptım. Email: " + (user?.email || "")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp ile Gönder
                  </a>
                </div>
              </div>
            )}

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-center text-gray-700 mb-4">
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
