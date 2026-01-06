import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SiteSettings, PricingPackage } from "@/types";

const SETTINGS_DOC_ID = "site";

// Varsayılan fiyatlandırma paketleri
export const DEFAULT_PRICING_PACKAGES: PricingPackage[] = [
  { days: 7, price: 250, label: "1 Hafta", isPopular: false },
  { days: 15, price: 500, label: "15 Gün", isPopular: true },
  { days: 30, price: 1000, label: "1 Ay", isPopular: false },
];

/**
 * Site ayarlarını getirir
 */
export async function getSettings(): Promise<SiteSettings | null> {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", SETTINGS_DOC_ID));
    if (settingsDoc.exists()) {
      return settingsDoc.data() as SiteSettings;
    }
    return null;
  } catch (error) {
    console.error("Settings getirilemedi:", error);
    return null;
  }
}

/**
 * Fiyatlandırma paketlerini getirir
 */
export async function getPricingPackages(): Promise<PricingPackage[]> {
  try {
    const settings = await getSettings();
    if (settings?.pricing?.packages) {
      return settings.pricing.packages;
    }
    return DEFAULT_PRICING_PACKAGES;
  } catch (error) {
    console.error("Fiyatlandırma paketleri getirilemedi:", error);
    return DEFAULT_PRICING_PACKAGES;
  }
}

/**
 * Fiyatlandırma paketlerini günceller (Sadece Super Admin)
 */
export async function updatePricingPackages(
  packages: PricingPackage[],
  updatedBy: string
): Promise<void> {
  try {
    const settingsRef = doc(db, "settings", SETTINGS_DOC_ID);
    
    await setDoc(
      settingsRef,
      {
        pricing: {
          packages,
          updatedAt: Timestamp.now(),
          updatedBy,
        },
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Fiyatlandırma paketleri güncellenemedi:", error);
    throw error;
  }
}
