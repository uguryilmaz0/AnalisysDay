"use client";

import { useEffect, useState } from "react";
import { getLeagues } from "@/lib/matchService";

/**
 * @deprecated Cache kullanımı kaldırıldı - direkt API çağrıları kullanılıyor
 * Geriye uyumluluk için bırakıldı
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
      console.log("🚀 Lig listesi yükleniyor (API - cache yok)...");

      try {
        // Lig listesini yükle (direkt API)
        await getLeagues();

        setPreloadComplete(true);
        console.log("✅ Lig listesi yüklendi");
      } catch (error) {
        console.error("❌ Lig listesi yükleme hatası:", error);
        setPreloadError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsPreloading(false);
      }
    };

    preloadData();
  }, [shouldLoad, preloadComplete, isPreloading]);

  return { isPreloading, preloadComplete, preloadError };
}
