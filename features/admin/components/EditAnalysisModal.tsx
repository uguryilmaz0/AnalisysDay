import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { DailyAnalysis } from "@/types";
import { Button, Input } from "@/shared/components/ui";
import Image from "next/image";

interface EditAnalysisModalProps {
  isOpen: boolean;
  analysis: DailyAnalysis | null;
  onSave: (title: string, description: string) => Promise<void>;
  onClose: () => void;
}

export function EditAnalysisModal({
  isOpen,
  analysis,
  onSave,
  onClose,
}: EditAnalysisModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (analysis) {
      setTitle(analysis.title);
      setDescription(analysis.description || "");
    }
  }, [analysis]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Başlık boş olamaz!");
      return;
    }

    setSaving(true);
    try {
      await onSave(title, description);
      onClose();
    } catch (error) {
      console.error("Kaydetme hatası:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📝 Analizi Düzenle
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Başlık */}
          <Input
            label="Başlık *"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Analiz başlığı"
            required
            fullWidth
          />

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-500"
              rows={6}
              placeholder="Kısa bir açıklama ekleyebilirsiniz..."
            />
          </div>

          {/* Görseller (Sadece Önizleme) */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Görseller (Değiştirilemez)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {analysis.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border border-gray-700"
                >
                  <Image
                    src={url}
                    alt={`Görsel ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Görselleri değiştirmek için yeni bir analiz oluşturmalısınız
            </p>
          </div>

          {/* Meta Bilgiler */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Oluşturan:</span>
              <span className="text-purple-400 font-semibold">
                @{analysis.createdByUsername}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tarih:</span>
              <span className="text-gray-300">
                {new Date(analysis.createdAt.toDate()).toLocaleString("tr-TR")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Durum:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  analysis.status === "pending"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : analysis.status === "won"
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {analysis.status === "pending"
                  ? "Beklemede"
                  : analysis.status === "won"
                  ? "Kazandı ✓"
                  : "Kaybetti ✗"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <Button variant="danger" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
