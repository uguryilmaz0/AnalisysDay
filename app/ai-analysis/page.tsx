"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllAnalyses, checkSubscriptionExpiry } from "@/lib/db";
import { DailyAnalysis } from "@/types";
import {
  Lock,
  Calendar,
  AlertCircle,
  Sparkles,
  Filter,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ImageModal from "@/components/ImageModal";
import { LoadingSpinner, EmptyState, Button } from "@/shared/components/ui";
import { useRequireAuth, usePermissions, useModal } from "@/shared/hooks";

type AnalysisTab = "analizler" | "sonuçlananlar";
type TimeFilter = "1day" | "1week" | "1month" | "all";
type StatusFilter = "all" | "won" | "lost";

export default function AIAnalysisPage() {
  const { userData, loading: authLoading } = useRequireAuth({
    requireEmailVerified: true,
  });
  const { hasPremiumAccess } = usePermissions();
  const { refreshUserData } = useAuth();
  const [analyses, setAnalyses] = useState<DailyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionValid, setSubscriptionValid] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("analizler");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const modal = useModal();

  // Filtrelenmiş analizler - SADECE AI TİPİ
  const filteredAnalyses = useMemo(() => {
    // Önce AI tipindeki analizleri filtrele
    let result = analyses.filter((a) => a.type === "ai");

    // Tab filtrelemesi
    if (activeTab === "analizler") {
      // Analizler tab: Sadece bugünün pending analizleri
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      result = result.filter((a) => {
        const analysisDate = a.date.toDate();
        analysisDate.setHours(0, 0, 0, 0);

        // Bugün oluşturulmuş VE (status yok veya pending)
        return (
          analysisDate.getTime() === today.getTime() &&
          (!a.status || a.status === "pending")
        );
      });
    } else {
      // Sonuçlananlar tab: Tüm kazanan/kaybeden analizler
      result = result.filter((a) => a.status === "won" || a.status === "lost");

      // Status filter (sadece completed tab'de)
      if (statusFilter !== "all") {
        result = result.filter((a) => a.status === statusFilter);
      }

      // Zaman filtrelemesi (Sadece sonuçlananlar için)
      if (timeFilter !== "all") {
        const now = new Date();
        let cutoffDate: Date;

        switch (timeFilter) {
          case "1day":
            cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "1week":
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "1month":
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }

        result = result.filter((analysis) => {
          const dateToCheck = analysis.resultConfirmedAt
            ? analysis.resultConfirmedAt.toDate()
            : analysis.date.toDate();
          return dateToCheck >= cutoffDate!;
        });
      }
    }

    return result;
  }, [analyses, activeTab, timeFilter, statusFilter]);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      // Abonelik kontrolü (admin değilse)
      if (userData?.role !== "admin" && userData?.isPaid && userData.uid) {
        const isValid = await checkSubscriptionExpiry(userData.uid);
        setSubscriptionValid(isValid);

        if (!isValid) {
          await refreshUserData();
        }
      }

      // Premium erişimi varsa analiz çek
      if (hasPremiumAccess) {
        try {
          const allAnalyses = await getAllAnalyses();
          setAnalyses(allAnalyses);
        } catch {
          // Analiz yüklenemedi
        }
      }

      setLoading(false);
    };

    loadData();
  }, [
    authLoading,
    userData,
    hasPremiumAccess,
    refreshUserData,
    subscriptionValid,
  ]);

  // Loading state
  if (authLoading || loading) {
    return (
      <LoadingSpinner
        fullScreen
        size="xl"
        text="Yapay zeka analizleri yükleniyor..."
      />
    );
  }

  // Premium erişimi yoksa - KİLİT EKRANI
  if (!hasPremiumAccess) {
    const trialExpired =
      userData?.trialUsed &&
      (!userData?.trialEndDate || new Date() > userData.trialEndDate.toDate());

    return (
      <div className="min-h-screen bg-linear-to-br from-gray-950 via-purple-900/20 to-gray-950 relative overflow-hidden">
        {/* Arka Plan Efekti */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 to-pink-500/20 blur-3xl"></div>

          {/* Simüle Grafik (Blur) */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
            <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-8 border border-white/10">
              <div className="h-64 flex items-end justify-around gap-3 filter blur-lg opacity-30">
                <div
                  className="w-16 bg-purple-400 rounded-t-lg"
                  style={{ height: "60%" }}
                ></div>
                <div
                  className="w-16 bg-pink-400 rounded-t-lg"
                  style={{ height: "40%" }}
                ></div>
                <div
                  className="w-16 bg-purple-400 rounded-t-lg"
                  style={{ height: "85%" }}
                ></div>
                <div
                  className="w-16 bg-purple-400 rounded-t-lg"
                  style={{ height: "70%" }}
                ></div>
                <div
                  className="w-16 bg-pink-400 rounded-t-lg"
                  style={{ height: "50%" }}
                ></div>
                <div
                  className="w-16 bg-purple-400 rounded-t-lg"
                  style={{ height: "95%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Kilit İçeriği */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full text-center">
            {/* AI İkonu */}
            <div className="bg-linear-to-br from-purple-500 to-pink-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
              <Sparkles className="h-12 w-12 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Yapay Zeka Analizi
            </h1>

            {/* Deneme Süresi Doldu Mesajı */}
            {trialExpired && (
              <div className="bg-linear-to-r from-orange-900/50 to-red-900/50 border border-orange-500/30 rounded-lg p-4 mb-6">
                <p className="text-orange-300 font-semibold mb-2">
                  ⏰ 3 Günlük Deneme Süreniz Doldu
                </p>
                <p className="text-orange-200/80 text-sm">
                  Premium üyelikle AI analizlerine sınırsız erişim sağlayın
                </p>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
              <AlertCircle className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <p className="text-xl text-white mb-4">
                Bu içeriği görmek için{" "}
                <span className="font-bold text-purple-400">Premium Üye</span>{" "}
                olmalısınız.
              </p>
              <p className="text-gray-300 mb-6">
                Yapay zeka destekli profesyonel tablo analizlerine sınırsız
                erişim için hemen üye olun!
              </p>

              {/* Özellikler */}
              <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
                <div className="bg-white/5 rounded-lg p-4">
                  <Sparkles className="h-6 w-6 text-purple-400 mb-2" />
                  <p className="text-white text-sm">AI Destekli Analiz</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <TrendingUp className="h-6 w-6 text-pink-400 mb-2" />
                  <p className="text-white text-sm">Gelişmiş Tahminler</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Lock className="h-6 w-6 text-purple-400 mb-2" />
                  <p className="text-white text-sm">Sadece Üyelere Özel</p>
                </div>
              </div>

              <Link href="/pricing">
                <Button variant="premium" size="lg">
                  Ücretleri İncele & Premium Ol
                </Button>
              </Link>
            </div>

            <p className="text-gray-400">
              Sorularınız mı var?{" "}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                WhatsApp üzerinden bize ulaşın
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Premium kullanıcı - AI ANALİZİ GÖSTER
  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Deneme Süresi Banner */}
        {userData &&
          !userData.isPaid &&
          userData.trialEndDate &&
          new Date() < userData.trialEndDate.toDate() && (
            <div className="bg-linear-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg p-4 mb-6 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-purple-200 font-semibold">
                    Deneme Süresi Aktif -{" "}
                    {Math.ceil(
                      (userData.trialEndDate.toDate().getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    Gün Kaldı
                  </p>
                  <p className="text-purple-300/80 text-sm mt-1">
                    AI analiz özelliklerini deneyimleyin! Süre bitiminde üyelik
                    almayı unutmayın.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-8 w-8" />
                <h1 className="text-3xl md:text-4xl font-bold">
                  Yapay Zeka Analizi
                </h1>
              </div>
              <p className="text-purple-100">
                AI destekli gelişmiş tablo tahminleri
              </p>
            </div>

            {userData?.subscriptionEndDate && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm text-purple-100">Abonelik Bitiş</p>
                <p className="font-semibold">
                  {new Date(
                    userData.subscriptionEndDate.toDate()
                  ).toLocaleDateString("tr-TR")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("analizler");
              setTimeFilter("all");
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === "analizler"
                ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            🤖 Analizler (
            {
              analyses.filter((a) => {
                if (a.type !== "ai") return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const analysisDate = a.date.toDate();
                analysisDate.setHours(0, 0, 0, 0);
                return (
                  analysisDate.getTime() === today.getTime() &&
                  (!a.status || a.status === "pending")
                );
              }).length
            }
            )
          </button>
          <button
            onClick={() => {
              setActiveTab("sonuçlananlar");
              setTimeFilter("all");
              setStatusFilter("all");
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === "sonuçlananlar"
                ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            🎯 Sonuçlananlar (
            {
              analyses.filter(
                (a) =>
                  a.type === "ai" && (a.status === "won" || a.status === "lost")
              ).length
            }
            )
          </button>
        </div>

        {/* Filtreler - Sadece Sonuçlananlar sekmesinde göster */}
        {activeTab === "sonuçlananlar" && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-purple-500/20">
            {/* Zaman Filtreleri */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-purple-400" />
                <p className="text-sm text-purple-400 font-medium">
                  Zaman Aralığı:
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setTimeFilter("1day")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    timeFilter === "1day"
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Son 1 Gün
                </button>
                <button
                  onClick={() => setTimeFilter("1week")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    timeFilter === "1week"
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Son 1 Hafta
                </button>
                <button
                  onClick={() => setTimeFilter("1month")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    timeFilter === "1month"
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Son 1 Ay
                </button>
                <button
                  onClick={() => setTimeFilter("all")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    timeFilter === "all"
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Tümü
                </button>
              </div>
            </div>

            {/* Durum Filtreleri */}
            <div>
              <p className="text-sm text-purple-400 font-medium mb-2">Durum:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    statusFilter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setStatusFilter("won")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    statusFilter === "won"
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  ✓ Kazananlar
                </button>
                <button
                  onClick={() => setStatusFilter("lost")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    statusFilter === "lost"
                      ? "bg-red-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  ✗ Kaybedenler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analizler Sekmesi */}
        {activeTab === "analizler" && (
          <div className="space-y-8">
            {filteredAnalyses.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-16 w-16" />}
                title="Bekleyen AI analizi yok"
                description={
                  timeFilter !== "all"
                    ? "Bu zaman aralığında AI analizi yok."
                    : "Şu anda beklemede olan AI analizi bulunmuyor."
                }
              />
            ) : (
              filteredAnalyses.map((analysis, analysisIndex) => (
                <AIAnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  analysisIndex={analysisIndex}
                  totalCount={filteredAnalyses.length}
                  onImageClick={(url, title) => {
                    setSelectedImage({ url, title });
                    modal.open();
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* Sonuçlananlar Sekmesi */}
        {activeTab === "sonuçlananlar" && (
          <div className="space-y-6">
            {filteredAnalyses.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-16 w-16" />}
                title="Sonuçlanmış AI analizi yok"
                description={
                  timeFilter !== "all" || statusFilter !== "all"
                    ? "Bu filtrelere uygun AI analizi bulunamadı."
                    : "Henüz sonuçlanmış AI analizi bulunmuyor."
                }
              />
            ) : (
              <>
                {/* Kazananlar */}
                {filteredAnalyses.filter((a) => a.status === "won").length >
                  0 && (
                  <div>
                    <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span> Kazananlar (
                      {
                        filteredAnalyses.filter((a) => a.status === "won")
                          .length
                      }
                      )
                    </h3>
                    <div className="space-y-4">
                      {filteredAnalyses
                        .filter((a) => a.status === "won")
                        .map((analysis, index) => (
                          <AIAnalysisCard
                            key={analysis.id}
                            analysis={analysis}
                            analysisIndex={index}
                            totalCount={
                              filteredAnalyses.filter((a) => a.status === "won")
                                .length
                            }
                            onImageClick={(url, title) => {
                              setSelectedImage({ url, title });
                              modal.open();
                            }}
                            showStatusBadge
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Kaybedenler */}
                {filteredAnalyses.filter((a) => a.status === "lost").length >
                  0 && (
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2 mt-8">
                      <span className="text-2xl">❌</span> Kaybedenler (
                      {
                        filteredAnalyses.filter((a) => a.status === "lost")
                          .length
                      }
                      )
                    </h3>
                    <div className="space-y-4">
                      {filteredAnalyses
                        .filter((a) => a.status === "lost")
                        .map((analysis, index) => (
                          <AIAnalysisCard
                            key={analysis.id}
                            analysis={analysis}
                            analysisIndex={index}
                            totalCount={
                              filteredAnalyses.filter(
                                (a) => a.status === "lost"
                              ).length
                            }
                            onImageClick={(url, title) => {
                              setSelectedImage({ url, title });
                              modal.open();
                            }}
                            showStatusBadge
                          />
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            isOpen={modal.isOpen}
            onClose={() => {
              modal.close();
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

// AI Analiz Card Component
interface AIAnalysisCardProps {
  analysis: DailyAnalysis;
  analysisIndex: number;
  totalCount: number;
  onImageClick: (url: string, title: string) => void;
  showStatusBadge?: boolean;
}

function AIAnalysisCard({
  analysis,
  analysisIndex,
  totalCount,
  onImageClick,
  showStatusBadge = false,
}: AIAnalysisCardProps) {
  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300">
      {/* Başlık */}
      <div className="bg-linear-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-purple-500/20">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <Calendar className="h-5 w-5 text-purple-400" />
          <span className="text-sm text-gray-400">
            {new Date(analysis.date.toDate()).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" • "}
            <span className="text-purple-400 font-semibold">
              {new Date(analysis.createdAt.toDate()).toLocaleTimeString(
                "tr-TR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </span>

          {totalCount > 1 && (
            <span className="ml-auto bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold">
              {analysisIndex + 1}/{totalCount}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-white mb-3">
            {analysis.title}
          </h2>

          {/* Status Badge */}
          {showStatusBadge && (
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                analysis.status === "won"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {analysis.status === "won" ? "✓ Kazandı" : "✗ Kaybetti"}
            </span>
          )}
        </div>

        {/* Editör Bilgisi */}
        {analysis.createdByUsername && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-400 font-medium">Editör:</span>
            <span className="inline-flex items-center gap-1.5 bg-linear-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              @{analysis.createdByUsername}
            </span>
          </div>
        )}

        {/* AI TAHMİN TABLOSU */}
        {(analysis.mainChoice || analysis.alternative || analysis.iyGoal) && (
          <div className="mt-4 bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-bold text-purple-300">
                AI Tahminleri
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* Ana Tercih */}
              <div className="bg-gray-900/60 rounded-lg p-3 border border-purple-500/20">
                <p className="text-xs text-purple-400 font-semibold mb-1.5">
                  Ana Tercih
                </p>
                <p className="text-white font-bold text-lg">
                  {analysis.mainChoice || "-"}
                </p>
              </div>

              {/* Alternatif */}
              <div className="bg-gray-900/60 rounded-lg p-3 border border-pink-500/20">
                <p className="text-xs text-pink-400 font-semibold mb-1.5">
                  Alternatif
                </p>
                <p className="text-white font-bold text-lg">
                  {analysis.alternative || "-"}
                </p>
              </div>

              {/* İY Gol */}
              <div className="bg-gray-900/60 rounded-lg p-3 border border-purple-500/20">
                <p className="text-xs text-purple-400 font-semibold mb-1.5">
                  İY Gol
                </p>
                <p className="text-white font-bold text-lg">
                  {analysis.iyGoal || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Açıklama */}
        {analysis.description && (
          <div
            className="text-gray-300 mt-4 prose prose-invert max-w-none"
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{
              __html: analysis.description
                .replace(/\n/g, "<br />")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>"),
            }}
          />
        )}
      </div>

      {/* Görseller */}
      <div className="p-6 space-y-6 bg-linear-to-b from-gray-900 to-gray-950">
        {analysis.imageUrls.map((url, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => onImageClick(url, analysis.title)}
          >
            <div className="absolute -inset-0.5 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
            <Image
              src={url}
              alt={`${analysis.title} - Görsel ${index + 1}`}
              width={1200}
              height={800}
              className="relative w-full h-auto rounded-xl shadow-2xl border border-purple-500/30 group-hover:border-purple-500/70 transition-all duration-300"
              priority={analysisIndex === 0 && index === 0}
            />
            {/* Zoom İkonu */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-xl">
              <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                🔍 Yakınlaştır
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
