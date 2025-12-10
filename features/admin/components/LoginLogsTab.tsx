"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { LoadingSpinner } from "@/shared/components/ui/LoadingSpinner";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { useToast } from "@/shared/hooks/useToast";
import { authFetch } from "@/lib/authFetch";

interface LoginLog {
  id: string;
  userId: string | null;
  email: string;
  ipAddress: string;
  userAgent: string;
  deviceType: "mobile" | "tablet" | "desktop" | "bot";
  country: string | null;
  isp: string | null;
  asn: string | null;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  success: boolean;
  failReason: string | null;
  timestamp: { _seconds: number; _nanoseconds: number };
  createdAt: { _seconds: number; _nanoseconds: number };
}

interface Stats {
  total: number;
  successful: number;
  failed: number;
  vpnCount: number;
  byCountry: Record<string, number>;
  topEmails: Array<{ email: string; count: number }>;
}

type FilterType = "all" | "success" | "failed" | "vpn";

export function LoginLogsTab() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  // Fetch login logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/admin/login-logs?pageSize=200&page=0`);

      if (!response.ok) {
        throw new Error("Failed to fetch login logs");
      }

      const data = await response.json();
      setLogs(data.logs);
      setStats(data.stats);
    } catch (error) {
      console.error("Fetch login logs error:", error);
      showToast("Login logları yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let result = logs;
    
    // Filter by type
    if (filter === "success") {
      result = result.filter((log) => log.success);
    } else if (filter === "failed") {
      result = result.filter((log) => !log.success);
    } else if (filter === "vpn") {
      result = result.filter((log) => log.isVPN || log.isProxy || log.isTor);
    }
    
    // Search filter
    if (searchQuery) {
      result = result.filter((log) => {
        return (
          log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.ipAddress.includes(searchQuery) ||
          (log.country &&
            log.country.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      });
    }

    return result;
  }, [logs, searchQuery, filter]);

  // Format timestamp
  const formatDate = (timestamp: number | { _seconds: number }) => {
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp) 
      : new Date(timestamp._seconds * 1000);
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Tarih",
      "Email",
      "IP Adresi",
      "Ülke",
      "ISP",
      "Cihaz",
      "Durum",
      "VPN",
      "Proxy",
      "Tor",
      "Hata",
    ];

    const rows = filteredLogs.map((log) => [
      formatDate(log.timestamp),
      log.email,
      log.ipAddress,
      log.country || "N/A",
      log.isp || "N/A",
      log.deviceType,
      log.success ? "Başarılı" : "Başarısız",
      log.isVPN ? "Evet" : "Hayır",
      log.isProxy ? "Evet" : "Hayır",
      log.isTor ? "Evet" : "Hayır",
      log.failReason || "N/A",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `login-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    showToast("CSV dosyası indirildi", "success");
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilter("all");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Toplam Giriş
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Başarılı
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.successful}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Başarısız
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              VPN/Proxy
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.vpnCount}
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Email, IP veya ülke ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setFilter("all");
                setCurrentPage(1);
              }}
            >
              Tümü ({logs.length})
            </Button>
            <Button
              variant={filter === "success" ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setFilter("success");
                setCurrentPage(1);
              }}
            >
              Başarılı ({stats?.successful || 0})
            </Button>
            <Button
              variant={filter === "failed" ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setFilter("failed");
                setCurrentPage(1);
              }}
            >
              Başarısız ({stats?.failed || 0})
            </Button>
            <Button
              variant={filter === "vpn" ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setFilter("vpn");
                setCurrentPage(1);
              }}
            >
              VPN/Proxy ({stats?.vpnCount || 0})
            </Button>
          </div>

          {/* Export Button */}
          <Button variant="secondary" size="sm" onClick={exportToCSV}>
            CSV İndir
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="Login logu bulunamadı"
          description={
            searchQuery || filter !== "all"
              ? "Filtreleri temizleyerek tekrar deneyin"
              : "Henüz login aktivitesi bulunmuyor"
          }
          action={
            searchQuery || filter !== "all" ? (
              <Button onClick={resetFilters}>Filtreleri Temizle</Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP Adresi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ülke
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cihaz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    VPN/Proxy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {log.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {log.country || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {log.deviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.success ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Başarılı
                        </span>
                      ) : (
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          title={log.failReason || undefined}
                        >
                          Başarısız
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.isVPN || log.isProxy || log.isTor ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          {log.isTor ? "Tor" : log.isVPN ? "VPN" : "Proxy"}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {filteredLogs.length} kayıttan{" "}
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)}{" "}
                  arası gösteriliyor
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Önceki
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "primary" : "secondary"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
