"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getLatestAnalysis, checkSubscriptionExpiry } from "@/lib/db";
import { DailyAnalysis } from "@/types";
import { Lock, Calendar, AlertCircle, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AnalysisPage() {
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionValid, setSubscriptionValid] = useState(false);

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

      // Son analizi çek
      const latestAnalysis = await getLatestAnalysis();
      setAnalysis(latestAnalysis);
      setLoading(false);
    };

    loadData();
  }, [user, userData, authLoading, router, refreshUserData]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Eğer kullanıcı premium değilse - KİLİT EKRANI
  if (!userData?.isPaid || !subscriptionValid) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Arka Plan Bulanık Efekti */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-blue-500/20 to-purple-500/20 blur-3xl"></div>

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
            <div className="bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-yellow-400 to-yellow-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
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
                className="inline-block bg-[linear-gradient(to_right,var(--tw-gradient-stops))] from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
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
    <div className="min-h-screen bg-gray-50 py-12">
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
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Başlık */}
            <div className="bg-linear-to-r from-gray-50 to-blue-50 p-6 border-b">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">
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
              <h2 className="text-2xl font-bold text-gray-900">
                {analysis.title}
              </h2>
              {analysis.description && (
                <p className="text-gray-600 mt-2">{analysis.description}</p>
              )}
            </div>

            {/* Görseller */}
            <div className="p-6 space-y-6">
              {analysis.imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <Image
                    src={url}
                    alt={`${analysis.title} - Görsel ${index + 1}`}
                    width={1200}
                    height={800}
                    className="w-full h-auto rounded-lg shadow-lg"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Henüz Analiz Yayınlanmadı
            </h3>
            <p className="text-gray-600">
              Yeni analizler yayınlandığında burada görünecektir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
