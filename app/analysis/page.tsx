"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getPendingAnalyses,
  getAnalysisStats,
  getCompletedAnalyses,
  AnalysisStats,
} from "@/lib/db";
import { DailyAnalysis } from "@/types";
import { Lock, Calendar, AlertCircle, TrendingUp, Filter } from "lucide-react";
import Link from "next/link";
import { WatermarkImage } from "@/components/WatermarkImage";
import ImageModal from "@/components/ImageModal";
import { LoadingSpinner, EmptyState, Button } from "@/shared/components/ui";
import { useRequireAuth, usePermissions, useModal } from "@/shared/hooks";

type AnalysisTab = "analizler" | "sonuçlananlar";
type StatusFilter = "all" | "won" | "lost";

export default function AnalysisPage() {
  const { userData, loading: authLoading } = useRequireAuth({
    requireEmailVerified: true,
  });
  const { hasPremiumAccess } = usePermissions();
  const [analyses, setAnalyses] = useState<DailyAnalysis[]>([]);

  // Completed analyses (unified list)
  const [completedAnalyses, setCompletedAnalyses] = useState<DailyAnalysis[]>(
    []
  );
  const [completedHasMore, setCompletedHasMore] = useState(false);
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  // Cursor stack for pagination (her sayfa için son doküman ID)
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);

  const [analysisStats, setAnalysisStats] = useState<AnalysisStats>({
    dailyPending: 0,
    dailyWon: 0,
    dailyLost: 0,
    aiPending: 0,
    aiWon: 0,
    aiLost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("analizler");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Pagination for completed analyses (unified)
  const [completedPage, setCompletedPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
    analysis: DailyAnalysis;
    imageIndex: number;
  } | null>(null);
  const modal = useModal();

  // Track image view
  const trackImageView = useCallback(
    async (
      type: "view" | "right_click" | "screenshot",
      analysis: DailyAnalysis,
      imageUrl: string,
      imageIndex: number
    ) => {
      if (!userData) {
        console.warn("trackImageView: No user data available");
        return;
      }

      try {
        console.log("📊 Tracking image interaction:", {
          type,
          imageIndex,
          analysisId: analysis.id,
        });

        const response = await fetch("/api/track/image-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            userId: userData.uid,
            userEmail: userData.email,
            userName:
              userData.username || `${userData.firstName} ${userData.lastName}`,
            analysisId: analysis.id,
            analysisTitle: analysis.title,
            imageUrl,
            imageIndex,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn("⚠️ Track API failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
        } else {
          const data = await response.json();
          console.log("✅ Tracking successful:", data);
        }
      } catch (error) {
        console.error("❌ Failed to track image view:", error);
      }
    },
    [userData]
  );

  // Filtrelenmiş analizler
  const filteredAnalyses = useMemo(() => {
    let result = analyses;

    // SADECE GÜNLÜK ANALİZLERİ FİLTRELE (AI analizleri gösterme)
    result = result.filter((a) => (a.type || "daily") === "daily");

    // Tab filtrelemesi
    if (activeTab === "analizler") {
      // Analizler tab: Sadece pending (bekleyen) analizleri göster
      result = result.filter((a) => !a.status || a.status === "pending");
    } else {
      // Sonuçlananlar tab: Tüm kazanan/kaybeden analizler (backend'den gelecek)
      result = result.filter((a) => a.status === "won" || a.status === "lost");
    }

    return result;
  }, [analyses, activeTab]);

  const loadCompletedAnalyses = useCallback(async () => {
    setLoadingCompleted(true);
    try {
      // Mevcut sayfanın cursor'unu al (sayfa 1 için undefined, sayfa 2+ için önceki sayfa cursor'u)
      const currentCursor = cursorStack[completedPage - 1];

      const data = await getCompletedAnalyses(
        "daily",
        statusFilter,
        completedPage,
        itemsPerPage,
        currentCursor
      );
      setCompletedAnalyses(data.analyses);
      setCompletedHasMore(data.hasMore);

      // Yeni cursor'u stack'e ekle (sonraki sayfa için)
      if (data.lastDocId && completedPage === cursorStack.length) {
        setCursorStack((prev) => [...prev, data.lastDocId]);
      }
    } catch (error) {
      console.error("❌ Sonuçlanan analizler yüklenemedi:", error);
    } finally {
      setLoadingCompleted(false);
    }
  }, [statusFilter, completedPage, cursorStack]);

  // Load completed analyses when tab or page changes
  useEffect(() => {
    if (activeTab === "sonuçlananlar" && hasPremiumAccess) {
      loadCompletedAnalyses();
    }
  }, [
    activeTab,
    completedPage,
    statusFilter,
    hasPremiumAccess,
    loadCompletedAnalyses,
  ]);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      // ⚠️ Abonelik kontrolü KALDIRILDI - AuthContext zaten kontrol ediyor
      // Gereksiz Firestore read'i önlenir

      // Premium erişimi varsa analiz çek
      if (hasPremiumAccess) {
        try {
          // ⚡ OPTİMİZE: Sadece son 3 günün pending analizlerini çek (10-30 read)
          const [pendingAnalyses, stats] = await Promise.all([
            getPendingAnalyses("daily", 3), // Son 3 gün (cron 3 gün sonra siliyor)
            getAnalysisStats(),
          ]);
          setAnalyses(pendingAnalyses);
          setAnalysisStats(stats);
        } catch {
          // Analiz yüklenemedi - kullanıcı kilit ekranını görüyor
        }
      }

      setLoading(false);
    };

    loadData();
  }, [authLoading, hasPremiumAccess]);

  // Loading state
  if (authLoading || loading) {
    return <LoadingSpinner fullScreen size="xl" text="Analiz yükleniyor..." />;
  }

  // Premium erişimi yoksa - KİLİT EKRANI
  if (!hasPremiumAccess) {
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

            {userData?.subscriptionEndDate && (
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

        {/* Sekmeler */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("analizler");
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === "analizler"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            📊 Analizler ({analysisStats.dailyPending})
          </button>
          <button
            onClick={() => {
              setActiveTab("sonuçlananlar");
              setStatusFilter("all");
              setCompletedPage(1);
              setCursorStack([undefined]);
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === "sonuçlananlar"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            🎯 Sonuçlananlar ({analysisStats.dailyWon + analysisStats.dailyLost}
            )
          </button>
        </div>

        {/* Filtreler - Sadece Sonuçlananlar sekmesinde göster */}
        {activeTab === "sonuçlananlar" && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            {/* Durum Filtreleri */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-400 font-medium">Durum:</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setCompletedPage(1);
                    setCursorStack([undefined]);
                  }}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    statusFilter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Tümü ({analysisStats.dailyWon + analysisStats.dailyLost})
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("won");
                    setCompletedPage(1);
                    setCursorStack([undefined]);
                  }}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    statusFilter === "won"
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  ✓ Kazananlar ({analysisStats.dailyWon})
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("lost");
                    setCompletedPage(1);
                    setCursorStack([undefined]);
                  }}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    statusFilter === "lost"
                      ? "bg-red-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  ✗ Kaybedenler ({analysisStats.dailyLost})
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
                icon={<TrendingUp className="h-16 w-16" />}
                title="Bekleyen analiz yok"
                description="Şu anda beklemede olan analiz bulunmuyor."
              />
            ) : (
              filteredAnalyses.map((analysis, analysisIndex) => (
                <AnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  analysisIndex={analysisIndex}
                  totalCount={filteredAnalyses.length}
                  userData={userData}
                  onImageClick={(url, title, imageIndex) => {
                    trackImageView("view", analysis, url, imageIndex);
                    setSelectedImage({ url, title, analysis, imageIndex });
                    modal.open();
                  }}
                  onImageRightClick={(url, imageIndex) => {
                    trackImageView("right_click", analysis, url, imageIndex);
                  }}
                  onScreenshotDetected={(url, imageIndex) => {
                    trackImageView("screenshot", analysis, url, imageIndex);
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* Sonuçlananlar Sekmesi */}
        {activeTab === "sonuçlananlar" && (
          <div className="space-y-6">
            {loadingCompleted ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Sonuçlar yükleniyor..." />
              </div>
            ) : completedAnalyses.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="h-16 w-16" />}
                title="Sonuçlanmış analiz yok"
                description={
                  statusFilter !== "all"
                    ? "Bu filtreye uygun analiz bulunamadı."
                    : "Henüz sonuçlanmış analiz bulunmuyor."
                }
              />
            ) : (
              <>
                <div className="space-y-4">
                  {completedAnalyses.map((analysis, index) => (
                    <AnalysisCard
                      key={analysis.id}
                      analysis={analysis}
                      analysisIndex={(completedPage - 1) * itemsPerPage + index}
                      userData={userData}
                      onImageClick={(url, title, imageIndex) => {
                        trackImageView("view", analysis, url, imageIndex);
                        setSelectedImage({
                          url,
                          title,
                          analysis,
                          imageIndex,
                        });
                        modal.open();
                      }}
                      onImageRightClick={(url, imageIndex) => {
                        trackImageView(
                          "right_click",
                          analysis,
                          url,
                          imageIndex
                        );
                      }}
                      onScreenshotDetected={(url, imageIndex) => {
                        trackImageView("screenshot", analysis, url, imageIndex);
                      }}
                      showStatusBadge
                    />
                  ))}
                </div>

                {/* Pagination */}
                {(completedPage > 1 || completedHasMore) && (
                  <div className="flex flex-col items-center gap-2 mt-6">
                    <div className="text-sm text-gray-400">
                      Toplam:{" "}
                      {statusFilter === "all"
                        ? analysisStats.dailyWon + analysisStats.dailyLost
                        : statusFilter === "won"
                        ? analysisStats.dailyWon
                        : analysisStats.dailyLost}{" "}
                      sonuç
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCompletedPage((p) => Math.max(1, p - 1))
                        }
                        disabled={completedPage === 1}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                      >
                        ← Önceki
                      </button>
                      <span className="px-4 py-2 bg-gray-900 text-gray-300 rounded-lg">
                        Sayfa {completedPage}
                      </span>
                      <button
                        onClick={() => setCompletedPage((p) => p + 1)}
                        disabled={!completedHasMore}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                      >
                        Sonraki →
                      </button>
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
            onScreenshotDetected={() => {
              trackImageView(
                "screenshot",
                selectedImage.analysis,
                selectedImage.url,
                selectedImage.imageIndex
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

// Analiz Card Component
interface AnalysisCardProps {
  analysis: DailyAnalysis;
  analysisIndex: number;
  totalCount?: number;
  userData: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  onImageClick: (url: string, title: string, imageIndex: number) => void;
  onImageRightClick: (url: string, imageIndex: number) => void;
  onScreenshotDetected: (url: string, imageIndex: number) => void;
  showStatusBadge?: boolean;
}

function AnalysisCard({
  analysis,
  analysisIndex,
  totalCount,
  userData,
  onImageClick,
  onImageRightClick,
  onScreenshotDetected,
  showStatusBadge = false,
}: AnalysisCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden hover:border-gray-700 transition-all duration-300">
      {/* Başlık */}
      <div className="bg-linear-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <Calendar className="h-5 w-5 text-blue-400" />
          <span className="text-sm text-gray-400">
            {new Date(analysis.date.toDate()).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" • "}
            <span className="text-blue-400 font-semibold">
              {new Date(analysis.createdAt.toDate()).toLocaleTimeString(
                "tr-TR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </span>

          {totalCount && totalCount > 1 && (
            <span className="ml-auto bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
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
          <div className="flex items-center gap-2 mb-2">
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

        {analysis.description && (
          <div
            className="text-gray-400 mt-2 prose prose-invert max-w-none"
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
          <WatermarkImage
            key={index}
            src={url}
            alt={`${analysis.title} - Görsel ${index + 1}`}
            width={1200}
            height={800}
            className="cursor-pointer"
            priority={analysisIndex === 0 && index === 0}
            imageIndex={index}
            userEmail={userData?.email || "Unknown"}
            userName={
              userData?.username ||
              `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim()
            }
            onImageClick={() => onImageClick(url, analysis.title, index)}
            onRightClick={() => onImageRightClick(url, index)}
            onScreenshotDetected={() => onScreenshotDetected(url, index)}
            disableRightClick={true}
          />
        ))}
      </div>
    </div>
  );
}
