import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireSuperAdmin } from "@/middleware/auth";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const LOG_KEY_PREFIX = 'system_logs:';

/**
 * GET - System loglarını getir (REDIS - PAGINATION)
 */
export async function GET(req: NextRequest) {
  try {
    // Super admin kontrolü
    const authResult = await requireSuperAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Query params
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level") || "all";
    const pageSize = parseInt(searchParams.get("pageSize") || "50"); // Her sayfa 50 log
    const page = parseInt(searchParams.get("page") || "0"); // Sayfa numarası

    console.log(`📋 [Logs] Fetching from Redis - level: ${level}, pageSize: ${pageSize}, page: ${page}`);

    // Redis key (level'a göre)
    const redisKey = `${LOG_KEY_PREFIX}${level}`;

    // Redis'ten son logları çek (ZRANGE reverse order - descending)
    const start = page * pageSize;
    const end = start + pageSize; // +1 için hasMore kontrolü

 
    const logStrings = await redis.zrange(redisKey, start, end, { rev: true }) as string[];
    
    // Logs parse et
    const hasMore = logStrings.length > pageSize;
    const logs = logStrings
      .slice(0, pageSize)
      .map((logStr) => {
        try {
          return JSON.parse(logStr);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Next page number
    const nextPage = hasMore ? page + 1 : null;

    return NextResponse.json({
      success: true,
      logs,
      hasMore,
      nextPage,
      currentPage: page,
      count: logs.length,
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
 * DELETE - Tüm logları temizle (REDIS)
 */
export async function DELETE(req: NextRequest) {
  try {
    // Super admin kontrolü
    const authResult = await requireSuperAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Redis'ten tüm log key'lerini sil
    const keys = [
      `${LOG_KEY_PREFIX}all`,
      `${LOG_KEY_PREFIX}info`,
      `${LOG_KEY_PREFIX}warn`,
      `${LOG_KEY_PREFIX}error`,
      `${LOG_KEY_PREFIX}debug`,
    ];

    let totalCleared = 0;
    for (const key of keys) {
      const count = await redis.zcard(key);
      await redis.del(key);
      totalCleared += count as number;
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${totalCleared} logs from Redis`,
      cleared: totalCleared,
    });
  } catch (error) {
    console.error("Clear logs error:", error);
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 }
    );
  }
}
