"use client";

import { useEffect, useState } from "react";
import { getLeagues, getAllTeams, getLeagueMatchCounts } from "@/lib/matchService";

/**
 * Global veri yükleme hook'u
 * Kullanıcı giriş yaptığında otomatik olarak analiz verilerini cache'e yükler
 */
export function usePreloadAnalysisData(shouldLoad: boolean = false) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldLoad || preloadComplete || isPreloading) return;

    const preloadData = async () => {
      setIsPreloading(true);
      setPreloadError(null);
      console.log("🚀 Analiz verileri arka planda yükleniyor...");

      try {
        // Paralel olarak tüm verileri yükle ve localStorage'a cache'le
        await Promise.all([
          getLeagues(),
          getAllTeams(),
          getLeagueMatchCounts(),
        ]);

        setPreloadComplete(true);
        console.log("✅ Analiz verileri başarıyla cache'lendi (localStorage)");
      } catch (error) {
        console.error("❌ Analiz verileri yükleme hatası:", error);
        setPreloadError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsPreloading(false);
      }
    };

    preloadData();
  }, [shouldLoad, preloadComplete, isPreloading]);

  return { isPreloading, preloadComplete, preloadError };
}
