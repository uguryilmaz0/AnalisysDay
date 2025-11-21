import { useState } from "react";
import { Upload, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { analysisService } from "@/features/admin/services";
import { useAdminStore } from "@/features/admin/stores";

interface AnalysisUploadTabProps {
  userId: string;
}

export function AnalysisUploadTab({ userId }: AnalysisUploadTabProps) {
  const { showToast } = useToast();
  const loadAnalyses = useAdminStore((state) => state.loadAnalyses);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleUploadAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      showToast("En az bir görsel seçmelisiniz!", "warning");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      // Servis katmanını kullan
      await analysisService.create(title, imageFiles, description, userId);

      setUploadSuccess(true);
      setTitle("");
      setDescription("");
      setImageFiles([]);

      // Store'u güncelle
      await loadAnalyses();

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      showToast("Analiz yüklenemedi!", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Yeni Analiz Yükle</h2>

      {uploadSuccess && (
        <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-400" />
          <p className="text-green-100 font-semibold">
            Analiz başarıyla yüklendi! ✅
          </p>
        </div>
      )}

      <form onSubmit={handleUploadAnalysis} className="space-y-6">
        <Input
          label="Başlık *"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn: 19 Kasım 2025 BIST Analizi"
          required
          fullWidth
        />

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Açıklama (Opsiyonel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-500"
            rows={3}
            placeholder="Kısa bir açıklama ekleyebilirsiniz..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Görsel(ler) * (Birden fazla seçilebilir)
          </label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition bg-gray-800/50">
            <ImageIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
              id="analysis-upload"
              required
            />
            <label htmlFor="analysis-upload" className="cursor-pointer">
              <span className="text-purple-400 hover:text-purple-300 font-semibold text-lg">
                Görsel Seç
              </span>
              <p className="text-gray-400 mt-2">
                PNG, JPG veya JPEG (Birden fazla seçilebilir)
              </p>
            </label>
            {imageFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {imageFiles.map((file, index) => (
                  <p key={index} className="text-sm text-green-400">
                    ✓ {file.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="premium"
          size="lg"
          fullWidth
          loading={uploading}
          icon={<Upload className="h-5 w-5" />}
        >
          Analizi Yükle
        </Button>
      </form>
    </div>
  );
}
