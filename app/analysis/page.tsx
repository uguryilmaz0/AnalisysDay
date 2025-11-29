"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllAnalyses, checkSubscriptionExpiry } from "@/lib/db";
import { DailyAnalysis } from "@/types";
import { Lock, Calendar, AlertCircle, TrendingUp, Filter } from "lucide-react";
import Link from "next/link";
import { WatermarkImage } from "@/components/WatermarkImage";
import ImageModal from "@/components/ImageModal";
import { LoadingSpinner, EmptyState, Button } from "@/shared/components/ui";
import { useRequireAuth, usePermissions, useModal } from "@/shared/hooks";

type AnalysisTab = "analizler" | "sonuçlananlar";
type TimeFilter = "1day" | "1week" | "1month" | "all";
type StatusFilter = "all" | "won" | "lost";

export default function AnalysisPage() {
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
          console.error("❌ Track API failed:", {
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
      // Sonuçlananlar tab: Tüm kazanan/kaybeden analizler
      result = result.filter((a) => a.status === "won" || a.status === "lost");

      // Status filter (sadece completed tab'de)
      if (statusFilter !== "all") {
        result = result.filter((a) => a.status === statusFilter);
      }

      // Zaman filtrelemesi (Sadece sonuçlananlar için, resultConfirmedAt kullan)
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
          // Sonuçlanma tarihini kullan, yoksa date kullan
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

        // Eğer abonelik dolmuşsa userData'yı yenile
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
          // Analiz yüklenemedi - kullanıcı kilit ekranını görüyor
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
              setTimeFilter("all");
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === "analizler"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            📊 Analizler (
            {
              analyses.filter(
                (a) =>
                  (a.type || "daily") === "daily" &&
                  (!a.status || a.status === "pending")
              ).length
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
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            🎯 Sonuçlananlar (
            {
              analyses.filter((a) => a.status === "won" || a.status === "lost")
                .length
            }
            )
          </button>
        </div>

        {/* Filtreler - Sadece Sonuçlananlar sekmesinde göster */}
        {activeTab === "sonuçlananlar" && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            {/* Zaman Filtreleri */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-400 font-medium">
                  Zaman Aralığı:
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setTimeFilter("1day")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    timeFilter === "1day"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Son 1 Gün
                </button>
                <button
                  onClick={() => setTimeFilter("1week")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    timeFilter === "1week"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Son 1 Hafta
                </button>
                <button
                  onClick={() => setTimeFilter("1month")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    timeFilter === "1month"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Son 1 Ay
                </button>
                <button
                  onClick={() => setTimeFilter("all")}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                    timeFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Tümü
                </button>
              </div>
            </div>

            {/* Durum Filtreleri */}
            <div>
              <p className="text-sm text-gray-400 font-medium mb-2">Durum:</p>
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
                icon={<TrendingUp className="h-16 w-16" />}
                title="Bekleyen analiz yok"
                description={
                  timeFilter !== "all"
                    ? "Bu zaman aralığında analiz yok."
                    : "Şu anda beklemede olan analiz bulunmuyor."
                }
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
            {filteredAnalyses.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="h-16 w-16" />}
                title="Sonuçlanmış analiz yok"
                description={
                  timeFilter !== "all" || statusFilter !== "all"
                    ? "Bu filtrelere uygun analiz bulunamadı."
                    : "Henüz sonuçlanmış analiz bulunmuyor."
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
                          <AnalysisCard
                            key={analysis.id}
                            analysis={analysis}
                            analysisIndex={index}
                            totalCount={
                              filteredAnalyses.filter((a) => a.status === "won")
                                .length
                            }
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
                              trackImageView(
                                "screenshot",
                                analysis,
                                url,
                                imageIndex
                              );
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
                          <AnalysisCard
                            key={analysis.id}
                            analysis={analysis}
                            analysisIndex={index}
                            totalCount={
                              filteredAnalyses.filter(
                                (a) => a.status === "lost"
                              ).length
                            }
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
                              trackImageView(
                                "screenshot",
                                analysis,
                                url,
                                imageIndex
                              );
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
  totalCount: number;
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

          {totalCount > 1 && (
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
