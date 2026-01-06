"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Save,
  Plus,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button, Card } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { authFetch } from "@/lib/authFetch";
import type { PricingPackage } from "@/types";

interface PricingSettingsTabProps {
  isSuperAdmin: boolean;
}

export function PricingSettingsTab({ isSuperAdmin }: PricingSettingsTabProps) {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Fiyat paketlerini yükle
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        const response = await authFetch("/api/admin/settings");
        const data = await response.json();

        if (data.success && data.data?.packages) {
          setPackages(data.data.packages);
        }
      } catch (error) {
        console.error("Paketler yüklenemedi:", error);
        showToast("Paketler yüklenemedi", "error");
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [showToast]);

  // Paket güncelle
  const updatePackage = (
    index: number,
    field: keyof PricingPackage,
    value: string | number | boolean
  ) => {
    const newPackages = [...packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setPackages(newPackages);
  };

  // Yeni paket ekle
  const addPackage = () => {
    setPackages([
      ...packages,
      { days: 7, price: 100, label: "Yeni Paket", isPopular: false },
    ]);
  };

  // Paket sil
  const removePackage = (index: number) => {
    if (packages.length <= 1) {
      showToast("En az bir paket olmalı", "error");
      return;
    }
    setPackages(packages.filter((_, i) => i !== index));
  };

  // Popüler yap
  const setPopular = (index: number) => {
    const newPackages = packages.map((pkg, i) => ({
      ...pkg,
      isPopular: i === index,
    }));
    setPackages(newPackages);
  };

  // Kaydet
  const savePackages = async () => {
    if (!isSuperAdmin) {
      showToast("Bu işlem için Super Admin yetkisi gerekli", "error");
      return;
    }

    try {
      setSaving(true);

      const response = await authFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Fiyatlandırma güncellendi!", "success");
      } else {
        showToast(data.error || "Güncelleme başarısız", "error");
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      showToast("Kaydetme başarısız", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Yetkisiz Erişim</h3>
        <p className="text-gray-400">
          Bu sayfayı görüntülemek için Super Admin yetkisi gereklidir.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
        <span className="ml-3 text-gray-400">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              Fiyatlandırma Ayarları
            </h2>
            <p className="text-gray-400">Premium üyelik paketlerini yönetin</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={addPackage}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Paket Ekle
          </Button>
          <Button
            onClick={savePackages}
            variant="primary"
            size="sm"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Kaydet
          </Button>
        </div>
      </div>

      {/* Bilgi kartı */}
      <Card padding="md" className="bg-blue-900/20 border-blue-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium">
              Fiyat Değişikliği Hakkında
            </p>
            <p className="text-blue-200 text-sm mt-1">
              Yapılan değişiklikler anında pricing sayfasına yansıyacaktır.
              Mevcut abonelikleri etkilemez.
            </p>
          </div>
        </div>
      </Card>

      {/* Paketler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg, index) => (
          <Card
            key={index}
            padding="lg"
            className={`relative ${
              pkg.isPopular ? "border-purple-500 ring-2 ring-purple-500/20" : ""
            }`}
          >
            {/* Popüler badge */}
            {pkg.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Popüler
                </span>
              </div>
            )}

            <div className="space-y-4 mt-2">
              {/* Etiket */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Paket Adı
                </label>
                <input
                  type="text"
                  value={pkg.label}
                  onChange={(e) =>
                    updatePackage(index, "label", e.target.value)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="örn: 1 Hafta"
                />
              </div>

              {/* Gün */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Gün Sayısı
                </label>
                <input
                  type="number"
                  value={pkg.days}
                  onChange={(e) =>
                    updatePackage(index, "days", parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  min="1"
                />
              </div>

              {/* Fiyat */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Fiyat (TL)
                </label>
                <input
                  type="number"
                  value={pkg.price}
                  onChange={(e) =>
                    updatePackage(index, "price", parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  min="1"
                />
              </div>

              {/* Günlük fiyat gösterimi */}
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Günlük</p>
                <p className="text-xl font-bold text-green-400">
                  {Math.round(pkg.price / pkg.days)} TL
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <button
                  onClick={() => setPopular(index)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition ${
                    pkg.isPopular
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <Star className="h-4 w-4" />
                  {pkg.isPopular ? "Popüler" : "Popüler Yap"}
                </button>
                <button
                  onClick={() => removePackage(index)}
                  className="p-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg transition"
                  title="Paketi Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Önizleme */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Fiyatlandırma Önizlemesi
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {packages
            .sort((a, b) => a.days - b.days)
            .map((pkg, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 text-center ${
                  pkg.isPopular
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-gray-700 bg-gray-800"
                }`}
              >
                {pkg.isPopular && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    Popüler
                  </span>
                )}
                <p className="text-gray-400 text-sm mt-2">{pkg.label}</p>
                <p className="text-3xl font-bold text-white">{pkg.price} TL</p>
                <p className="text-sm text-gray-400">{pkg.days} gün erişim</p>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
