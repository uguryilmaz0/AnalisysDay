"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  MousePointer2,
  Camera,
  Download,
  Shield,
  AlertTriangle,
  Globe,
  Filter,
  Trash2,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { useToast } from "@/shared/hooks";
import { Button, LoadingSpinner, Badge } from "@/shared/components/ui";
import { authFetch } from "@/lib/authFetch";
import { ImageTrackingLog } from "@/types";

interface Stats {
  total: number;
  byType: {
    view: number;
    right_click: number;
    screenshot: number;
    download: number;
  };
  vpnCount: number;
  botCount: number;
  byCountry: Record<string, number>;
  topUsers: Array<{ email: string; count: number }>;
}

export function ImageViewLogsTab() {
  const [logs, setLogs] = useState<ImageTrackingLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<
    "all" | ImageTrackingLog["type"]
  >("all");
  const [vpnOnly, setVpnOnly] = useState(false);
  const { showToast } = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: typeFilter,
        vpnOnly: vpnOnly.toString(),
        limit: "200",
      });

      const response = await authFetch(`/api/admin/image-logs?${params}`);
      if (!response.ok) throw new Error("Failed to load");

      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Load image logs error:", error);
      showToast("Loglar yüklenemedi!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (
      !confirm(
        "TÜM görsel takip loglarını silmek istiyor musunuz? Bu işlem geri alınamaz!"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch("/api/admin/image-logs", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to clear");

      showToast("Loglar temizlendi!", "success");
      await loadLogs();
    } catch (error) {
      console.error("Clear logs error:", error);
      showToast("Loglar temizlenemedi!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, vpnOnly]);

  const getTypeIcon = (type: ImageTrackingLog["type"]) => {
    switch (type) {
      case "view":
        return <Eye className="h-4 w-4 text-blue-400" />;
      case "right_click":
        return <MousePointer2 className="h-4 w-4 text-amber-400" />;
      case "screenshot":
        return <Camera className="h-4 w-4 text-red-400" />;
      case "download":
        return <Download className="h-4 w-4 text-purple-400" />;
    }
  };

  const getTypeLabel = (type: ImageTrackingLog["type"]) => {
    switch (type) {
      case "view":
        return "Görüntüleme";
      case "right_click":
        return "Sağ Tık";
      case "screenshot":
        return "Ekran Görüntüsü";
      case "download":
        return "İndirme";
    }
  };

  const getTypeColor = (type: ImageTrackingLog["type"]) => {
    switch (type) {
      case "view":
        return "border-blue-500/30 bg-blue-900/10";
      case "right_click":
        return "border-amber-500/30 bg-amber-900/10";
      case "screenshot":
        return "border-red-500/30 bg-red-900/10";
      case "download":
        return "border-purple-500/30 bg-purple-900/10";
    }
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner size="lg" text="Görsel logları yükleniyor..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">
          📷 Görsel Takip Sistemi
        </h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadLogs}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Yenile
          </Button>
          {logs.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearLogs}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-linear-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {stats.total}
              </span>
            </div>
            <p className="text-sm text-blue-200">Toplam İşlem</p>
          </div>

          <div className="bg-linear-to-br from-amber-900/50 to-amber-800/30 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="text-2xl font-bold text-white">
                {stats.vpnCount}
              </span>
            </div>
            <p className="text-sm text-amber-200">VPN/Proxy Tespiti</p>
          </div>

          <div className="bg-linear-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {stats.topUsers.length}
              </span>
            </div>
            <p className="text-sm text-purple-200">Aktif Kullanıcı</p>
          </div>

          <div className="bg-linear-to-br from-green-900/50 to-green-800/30 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Globe className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {Object.keys(stats.byCountry).length}
              </span>
            </div>
            <p className="text-sm text-green-200">Farklı Ülke</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <p className="text-sm text-gray-400 font-medium">Filtreler:</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
              typeFilter === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Tümü ({stats?.total || 0})
          </button>
          <button
            onClick={() => setTypeFilter("view")}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 ${
              typeFilter === "view"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Görüntüleme ({stats?.byType.view || 0})
          </button>
          <button
            onClick={() => setTypeFilter("right_click")}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 ${
              typeFilter === "right_click"
                ? "bg-amber-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <MousePointer2 className="h-3.5 w-3.5" />
            Sağ Tık ({stats?.byType.right_click || 0})
          </button>
          <button
            onClick={() => setTypeFilter("screenshot")}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 ${
              typeFilter === "screenshot"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            Screenshot ({stats?.byType.screenshot || 0})
          </button>
          <button
            onClick={() => setTypeFilter("download")}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 ${
              typeFilter === "download"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            İndirme ({stats?.byType.download || 0})
          </button>
        </div>

        <button
          onClick={() => setVpnOnly(!vpnOnly)}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 ${
            vpnOnly
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Sadece VPN/Proxy ({stats?.vpnCount || 0})
        </button>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Log bulunamadı</p>
          <p className="text-gray-500 text-sm mt-2">
            {typeFilter !== "all" || vpnOnly
              ? "Filtrelere uygun log yok"
              : "Henüz görsel takip logu oluşmamış"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Tür
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Kullanıcı
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Analiz
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  IP / Ülke
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Cihaz
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className={`hover:bg-gray-800/50 transition ${getTypeColor(
                    log.type
                  )}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      <span className="text-sm text-white font-medium">
                        {getTypeLabel(log.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-white font-medium">{log.userName}</p>
                      <p className="text-gray-400 text-xs">{log.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-white font-medium max-w-xs truncate">
                        {log.analysisTitle}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Görsel #{log.imageIndex + 1}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-white font-mono">{log.ipAddress}</p>
                      <p className="text-gray-400 text-xs">
                        {log.country || "Unknown"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        log.deviceType === "desktop"
                          ? "info"
                          : log.deviceType === "mobile"
                          ? "success"
                          : "warning"
                      }
                    >
                      {log.deviceType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {(log.isVPN || log.isProxy || log.isTor) && (
                        <Badge variant="danger">
                          <Shield className="h-3 w-3 mr-1" />
                          VPN
                        </Badge>
                      )}
                      {log.deviceType === "bot" && (
                        <Badge variant="warning">Bot</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("tr-TR")}
                    </span>
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
