"use client";

import { useState, useEffect } from "react";
import { Shield, Trash2, AlertTriangle, Clock, User } from "lucide-react";
import { useToast } from "@/shared/hooks";
import { Button, LoadingSpinner } from "@/shared/components/ui";
import { authFetch } from "@/lib/authFetch";

interface RateLimitBan {
  key: string;
  identifier: string; // IP adresi
  action: string;
  bannedUntil: number;
  attempts: number;
  userId?: string; // Opsiyonel kullanıcı ID
}

export function RateLimitTab() {
  const [bans, setBans] = useState<RateLimitBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadBans = async () => {
    setLoading(true);
    try {
      const response = await authFetch("/api/admin/rate-limits");
      if (!response.ok) throw new Error("Failed to load");

      const data = await response.json();
      setBans(data.bans || []);
    } catch (error) {
      console.error("Load bans error:", error);
      showToast("Rate limit verileri yüklenemedi!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBan = async (key: string, identifier: string) => {
    if (
      !confirm(`${identifier} için rate limit ban'ı kaldırmak istiyor musunuz?`)
    ) {
      return;
    }

    setRemoving(key);
    try {
      const response = await authFetch("/api/admin/rate-limits", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) throw new Error("Failed to remove");

      showToast("Rate limit ban kaldırıldı!", "success");
      await loadBans();
    } catch (error) {
      console.error("Remove ban error:", error);
      showToast("Ban kaldırılamadı!", "error");
    } finally {
      setRemoving(null);
    }
  };

  const handleClearAllBans = async () => {
    if (!confirm("TÜM rate limit ban'ları kaldırmak istiyor musunuz?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch("/api/admin/rate-limits/clear", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to clear");

      showToast("Tüm ban'lar temizlendi!", "success");
      await loadBans();
    } catch (error) {
      console.error("Clear all error:", error);
      showToast("Ban'lar temizlenemedi!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBans();

    // Auto-refresh her 30 saniyede
    const interval = setInterval(() => {
      loadBans();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <LoadingSpinner size="lg" text="Rate limit verileri yükleniyor..." />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          🚫 Rate Limit Yönetimi
        </h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadBans}
            icon={<Clock className="h-4 w-4" />}
          >
            Yenile
          </Button>
          {bans.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAllBans}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Tümünü Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-100 font-semibold mb-2">
              Rate Limit Hakkında
            </p>
            <ul className="text-sm text-amber-200 space-y-1">
              <li>
                • Çok fazla istek gönderen kullanıcılar geçici olarak
                engellenmiştir
              </li>
              <li>• Ban süreleri action tipine göre değişir (1 dk - 1 saat)</li>
              <li>• Buradan manuel olarak ban&apos;ları kaldırabilirsiniz</li>
              <li>• IP adresi veya IP:userId kombinasyonu ile takip edilir</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bans List */}
      {bans.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            Aktif rate limit ban&apos;ı yok
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Sistem güvenli çalışıyor 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bans.map((ban) => {
            const timeRemaining = Math.max(0, ban.bannedUntil - Date.now());
            const minutesRemaining = Math.ceil(timeRemaining / 60000);
            const isExpired = timeRemaining <= 0;

            return (
              <div
                key={ban.key}
                className={`bg-gray-800/50 border rounded-xl p-6 ${
                  isExpired ? "border-green-500/30" : "border-red-500/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield
                        className={`h-6 w-6 ${
                          isExpired ? "text-green-400" : "text-red-400"
                        }`}
                      />
                      <div>
                        <p className="text-white font-semibold">{ban.action}</p>
                        <p className="text-sm text-gray-400">
                          {isExpired
                            ? "✅ Süresi doldu"
                            : `⏰ ${minutesRemaining} dakika kaldı`}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">IP Adresi</p>
                        <p className="text-white font-mono text-sm">
                          {ban.identifier}
                        </p>
                      </div>
                      {ban.userId && (
                        <div className="bg-gray-900/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Kullanıcı ID
                          </p>
                          <p className="text-white font-mono text-sm">
                            {ban.userId}
                          </p>
                        </div>
                      )}
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Deneme Sayısı
                        </p>
                        <p className="text-white font-semibold">
                          {ban.attempts}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Ban Bitiş</p>
                        <p className="text-white text-sm">
                          {new Date(ban.bannedUntil).toLocaleString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveBan(ban.key, ban.identifier)}
                    loading={removing === ban.key}
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    Kaldır
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
