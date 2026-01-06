import { X, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { PricingPackage } from "@/types";

interface PremiumDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (days: number) => void;
  userEmail: string;
}

export function PremiumDurationModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}: PremiumDurationModalProps) {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  // Paketleri API'den çek
  useEffect(() => {
    if (!isOpen) return;

    const fetchPackages = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/settings/pricing");
        if (response.ok) {
          const result = await response.json();
          // API response: { success: true, data: { packages: [...] } }
          const pkgs = result.data?.packages || result.packages || [];
          setPackages(pkgs);
          // İlk paketi seç
          if (pkgs.length > 0) {
            setSelectedDuration(pkgs[0].days);
          }
        }
      } catch (error) {
        console.error("Paketler yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedDuration) {
      onConfirm(selectedDuration);
      onClose();
    }
  };

  // Gün sayısına göre label oluştur
  const getDurationLabel = (days: number): string => {
    if (days === 1) return "1 Gün";
    if (days === 7) return "1 Hafta";
    if (days === 14 || days === 15) return `${days} Gün`;
    if (days === 30) return "1 Ay";
    if (days === 60) return "2 Ay";
    if (days === 90) return "3 Ay";
    if (days === 180) return "6 Ay";
    if (days === 365) return "1 Yıl";
    return `${days} Gün`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Premium Süre Seçimi</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-6">
            <span className="font-semibold text-white">{userEmail}</span>{" "}
            kullanıcısı için premium süre seçin:
          </p>

          {/* Duration Options */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-400">Paketler yükleniyor...</span>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Henüz paket tanımlanmamış.</p>
              <p className="text-sm mt-2">Admin panelinden paket ekleyin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.days}
                  onClick={() => setSelectedDuration(pkg.days)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedDuration === pkg.days
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {pkg.label || getDurationLabel(pkg.days)}
                        {pkg.isPopular && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            Popüler
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {pkg.days} gün premium erişim • {pkg.price} TL
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedDuration === pkg.days
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-600"
                      }`}
                    >
                      {selectedDuration === pkg.days && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDuration || loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
}
