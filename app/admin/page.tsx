"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Upload,
  TrendingUp,
  Users,
  Ban,
  FileText,
  Sparkles,
} from "lucide-react";
import { Card, LoadingSpinner } from "@/shared/components/ui";
import { useRequireAuth } from "@/shared/hooks";
import { useAdminStore } from "@/features/admin/stores";
import {
  AnalysisUploadTab,
  AnalysisListTab,
  UserManagementTab,
  AdminManagementTab,
  RateLimitTab,
  SystemLogsTab,
} from "@/features/admin/components";

export default function AdminPage() {
  const {
    user,
    userData,
    loading: authLoading,
  } = useRequireAuth({
    requireAdmin: true,
    unauthorizedRedirectTo: "/",
  });

  // Zustand store
  const analyses = useAdminStore((state) => state.analyses);
  const users = useAdminStore((state) => state.users);
  const loading = useAdminStore((state) => state.loading);
  const loadAllData = useAdminStore((state) => state.loadAllData);

  const [activeTab, setActiveTab] = useState<
    | "upload"
    | "analyses"
    | "ai-analyses"
    | "users"
    | "admins"
    | "ratelimits"
    | "logs"
  >("upload");

  useEffect(() => {
    if (!authLoading && user) {
      loadAllData();
    }
  }, [authLoading, user, loadAllData]);

  if (authLoading || loading) {
    return (
      <LoadingSpinner fullScreen size="xl" text="Admin paneli yükleniyor..." />
    );
  }

  // Super admin kontrolü
  const isSuperAdmin = userData?.superAdmin || false;
  const isModerator = userData?.role === "moderator";
  const isRegularAdmin = userData?.role === "admin" && !isSuperAdmin;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="bg-linear-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-2xl border border-purple-500/20">
          <div className="flex items-center gap-4">
            <Shield className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-purple-200">
                AnalysisDay Yönetim Sistemi
                {isSuperAdmin && (
                  <span className="ml-2 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm">
                    ⭐ Super Admin
                  </span>
                )}
                {isRegularAdmin && (
                  <span className="ml-2 bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm">
                    👨‍💼 Admin
                  </span>
                )}
                {isModerator && (
                  <span className="ml-2 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                    📝 Moderator
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          className={`grid gap-6 mb-8 ${
            isSuperAdmin ? "md:grid-cols-3" : "md:grid-cols-1 max-w-md mx-auto"
          }`}
        >
          <Card padding="md" hover>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">
                {analyses.length}
              </span>
            </div>
            <p className="text-gray-400">Toplam Analiz</p>
          </Card>

          {/* Super Admin only stats */}
          {isSuperAdmin && (
            <>
              <Card padding="md" hover>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <span className="text-2xl font-bold text-white">
                    {
                      users.filter(
                        (u) => (u.isPaid || u.role === "admin") && !u.superAdmin
                      ).length
                    }
                  </span>
                </div>
                <p className="text-gray-400">Premium Üyeler</p>
              </Card>

              <Card padding="md" hover>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-gray-500" />
                  <span className="text-2xl font-bold text-white">
                    {users.filter((u) => !u.superAdmin).length}
                  </span>
                </div>
                <p className="text-gray-400">Toplam Kullanıcı</p>
              </Card>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "upload"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Upload className="h-5 w-5" />
              Analiz Yükle
            </button>
            <button
              onClick={() => setActiveTab("analyses")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "analyses"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              Günlük Analizler
            </button>
            <button
              onClick={() => setActiveTab("ai-analyses")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "ai-analyses"
                  ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              Yapay Zeka Analizleri
            </button>

            {/* Super Admin Only Tabs */}
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === "users"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Kullanıcılar
                </button>
                <button
                  onClick={() => setActiveTab("admins")}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === "admins"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  Admin Yönetimi
                </button>
              </>
            )}

            {/* Super Admin Only - System Tabs */}
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setActiveTab("ratelimits")}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === "ratelimits"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Ban className="h-5 w-5" />
                  Rate Limits
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === "logs"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  System Logs
                </button>
              </>
            )}
          </div>

          <div className="p-8">
            {activeTab === "upload" && user?.uid && (
              <AnalysisUploadTab userId={user.uid} />
            )}

            {activeTab === "analyses" && (
              <AnalysisListTab analysisType="daily" />
            )}

            {activeTab === "ai-analyses" && (
              <AnalysisListTab analysisType="ai" />
            )}

            {activeTab === "users" && isSuperAdmin && (
              <UserManagementTab currentUserId={user?.uid} />
            )}

            {activeTab === "admins" && isSuperAdmin && (
              <AdminManagementTab
                currentUserId={user?.uid}
                isSuperAdmin={isSuperAdmin}
              />
            )}

            {activeTab === "ratelimits" && isSuperAdmin && <RateLimitTab />}

            {activeTab === "logs" && isSuperAdmin && <SystemLogsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
