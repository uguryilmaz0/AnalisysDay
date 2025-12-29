import { X } from "lucide-react";
import { useState } from "react";

interface PremiumDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (days: number) => void;
  userEmail: string;
}

type DurationOption = {
  label: string;
  days: number;
  description: string;
};

const DURATION_OPTIONS: DurationOption[] = [
  {
    label: "15 Gün",
    days: 15,
    description: "15 gün premium erişim",
  },
  {
    label: "1 Ay",
    days: 30,
    description: "30 gün premium erişim",
  },
];

export function PremiumDurationModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}: PremiumDurationModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedDuration);
    onClose();
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
          <div className="space-y-3">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.days}
                onClick={() => setSelectedDuration(option.days)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedDuration === option.days
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedDuration === option.days
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-600"
                    }`}
                  >
                    {selectedDuration === option.days && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
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
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
}
