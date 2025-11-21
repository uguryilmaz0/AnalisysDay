import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireSuperAdmin } from "@/middleware/auth";

/**
 * GET - System loglarını getir
 */
export async function GET(req: NextRequest) {
  try {
    // Super admin kontrolü
    const authResult = await requireSuperAdmin(req);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    // Query params
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level") || "all";
    const maxLogs = parseInt(searchParams.get("limit") || "100");

    // Firestore Admin query
    const logsRef = adminDb.collection("system_logs");
    let query = logsRef.orderBy("timestamp", "desc").limit(maxLogs);

    if (level !== "all") {
      query = logsRef
        .where("level", "==", level)
        .orderBy("timestamp", "desc")
        .limit(maxLogs);
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch (error) {
    console.error("Get logs error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get logs";
    return NextResponse.json(
      { error: "Failed to get logs", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Tüm logları temizle
 */
export async function DELETE(req: NextRequest) {
  try {
    // Super admin kontrolü
    const authResult = await requireSuperAdmin(req);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    // Tüm logları getir ve sil (batch delete)
    const logsRef = adminDb.collection("system_logs");
    const snapshot = await logsRef.limit(500).get();

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Cleared ${snapshot.size} logs`,
      cleared: snapshot.size,
    });
  } catch (error) {
    console.error("Clear logs error:", error);
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 }
    );
  }
}
