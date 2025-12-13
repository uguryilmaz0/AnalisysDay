"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { analysisCache } from "@/lib/analysisCache";

interface CacheStats {
  size: number;
  keys: string[];
  validEntries: number;
  expiredEntries: number;
  pendingRequests: number;
  maxSize: number;
  utilizationPercent: number;
  estimatedSizeKB: number;
}

/**
 * Cache Monitoring Widget - Sadece Admin/Super Admin için
 */
export function CacheMonitor() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Sadece admin veya super admin görebilir
  const isAdmin = userData?.role === "admin" || userData?.superAdmin === true;

  useEffect(() => {
    if (!isAdmin) return;

    const updateStats = () => {
      const newStats = analysisCache.getCacheStats();
      setStats(newStats);
    };

    // İlk yükleme
    updateStats();

    // 5 saniyede bir güncelle
    const interval = setInterval(updateStats, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isAdmin]);

  const handleClearCache = () => {
    if (confirm("Tüm cache temizlensin mi?")) {
      analysisCache.clear();
      setStats(analysisCache.getCacheStats());
    }
  };

  const handleCleanExpired = () => {
    analysisCache.cleanExpired();
    setStats(analysisCache.getCacheStats());
  };

  if (!isAdmin || !stats) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      style={{ fontFamily: "monospace" }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        title="Cache Monitor"
      >
        <span>📊</span>
        <span className="text-xs font-bold">Cache</span>
        {stats.utilizationPercent > 80 && (
          <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs">
            {stats.utilizationPercent}%
          </span>
        )}
      </button>

      {/* Stats Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-gray-900 text-white p-4 rounded-lg shadow-xl w-80 text-xs">
          {/* Header */}
          <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
            <h3 className="font-bold text-sm">🔍 Cache Monitor</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatItem label="Total Entries" value={stats.size} />
            <StatItem
              label="Utilization"
              value={`${stats.utilizationPercent}%`}
              warning={stats.utilizationPercent > 80}
            />
            <StatItem label="Valid" value={stats.validEntries} success />
            <StatItem
              label="Expired"
              value={stats.expiredEntries}
              warning={stats.expiredEntries > 0}
            />
            <StatItem
              label="Pending"
              value={stats.pendingRequests}
              info={stats.pendingRequests > 0}
            />
            <StatItem label="Max Size" value={stats.maxSize} />
            <StatItem
              label="Est. Size"
              value={`${stats.estimatedSizeKB}KB`}
              warning={stats.estimatedSizeKB > 500}
            />
            <StatItem label="Hit Rate" value={calculateHitRate(stats)} />
          </div>

          {/* Cache Keys */}
          <div className="mb-3">
            <div className="text-gray-400 mb-1">Cache Keys:</div>
            <div className="bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
              {stats.keys.length === 0 ? (
                <div className="text-gray-500 italic">No cached data</div>
              ) : (
                <ul className="space-y-1">
                  {stats.keys.map((key) => (
                    <li key={key} className="text-green-400">
                      • {key}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCleanExpired}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
              disabled={stats.expiredEntries === 0}
            >
              Clean Expired ({stats.expiredEntries})
            </button>
            <button
              onClick={handleClearCache}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Warning */}
          {stats.utilizationPercent > 90 && (
            <div className="mt-2 bg-red-900/50 border border-red-500 rounded p-2">
              <div className="text-red-400 font-bold text-xs">⚠️ Warning</div>
              <div className="text-red-300 text-xs">
                Cache nearing max size. LRU eviction will trigger soon.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  success,
  warning,
  info,
}: {
  label: string;
  value: string | number;
  success?: boolean;
  warning?: boolean;
  info?: boolean;
}) {
  const colorClass = success
    ? "text-green-400"
    : warning
    ? "text-yellow-400"
    : info
    ? "text-blue-400"
    : "text-white";

  return (
    <div className="bg-gray-800 p-2 rounded">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className={`font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}

function calculateHitRate(stats: CacheStats): string {
  if (stats.size === 0) return "N/A";
  const hitRate = ((stats.validEntries / stats.size) * 100).toFixed(0);
  return `${hitRate}%`;
}
