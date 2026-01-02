import {
  TrendingUp,
  Download,
  Trash2,
  Filter,
  Edit2,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button, EmptyState } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { analysisService } from "@/features/admin/services";
import { useAdminStore } from "@/features/admin/stores";
import { EditAnalysisModal } from "./EditAnalysisModal";
import { DailyAnalysis } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getCompletedAnalyses, getAllAnalyses } from "@/lib/db";

type TimeFilter = "1day" | "1week" | "1month" | "all";
type StatusFilter = "all" | "won" | "lost";
type ViewTab = "pending" | "completed";

interface AnalysisListTabProps {
  analysisType?: "daily" | "ai" | "coupon";
}

export function AnalysisListTab({
  analysisType = "daily",
}: AnalysisListTabProps) {
  const { showToast } = useToast();
  const { userData } = useAuth();

  // ⚡ DİNAMİK PAGİNATİON: Local state ile backend'den sayfa sayfa çek
  const [analyses, setAnalyses] = useState<DailyAnalysis[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);

  const analysisStats = useAdminStore((state) => state.analysisStats);
  const removeAnalysis = useAdminStore((state) => state.removeAnalysis);
  const [activeTab, setActiveTab] = useState<ViewTab>("pending");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1day");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editModal, setEditModal] = useState<{
    open: boolean;
    analysis: DailyAnalysis | null;
  }>({ open: false, analysis: null });

  // ⚡ DİNAMİK PAGİNATİON: Backend'den sayfa sayfa çek
  const loadAnalysesPaginated = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "pending") {
        // Pending analizler için getAllAnalyses kullan (genellikle az veri)
        const allAnalyses = await getAllAnalyses();
        const filteredPending = allAnalyses
          .filter((a) => (a.type || "daily") === analysisType)
          .filter((a) => !a.status || a.status === "pending");

        setAnalyses(filteredPending);
        setHasMore(false); // Pending'de pagination yok, az veri
      } else {
        // Completed analizler için dinamik pagination
        const currentCursor = cursorStack[currentPage - 1];
        const data = await getCompletedAnalyses(
          analysisType,
          statusFilter,
          currentPage,
          itemsPerPage,
          currentCursor
        );

        setAnalyses(data.analyses);
        setHasMore(data.hasMore);

        // Yeni cursor'u stack'e ekle
        if (data.lastDocId && currentPage === cursorStack.length) {
          setCursorStack((prev) => [...prev, data.lastDocId]);
        }
      }
    } catch (error) {
      console.error("❌ Analizler yüklenemedi:", error);
      showToast("Analizler yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    analysisType,
    statusFilter,
    currentPage,
    cursorStack,
    showToast,
  ]);

  // Tab veya filtre değişiminde veriyi yenile
  useEffect(() => {
    setCurrentPage(1);
    setCursorStack([undefined]);
    loadAnalysesPaginated();
  }, [activeTab, analysisType, statusFilter]);

  // Sayfa değişiminde yükle
  useEffect(() => {
    if (activeTab === "completed") {
      loadAnalysesPaginated();
    }
  }, [currentPage, loadAnalysesPaginated, activeTab]);

  // Pagination handler
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Client-side filtering sadece zaman filtresi için (status filter backend'de yapılıyor)
  const filteredAnalyses = useMemo(() => {
    let result = analyses;

    // Zaman filtrelemesi (client-side)
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
        // Completed tab'de resultConfirmedAt, pending tab'de date kullan
        const dateToCheck =
          activeTab === "completed" && analysis.resultConfirmedAt
            ? analysis.resultConfirmedAt.toDate()
            : analysis.date.toDate();
        return dateToCheck >= cutoffDate!;
      });
    }

    return result;
  }, [analyses, timeFilter, activeTab]);

  // Gösterilecek analizler (pending'de tümü, completed'da paginated)
  const displayedAnalyses =
    activeTab === "pending" ? filteredAnalyses : filteredAnalyses;

  const handleDownloadImage = (url: string, index: number) => {
    analysisService.downloadImage(url, index);
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm("Bu analizi silmek istediğinizden emin misiniz?")) return;

    try {
      // 🔄 OPTIMISTIC UPDATE: Önce local state'den kaldır
      setAnalyses((prev) => prev.filter((a) => a.id !== id));

      // Sonra backend'i güncelle
      await removeAnalysis(id);
      showToast("Analiz başarıyla silindi!", "success");
    } catch {
      // Hata durumunda yeniden yükle
      await loadAnalysesPaginated();
      showToast("Analiz silinemedi!", "error");
    }
  };

  const handleEditOpen = (analysis: DailyAnalysis) => {
    setEditModal({ open: true, analysis });
  };

  const handleEditClose = () => {
    setEditModal({ open: false, analysis: null });
  };

  const handleEditSave = async (title: string, description: string) => {
    if (!editModal.analysis) return;

    try {
      await analysisService.update(editModal.analysis.id, title, description);

      // 🔄 OPTIMISTIC UPDATE: Local state'i güncelle
      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === editModal.analysis!.id ? { ...a, title, description } : a
        )
      );

      showToast("Analiz başarıyla güncellendi!", "success");
    } catch {
      showToast("Analiz güncellenemedi!", "error");
      throw new Error("Update failed");
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "pending" | "won" | "lost"
  ) => {
    if (!userData?.uid) return;

    const statusText =
      status === "won"
        ? "Kazandı"
        : status === "lost"
        ? "Kaybetti"
        : "Beklemede";

    if (
      !confirm(`Bu analizi "${statusText}" olarak işaretlemek istiyor musunuz?`)
    )
      return;

    try {
      await analysisService.updateStatus(id, status, userData.uid);

      // 🔄 OPTIMISTIC UPDATE: Local state'i güncelle
      setAnalyses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );

      showToast(`Analiz "${statusText}" olarak güncellendi!`, "success");
    } catch {
      showToast("Durum güncellenemedi!", "error");
    }
  };

  return (
    <div>
      {/* Edit Modal */}
      <EditAnalysisModal
        isOpen={editModal.open}
        analysis={editModal.analysis}
        onSave={handleEditSave}
        onClose={handleEditClose}
      />

      {/* Tab Seçimi - Kuponlar için gül gösterme */}
      {analysisType !== "coupon" && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("pending");
              setTimeFilter("1day");
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === "pending"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            ⏳ Bekleyen Analizler (
            {analysisType === "daily"
              ? analysisStats.dailyPending
              : analysisStats.aiPending}
            )
          </button>
          <button
            onClick={() => {
              setActiveTab("completed");
              setTimeFilter("1day");
              setStatusFilter("all");
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === "completed"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            ✓ Sonuçlananlar (
            {analysisType === "daily"
              ? analysisStats.dailyWon + analysisStats.dailyLost
              : analysisStats.aiWon + analysisStats.aiLost}
            )
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">
          {analysisType === "coupon"
            ? "🎫 Kuponlar"
            : `${activeTab === "pending" ? "Bekleyen" : "Sonuçlanan"} ${
                analysisType === "ai" ? "Yapay Zeka" : "Günlük"
              } Analizler`}{" "}
          ({filteredAnalyses.length})
        </h2>

        {/* Filtre Butonları */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-5 w-5 text-gray-400 shrink-0" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTimeFilter("1day")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                timeFilter === "1day"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Son 1 Gün
            </button>
            <button
              onClick={() => setTimeFilter("1week")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                timeFilter === "1week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Son 1 Hafta
            </button>
            <button
              onClick={() => setTimeFilter("1month")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                timeFilter === "1month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Son 1 Ay
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                timeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Tümü
            </button>
          </div>
        </div>
      </div>

      {/* Durum Filtreleri (sadece Sonuçlananlar tab'inde) */}
      {activeTab === "completed" && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm text-gray-400 font-medium shrink-0">
            Durum:
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                statusFilter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter("won")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                statusFilter === "won"
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              ✓ Kazananlar
            </button>
            <button
              onClick={() => setStatusFilter("lost")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                statusFilter === "lost"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              ✗ Kaybedenler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Analizler yükleniyor...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-16 w-16" />}
          title={`${
            analysisType === "ai" ? "Yapay Zeka" : "Günlük"
          } Analiz bulunamadı`}
          description={
            timeFilter !== "all"
              ? "Bu zaman aralığında analiz yok. Farklı bir filtre deneyin."
              : `Henüz ${
                  analysisType === "ai" ? "yapay zeka" : "günlük"
                } analiz yüklenmemiş.`
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Başlık
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Tarih & Saat
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Editör
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Görsel Sayısı
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Önizleme
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {displayedAnalyses.map((analysis) => (
                <tr key={analysis.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-semibold">
                        {analysis.title}
                      </p>
                      {analysis.description && (
                        <div
                          className="text-sm text-gray-400 line-clamp-2 mt-1"
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
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <div>
                      {new Date(analysis.date.toDate()).toLocaleDateString(
                        "tr-TR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                      <br />
                      <span className="text-blue-400 font-semibold">
                        {new Date(
                          analysis.createdAt.toDate()
                        ).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="space-y-1">
                      {analysis.createdByUsername && (
                        <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs font-semibold">
                          @{analysis.createdByUsername}
                        </span>
                      )}
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                            analysis.status === "pending"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : analysis.status === "won"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {analysis.status === "pending"
                            ? "⏳ Beklemede"
                            : analysis.status === "won"
                            ? "✓ Kazandı"
                            : "✗ Kaybetti"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {analysis.imageUrls.length} görsel
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {analysis.imageUrls.slice(0, 3).map((url, index) => (
                        <Image
                          key={index}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          width={60}
                          height={45}
                          className="rounded object-cover w-15 h-11"
                        />
                      ))}
                      {analysis.imageUrls.length > 3 && (
                        <div className="w-15 h-11 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
                          +{analysis.imageUrls.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {/* Düzenle */}
                      <Button
                        onClick={() => handleEditOpen(analysis)}
                        variant="primary"
                        size="sm"
                        title="Düzenle"
                        className="p-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {/* Status Butonları - Sadece pending tab'de göster */}
                      {activeTab === "pending" && (
                        <>
                          <Button
                            onClick={() =>
                              handleStatusUpdate(analysis.id, "won")
                            }
                            size="sm"
                            title="Kazandı olarak işaretle"
                            className="p-2 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>

                          <Button
                            onClick={() =>
                              handleStatusUpdate(analysis.id, "lost")
                            }
                            size="sm"
                            title="Kaybetti olarak işaretle"
                            className="p-2 bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Reset Butonu - Sadece completed tab'de göster */}
                      {activeTab === "completed" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(analysis.id, "pending")
                          }
                          size="sm"
                          title="Beklemede durumuna al"
                          className="p-2 bg-yellow-600 hover:bg-yellow-700"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Download butonları */}
                      {analysis.imageUrls.slice(0, 2).map((url, index) => (
                        <Button
                          key={index}
                          onClick={() => handleDownloadImage(url, index)}
                          variant="primary"
                          size="sm"
                          title={`Görsel ${index + 1} İndir`}
                          className="p-2"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      ))}

                      {/* Sil */}
                      <Button
                        onClick={() => handleDeleteAnalysis(analysis.id)}
                        variant="danger"
                        size="sm"
                        title="Analizi Sil"
                        className="p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination - Sadece completed tab'de ve hasMore varsa */}
          {activeTab === "completed" && (currentPage > 1 || hasMore) && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                ← Önceki
              </button>
              <span className="px-4 py-2 bg-gray-900 text-gray-300 rounded-lg">
                Sayfa {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Sonraki →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
