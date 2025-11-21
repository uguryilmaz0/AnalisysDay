import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireSuperAdmin } from "@/middleware/auth";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * POST - Tüm rate limit ban'larını temizle
 */
export async function POST(req: NextRequest) {
  try {
    // Super admin kontrolü
    const authResult = await requireSuperAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Redis'ten tüm rate limit key'lerini al ve sil
    const keys = await redis.keys("@ratelimit/*");
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${keys.length} rate limit bans`,
      cleared: keys.length,
    });
  } catch (error) {
    console.error("Clear rate limits error:", error);
    return NextResponse.json(
      { error: "Failed to clear rate limits" },
      { status: 500 }
    );
  }
}
