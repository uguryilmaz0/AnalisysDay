import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireSuperAdmin } from "@/middleware/auth";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * POST - Tüm rate limit ban'larını temizle
 * YENI: cleanupOldEvents parametresi ile sadece eski event'leri temizleme seçeneği
 */
export async function POST(req: NextRequest) {
  try {
    // Super admin kontrolü
    const authResult = await requireSuperAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json().catch(() => ({}));
    const { cleanupOldEvents = false } = body;

    // Redis'ten tüm rate limit key'lerini al ve sil
    const keys = await redis.keys("@ratelimit/*");
    
    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No rate limit keys to clear",
        cleared: 0,
      });
    }

    let keysToDelete = keys;
    
    // Sadece eski event key'lerini temizle seçeneği
    if (cleanupOldEvents) {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      keysToDelete = keys.filter(key => {
        // events:timestamp formatındaki key'leri kontrol et
        const match = key.match(/:events:(\d+)$/);
        if (match) {
          const timestamp = parseInt(match[1]);
          // 24 saatten eski event'leri sil
          return timestamp < oneDayAgo;
        }
        // Diğer key'leri temizleme (IP bazlı ban'lar korunsun)
        return false;
      });
      
      console.log(`Cleaning ${keysToDelete.length} old event keys (older than 24h)`);
    }

    if (keysToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No old keys to cleanup",
        cleared: 0,
      });
    }

    // Pipeline ile toplu silme (daha hızlı)
    const pipeline = redis.pipeline();
    keysToDelete.forEach(key => {
      pipeline.del(key);
    });
    await pipeline.exec();

    return NextResponse.json({
      success: true,
      message: cleanupOldEvents 
        ? `Cleared ${keysToDelete.length} old event keys` 
        : `Cleared ${keysToDelete.length} rate limit bans`,
      cleared: keysToDelete.length,
      total: keys.length,
    });
  } catch (error) {
    console.error("Clear rate limits error:", error);
    return NextResponse.json(
      { error: "Failed to clear rate limits" },
      { status: 500 }
    );
  }
}
