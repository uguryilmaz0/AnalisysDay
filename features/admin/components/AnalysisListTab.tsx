import { TrendingUp, Download, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button, EmptyState } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { analysisService } from "@/features/admin/services";
import { useAdminStore } from "@/features/admin/stores";

export function AnalysisListTab() {
  const { showToast } = useToast();
  const analyses = useAdminStore((state) => state.analyses);
  const removeAnalysis = useAdminStore((state) => state.removeAnalysis);

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Son 7 Analiz</h2>

      {analyses.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-16 w-16" />}
          title="Henüz analiz yüklenmemiş"
          description="İlk analizi yüklemek için 'Analiz Yükle' sekmesine gidin."
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
                  Tarih
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
              {analyses.slice(0, 7).map((analysis) => (
                <tr key={analysis.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-semibold">
                        {analysis.title}
                      </p>
                      {analysis.description && (
                        <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                          {analysis.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(analysis.date.toDate()).toLocaleDateString(
                      "tr-TR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
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
                    <div className="flex gap-2">
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
                        className="p-2 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
