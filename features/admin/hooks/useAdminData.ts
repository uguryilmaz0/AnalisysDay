import { useState, useCallback } from "react";
import { DailyAnalysis, User } from "@/types";
import { analysisService, userService } from "@/features/admin/services";

export interface AdminData {
  analyses: DailyAnalysis[];
  users: User[];
  usersWithAuthData: Array<User & { emailVerified: boolean }>;
  loading: boolean;
  error: Error | null;
}

/**
 * Admin verilerini yüklemek ve yönetmek için özel hook
 * Servis katmanını kullanarak analizler ve kullanıcıları getirir
 */
export function useAdminData() {
  const [data, setData] = useState<AdminData>({
    analyses: [],
    users: [],
    usersWithAuthData: [],
    loading: false,
    error: null,
  });

  const loadData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      // Servisleri kullanarak veri çek
      const [analysesData, usersData, usersWithAuth] = await Promise.all([
        analysisService.getAll(),
        userService.getAll(),
        userService.getAllWithAuthData(),
      ]);

      setData({
        analyses: analysesData,
        users: usersData,
        usersWithAuthData: usersWithAuth,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error("Veri yüklenemedi"),
      }));
    }
  }, []);

  return {
    ...data,
    loadData,
    refetch: loadData,
  };
}
