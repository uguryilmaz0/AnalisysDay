"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";
import { useToast } from "@/shared/hooks";
import { Button, LoadingSpinner } from "@/shared/components/ui";
import { authFetch } from "@/lib/authFetch";

interface SystemLog {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  action?: string;
}

export function SystemLogsTab() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error">(
    "all"
  );
  const { showToast } = useToast();

  const loadLogs = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setLogs([]);
      setCurrentPage(0);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const page = reset ? 0 : currentPage + 1;
      const response = await authFetch(`/api/admin/logs?level=${filter}&pageSize=50&page=${page}`);
      if (!response.ok) throw new Error("Failed to load");

      const data = await response.json();
      
      if (reset) {
        setLogs(data.logs || []);
      } else {
        setLogs(prev => [...prev, ...(data.logs || [])]);
        setCurrentPage(data.currentPage);
      }
      
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Load logs error:", error);
      showToast("Loglar yüklenemedi!", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  const loadMoreLogs = () => {
    if (!loadingMore && hasMore) {
      loadLogs(false);
    }
  };

  const handleClearLogs = async () => {
    if (
      !confirm(
        "TÜM logları temizlemek istiyor musunuz? Bu işlem geri alınamaz!"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch("/api/admin/logs", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to clear");

      showToast("Loglar temizlendi!", "success");
      await loadLogs(true);
    } catch (error) {
      console.error("Clear logs error:", error);
      showToast("Loglar temizlenemedi!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    // Auto-refresh her 30 saniyede (sadece ilk sayfa)
    const interval = setInterval(() => {
      loadLogs(true);
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const getLogIcon = (level: SystemLog["level"]) => {
    switch (level) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "warn":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case "info":
        return <CheckCircle className="h-5 w-5 text-blue-400" />;
    }
  };

  const getLogColor = (level: SystemLog["level"]) => {
    switch (level) {
      case "error":
        return "border-red-500/30 bg-red-900/10";
      case "warn":
        return "border-amber-500/30 bg-amber-900/10";
      case "info":
        return "border-blue-500/30 bg-blue-900/10";
    }
  };

  // Backend'de filtreleme yapılıyor, burada sadece göster
  const filteredLogs = logs;

  if (loading && logs.length === 0) {
    return <LoadingSpinner size="lg" text="System logları yükleniyor..." />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">📋 System Logs</h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadLogs}
            icon={<Clock className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Yenile</span>
            <span className="sm:hidden">↻</span>
          </Button>
          {logs.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearLogs}
              icon={<FileText className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Temizle</span>
              <span className="sm:hidden">🗑️</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Buttons - Responsive Grid */}
      <div className="grid grid-cols-2 md:flex gap-2 md:gap-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition text-sm md:text-base ${
            filter === "all"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Tümü</span>
        </button>
        <button
          onClick={() => setFilter("info")}
          className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition text-sm md:text-base ${
            filter === "info"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Info</span>
        </button>
        <button
          onClick={() => setFilter("warn")}
          className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition text-sm md:text-base ${
            filter === "warn"
              ? "bg-amber-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Warn</span>
        </button>
        <button
          onClick={() => setFilter("error")}
          className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition text-sm md:text-base ${
            filter === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Error</span>
        </button>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 md:p-12 text-center">
          <FileText className="h-12 md:h-16 w-12 md:w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-base md:text-lg">Log bulunamadı</p>
          <p className="text-gray-500 text-xs md:text-sm mt-2">
            {filter !== "all"
              ? `${filter.toUpperCase()} seviyesinde log yok`
              : "Henüz sistem logu oluşmamış"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`border rounded-lg p-3 md:p-4 ${getLogColor(
                  log.level
                )}`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0 mb-2">
                      <span className="text-white font-semibold text-sm md:text-base wrap-break-word">
                        {log.message}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("tr-TR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {log.action && (
                      <p className="text-xs md:text-sm text-gray-400 mb-2 wrap-break-word">
                        <strong>Action:</strong> {log.action}
                      </p>
                    )}

                    {log.userId && (
                      <p className="text-xs md:text-sm text-gray-400 mb-2 break-all">
                        <strong>User ID:</strong> {log.userId}
                      </p>
                    )}

                    {log.context && Object.keys(log.context).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs md:text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                          Context Details
                        </summary>
                        <pre className="mt-2 text-xs text-gray-300 bg-gray-900/50 rounded p-2 md:p-3 overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={loadMoreLogs}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Yükleniyor...</span>
                  </>
                ) : (
                  `Daha Fazla Yükle (${logs.length} log gösteriliyor)`
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
