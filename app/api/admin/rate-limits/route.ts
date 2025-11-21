import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireSuperAdmin } from "@/middleware/auth";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * GET - Rate limit ban listesini getir
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

    // Redis'ten tüm rate limit key'lerini al
    const keys = await redis.keys("@ratelimit/*");
    
    console.log('Found Redis keys:', keys.length, keys);
    
    const bans = [];
    for (const key of keys) {
      const data = await redis.get(key);
      console.log('Key:', key, 'Data:', data);
      
      if (data && typeof data === "object") {
        const typedData = data as { reset?: number; count?: number };
        if (typedData.reset && typedData.reset > Date.now()) {
          // Key format: @ratelimit/{action}:{identifier}
          const keyWithoutPrefix = key.replace('@ratelimit/', '');
          const firstColonIndex = keyWithoutPrefix.indexOf(':');
          
          const action = firstColonIndex !== -1 
            ? keyWithoutPrefix.substring(0, firstColonIndex)
            : keyWithoutPrefix;
          const identifier = firstColonIndex !== -1
            ? keyWithoutPrefix.substring(firstColonIndex + 1)
            : 'unknown';

          bans.push({
            key,
            identifier,
            action,
            bannedUntil: typedData.reset,
            attempts: typedData.count || 0,
          });
        }
      }
    }

    // Zamana göre sırala (en yakın biten önce)
    bans.sort((a, b) => a.bannedUntil - b.bannedUntil);

    console.log('Returning bans:', bans.length);

    return NextResponse.json({
      success: true,
      bans,
      total: bans.length,
    });
  } catch (error) {
    console.error("Get rate limits error:", error);
    return NextResponse.json(
      { error: "Failed to get rate limits", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Belirli bir rate limit ban'ı kaldır
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

    const body = await req.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    // Redis'ten key'i sil
    await redis.del(key);

    return NextResponse.json({
      success: true,
      message: "Rate limit ban removed",
    });
  } catch (error) {
    console.error("Delete rate limit error:", error);
    return NextResponse.json(
      { error: "Failed to remove rate limit" },
      { status: 500 }
    );
  }
}
