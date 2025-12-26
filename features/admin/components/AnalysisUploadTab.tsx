import { useState } from "react";
import { Upload, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { analysisService } from "@/features/admin/services";
import { useAdminStore } from "@/features/admin/stores";

interface AnalysisUploadTabProps {
  userId: string;
}

type AnalysisType = "daily" | "ai" | "coupon";

export function AnalysisUploadTab({ userId }: AnalysisUploadTabProps) {
  const { showToast } = useToast();
  const loadAnalyses = useAdminStore((state) => state.loadAnalyses);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("daily");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ideal, setIdeal] = useState("");
  const [alternative, setAlternative] = useState("");
  const [possibleScore, setPossibleScore] = useState("");
  const [percentage, setPercentage] = useState("");
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

    // Yapay zeka analizi için ek validasyon
    if (analysisType === "ai") {
      if (!ideal || !alternative || !possibleScore || !percentage) {
        showToast(
          "Yapay zeka analizi için tüm tahmin alanlarını doldurun!",
          "warning"
        );
        return;
      }
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      // Servis katmanını kullan
      await analysisService.create(
        title,
        imageFiles,
        description,
        userId,
        analysisType,
        ideal,
        alternative,
        possibleScore,
        percentage
      );

      setUploadSuccess(true);
      setTitle("");
      setDescription("");
      setIdeal("");
      setAlternative("");
      setPossibleScore("");
      setPercentage("");
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
        {/* Analiz Tipi Seçici */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Analiz Tipi *
          </label>
          <div className="flex gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setAnalysisType("daily")}
              className={`flex-1 min-w-[140px] py-3 px-6 rounded-lg font-semibold transition ${
                analysisType === "daily"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
              }`}
            >
              📊 Günlük Analiz
            </button>
            <button
              type="button"
              onClick={() => setAnalysisType("coupon")}
              className={`flex-1 min-w-[140px] py-3 px-6 rounded-lg font-semibold transition ${
                analysisType === "coupon"
                  ? "bg-linear-to-r from-yellow-600 to-orange-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
              }`}
            >
              🎫 Günün Kuponu
            </button>
            <button
              type="button"
              onClick={() => setAnalysisType("ai")}
              className={`flex-1 min-w-[140px] py-3 px-6 rounded-lg font-semibold transition ${
                analysisType === "ai"
                  ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
              }`}
            >
              🤖 Yapay Zeka Analizi
            </button>
          </div>
          {analysisType === "coupon" && (
            <p className="text-xs text-yellow-400 mt-2">
              ⏰ Kuponlar eklenme zamanından 24 saat sonra otomatik silinir.
            </p>
          )}
        </div>

        <Input
          label="Başlık *"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            analysisType === "daily"
              ? "Örn: 19 Kasım 2025 BIST Analizi"
              : analysisType === "coupon"
              ? "Örn: Fenerbahçe - Galatasaray Maçı"
              : "Örn: Chelsea - Arsenal Maç Analizi"
          }
          required
          fullWidth
        />

        {/* Yapay Zeka Analizi için özel alanlar */}
        {analysisType === "ai" && (
          <div className="bg-linear-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-purple-300 mb-4">
              🎯 Tahmin Tablosu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="İdeal *"
                type="text"
                value={ideal}
                onChange={(e) => setIdeal(e.target.value)}
                placeholder="Örn: Chelsea Kazanır"
                maxLength={30}
                fullWidth
              />
              <Input
                label="Alternatif *"
                type="text"
                value={alternative}
                onChange={(e) => setAlternative(e.target.value)}
                placeholder="Örn: Beraberlik"
                maxLength={30}
                fullWidth
              />
              <Input
                label="Olası Skor *"
                type="text"
                value={possibleScore}
                onChange={(e) => setPossibleScore(e.target.value)}
                placeholder="Örn: 2-1 veya 1-0"
                maxLength={30}
                fullWidth
              />
              <Input
                label="Yüzde *"
                type="text"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="Örn: %75 veya 75%"
                maxLength={30}
                fullWidth
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * Her alan en fazla 30 karakter olabilir
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Açıklama {analysisType === "ai" ? "*" : "(Opsiyonel)"}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-500"
            rows={3}
            placeholder="Kısa bir açıklama ekleyebilirsiniz..."
            required={analysisType === "ai"}
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
