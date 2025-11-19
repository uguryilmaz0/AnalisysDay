"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getLatestAnalysis, checkSubscriptionExpiry } from "@/lib/db";
import { DailyAnalysis } from "@/types";
import { Lock, Calendar, AlertCircle, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ImageModal from "@/components/ImageModal";

export default function AnalysisPage() {
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionValid, setSubscriptionValid] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      // Kullanıcı giriş yapmamışsa login'e yönlendir
      if (!user) {
        router.push("/login");
        return;
      }

      // Abonelik kontrolü yap
      if (userData?.isPaid && userData.uid) {
        const isValid = await checkSubscriptionExpiry(userData.uid);
        setSubscriptionValid(isValid);

        // Eğer abonelik dolmuşsa userData'yı yenile
        if (!isValid) {
          await refreshUserData();
        }
      }

      // Admin veya premium kullanıcılar için analiz çek
      const canViewAnalysis =
        userData?.role === "admin" || (userData?.isPaid && subscriptionValid);

      if (canViewAnalysis) {
        try {
          const latestAnalysis = await getLatestAnalysis();
          setAnalysis(latestAnalysis);
        } catch (error) {
          // Analiz yüklenemedi - kullanıcı kilit ekranını görüyor
        }
      }

      setLoading(false);
    };

    loadData();
  }, [user, userData, authLoading, router, refreshUserData, subscriptionValid]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Admin kullanıcıları her zaman görebilir
  const canViewAnalysis =
    userData?.role === "admin" || (userData?.isPaid && subscriptionValid);

  // Eğer kullanıcı premium değilse ve admin değilse - KİLİT EKRANI
  if (!canViewAnalysis) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Arka Plan Bulanık Efekti */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20 blur-3xl"></div>

          {/* Simüle Grafik (Blur) */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
            <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-8 border border-white/10">
              <div className="h-64 flex items-end justify-around gap-3 filter blur-lg opacity-30">
                <div
                  className="w-16 bg-green-400 rounded-t-lg"
                  style={{ height: "60%" }}
                ></div>
                <div
                  className="w-16 bg-red-400 rounded-t-lg"
                  style={{ height: "40%" }}
                ></div>
                <div
                  className="w-16 bg-green-400 rounded-t-lg"
                  style={{ height: "85%" }}
                ></div>
                <div
                  className="w-16 bg-green-400 rounded-t-lg"
                  style={{ height: "70%" }}
                ></div>
                <div
                  className="w-16 bg-red-400 rounded-t-lg"
                  style={{ height: "50%" }}
                ></div>
                <div
                  className="w-16 bg-green-400 rounded-t-lg"
                  style={{ height: "95%" }}
                ></div>
                <div
                  className="w-16 bg-green-400 rounded-t-lg"
                  style={{ height: "75%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Kilit İçeriği */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full text-center">
            {/* Kilit İkonu */}
            <div className="bg-linear-to-br from-yellow-400 to-yellow-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Lock className="h-12 w-12 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Premium İçerik
            </h1>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
              <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-xl text-white mb-4">
                Bu içeriği görmek için{" "}
                <span className="font-bold text-yellow-400">Premium Üye</span>{" "}
                olmalısınız.
              </p>
              <p className="text-gray-300 mb-6">
                Günlük profesyonel analizlere sınırsız erişim için hemen üye
                olun!
              </p>

              {/* Özellikler */}
              <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
                <div className="bg-white/5 rounded-lg p-4">
                  <TrendingUp className="h-6 w-6 text-green-400 mb-2" />
                  <p className="text-white text-sm">Günlük Teknik Analiz</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Calendar className="h-6 w-6 text-blue-400 mb-2" />
                  <p className="text-white text-sm">Her Gün Güncellenir</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Lock className="h-6 w-6 text-yellow-400 mb-2" />
                  <p className="text-white text-sm">Sadece Üyelere Özel</p>
                </div>
              </div>

              <Link
                href="/pricing"
                className="inline-block bg-linear-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
              >
                Ücretleri İncele & Premium Ol
              </Link>
            </div>

            <p className="text-gray-400">
              Sorularınız mı var?{" "}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 font-semibold"
              >
                WhatsApp üzerinden bize ulaşın
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Premium kullanıcı - ANALİZİ GÖSTER
  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Günün Analizi
              </h1>
              <p className="text-blue-100">
                Premium üyeliğinizle sınırsız erişim
              </p>
            </div>

            {userData.subscriptionEndDate && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm text-blue-100">Abonelik Bitiş</p>
                <p className="font-semibold">
                  {new Date(
                    userData.subscriptionEndDate.toDate()
                  ).toLocaleDateString("tr-TR")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Analiz İçeriği */}
        {analysis ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden hover:border-gray-700 transition-all duration-300">
            {/* Başlık */}
            <div className="bg-linear-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">
                  {new Date(analysis.date.toDate()).toLocaleDateString(
                    "tr-TR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {analysis.title}
              </h2>
              {analysis.description && (
                <p className="text-gray-400 mt-2">{analysis.description}</p>
              )}
            </div>

            {/* Görseller */}
            <div className="p-6 space-y-6 bg-linear-to-b from-gray-900 to-gray-950">
              {analysis.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    setSelectedImage({
                      url,
                      title: `${analysis.title} - Görsel ${index + 1}`,
                    });
                    setModalOpen(true);
                  }}
                >
                  <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <Image
                    src={url}
                    alt={`${analysis.title} - Görsel ${index + 1}`}
                    width={1200}
                    height={800}
                    className="relative w-full h-auto rounded-xl shadow-2xl border border-gray-800 group-hover:border-blue-500/50 transition-all duration-300"
                    priority={index === 0}
                  />
                  {/* Zoom İkonu */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-xl">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                      🔍 Yakından İncele
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Henüz Analiz Yayınlanmadı
            </h3>
            <p className="text-gray-400">
              Yeni analizler yayınlandığında burada görünecektir.
            </p>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedImage(null);
            }}
            imageUrl={selectedImage.url}
            title={selectedImage.title}
          />
        )}
      </div>
    </div>
  );
}
