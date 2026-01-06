/**
 * Public Pricing API
 * GET /api/settings/pricing - Fiyatlandırma paketlerini getir (Public)
 */

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import type { PricingPackage } from "@/types";

const SETTINGS_DOC_ID = "site";

// Varsayılan fiyatlandırma paketleri
const DEFAULT_PRICING_PACKAGES: PricingPackage[] = [
  { days: 7, price: 250, label: "1 Hafta", isPopular: false },
  { days: 15, price: 500, label: "15 Gün", isPopular: true },
  { days: 30, price: 1000, label: "1 Ay", isPopular: false },
];

/**
 * GET - Fiyatlandırma paketlerini getir (Public - kimlik doğrulama gerekmez)
 */
export async function GET() {
  try {
    const settingsDoc = await adminDb.collection("settings").doc(SETTINGS_DOC_ID).get();
    
    let packages = DEFAULT_PRICING_PACKAGES;
    
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      if (data?.pricing?.packages) {
        packages = data.pricing.packages;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        packages,
      },
    });
  } catch (error) {
    console.error("Public Pricing GET error:", error);
    // Hata durumunda varsayılan fiyatları döndür
    return NextResponse.json({
      success: true,
      data: {
        packages: DEFAULT_PRICING_PACKAGES,
      },
    });
  }
}
