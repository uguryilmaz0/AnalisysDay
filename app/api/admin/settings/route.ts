/**
 * Admin Settings API
 * GET /api/admin/settings - Ayarları getir
 * PUT /api/admin/settings - Ayarları güncelle (Super Admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, requireAdmin } from "@/middleware/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { PricingPackage } from "@/types";

const SETTINGS_DOC_ID = "site";

// Varsayılan fiyatlandırma paketleri
const DEFAULT_PRICING_PACKAGES: PricingPackage[] = [
  { days: 7, price: 250, label: "1 Hafta", isPopular: false },
  { days: 15, price: 500, label: "15 Gün", isPopular: true },
  { days: 30, price: 1000, label: "1 Ay", isPopular: false },
];

/**
 * GET - Fiyatlandırma ayarlarını getir
 */
export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Firestore'dan settings'i al
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
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { 
        success: true, 
        data: { packages: DEFAULT_PRICING_PACKAGES }
      }
    );
  }
}

/**
 * PUT - Fiyatlandırma ayarlarını güncelle (Super Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Super Admin kontrolü
    const authResult = await requireSuperAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await request.json();
    const { packages } = body as { packages: PricingPackage[] };

    // Validation
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return NextResponse.json(
        { success: false, error: "En az bir paket gerekli" },
        { status: 400 }
      );
    }

    // Her paket için validation
    for (const pkg of packages) {
      if (!pkg.days || pkg.days <= 0) {
        return NextResponse.json(
          { success: false, error: "Gün sayısı geçerli olmalı" },
          { status: 400 }
        );
      }
      if (!pkg.price || pkg.price <= 0) {
        return NextResponse.json(
          { success: false, error: "Fiyat geçerli olmalı" },
          { status: 400 }
        );
      }
      if (!pkg.label || pkg.label.trim() === "") {
        return NextResponse.json(
          { success: false, error: "Paket etiketi gerekli" },
          { status: 400 }
        );
      }
    }

    if (!authResult.user?.uid) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 401 }
      );
    }

    // Firestore'a kaydet (adminDb kullanarak)
    await adminDb.collection("settings").doc(SETTINGS_DOC_ID).set(
      {
        pricing: {
          packages,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: authResult.user.uid,
        },
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "Fiyatlandırma ayarları güncellendi",
    });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Ayarlar güncellenemedi" },
      { status: 500 }
    );
  }
}
