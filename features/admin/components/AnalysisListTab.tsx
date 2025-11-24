import {
  TrendingUp,
  Download,
  Trash2,
  Filter,
  Edit2,
  Save,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Button, EmptyState } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { analysisService } from "@/features/admin/services";
import { useAdminStore } from "@/features/admin/stores";

type TimeFilter = "1day" | "1week" | "1month" | "all";

export function AnalysisListTab() {
  const { showToast } = useToast();
  const analyses = useAdminStore((state) => state.analyses);
  const removeAnalysis = useAdminStore((state) => state.removeAnalysis);
  const loadAnalyses = useAdminStore((state) => state.loadAnalyses);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1day");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Filtrelenmiş analizler
  const filteredAnalyses = useMemo(() => {
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
      case "all":
      default:
        return analyses;
    }

    return analyses.filter((analysis) => {
      const analysisDate = analysis.date.toDate();
      return analysisDate >= cutoffDate;
    });
  }, [analyses, timeFilter]);

  const handleDownloadImage = (url: string, index: number) => {
    analysisService.downloadImage(url, index);
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm("Bu analizi silmek istediğinizden emin misiniz?")) return;

    try {
      await removeAnalysis(id);
      showToast("Analiz başarıyla silindi!", "success");
    } catch {
      showToast("Analiz silinemedi!", "error");
    }
  };

  const handleEditStart = (id: string, title: string, description: string) => {
    setEditingId(id);
    setEditTitle(title);
    setEditDescription(description || "");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleEditSave = async (id: string) => {
    if (!editTitle.trim()) {
      showToast("Başlık boş olamaz!", "warning");
      return;
    }

    try {
      await analysisService.update(id, editTitle, editDescription);
      await loadAnalyses();
      showToast("Analiz başarıyla güncellendi!", "success");
      handleEditCancel();
    } catch {
      showToast("Analiz güncellenemedi!", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Analizler ({filteredAnalyses.length})
        </h2>

        {/* Filtre Butonları */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setTimeFilter("1day")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                timeFilter === "1day"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Son 1 Gün
            </button>
            <button
              onClick={() => setTimeFilter("1week")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                timeFilter === "1week"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Son 1 Hafta
            </button>
            <button
              onClick={() => setTimeFilter("1month")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                timeFilter === "1month"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Son 1 Ay
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                timeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Tümü
            </button>
          </div>
        </div>
      </div>

      {filteredAnalyses.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-16 w-16" />}
          title="Analiz bulunamadı"
          description={
            timeFilter !== "all"
              ? "Bu zaman aralığında analiz yok. Farklı bir filtre deneyin."
              : "Henüz analiz yüklenmemiş."
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
              {filteredAnalyses.map((analysis) => (
                <tr key={analysis.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    {editingId === analysis.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="Başlık"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="Açıklama (opsiyonel)"
                          rows={3}
                        />
                      </div>
                    ) : (
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
                                .replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>"
                                )
                                .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                            }}
                          />
                        )}
                      </div>
                    )}
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
                    {analysis.createdByUsername && (
                      <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs font-semibold">
                        @{analysis.createdByUsername}
                      </span>
                    )}
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
                    <div className="flex gap-2 flex-wrap">
                      {editingId === analysis.id ? (
                        <>
                          <Button
                            onClick={() => handleEditSave(analysis.id)}
                            variant="primary"
                            size="sm"
                            title="Kaydet"
                            className="p-2"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={handleEditCancel}
                            variant="danger"
                            size="sm"
                            title="İptal"
                            className="p-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() =>
                              handleEditStart(
                                analysis.id,
                                analysis.title,
                                analysis.description || ""
                              )
                            }
                            variant="primary"
                            size="sm"
                            title="Düzenle"
                            className="p-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {analysis.imageUrls.map((url, index) => (
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
                          <Button
                            onClick={() => handleDeleteAnalysis(analysis.id)}
                            variant="danger"
                            size="sm"
                            title="Analizi Sil"
                            className="p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
