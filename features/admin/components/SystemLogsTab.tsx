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
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error">(
    "all"
  );
  const { showToast } = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/admin/logs?level=${filter}`);
      if (!response.ok) throw new Error("Failed to load");

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Load logs error:", error);
      showToast("Loglar yüklenemedi!", "error");
    } finally {
      setLoading(false);
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
  }, [filter]);

  useEffect(() => {
    // Auto-refresh her 10 saniyede
    const interval = setInterval(() => {
      loadLogs();
    }, 10000);
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

  const filteredLogs = logs.filter(
    (log) => filter === "all" || log.level === filter
  );

  if (loading && logs.length === 0) {
    return <LoadingSpinner size="lg" text="System logları yükleniyor..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">📋 System Logs</h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadLogs}
            icon={<Clock className="h-4 w-4" />}
          >
            Yenile
          </Button>
          {logs.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearLogs}
              icon={<FileText className="h-4 w-4" />}
            >
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            filter === "all"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Filter className="h-4 w-4" />
          Tümü ({logs.length})
        </button>
        <button
          onClick={() => setFilter("info")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            filter === "info"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Info className="h-4 w-4" />
          Info ({logs.filter((l) => l.level === "info").length})
        </button>
        <button
          onClick={() => setFilter("warn")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            filter === "warn"
              ? "bg-amber-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Warn ({logs.filter((l) => l.level === "warn").length})
        </button>
        <button
          onClick={() => setFilter("error")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            filter === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          Error ({logs.filter((l) => l.level === "error").length})
        </button>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Log bulunamadı</p>
          <p className="text-gray-500 text-sm mt-2">
            {filter !== "all"
              ? `${filter.toUpperCase()} seviyesinde log yok`
              : "Henüz sistem logu oluşmamış"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`border rounded-lg p-4 ${getLogColor(log.level)}`}
            >
              <div className="flex items-start gap-3">
                {getLogIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">
                      {log.message}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
                      {new Date(log.timestamp).toLocaleString("tr-TR")}
                    </span>
                  </div>

                  {log.action && (
                    <p className="text-sm text-gray-400 mb-2">
                      <strong>Action:</strong> {log.action}
                    </p>
                  )}

                  {log.userId && (
                    <p className="text-sm text-gray-400 mb-2">
                      <strong>User ID:</strong> {log.userId}
                    </p>
                  )}

                  {log.context && Object.keys(log.context).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                        Context Details
                      </summary>
                      <pre className="mt-2 text-xs text-gray-300 bg-gray-900/50 rounded p-3 overflow-x-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
