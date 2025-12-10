import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { requireSuperAdmin } from "@/middleware/auth";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * GET - Rate limit ban listesini getir (OPTIMIZE edilmiş versiyon)
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

    // KRITIK OPTIMIZASYON: Sadece aktif ban'ları getir
    // Eski kayıtları temizle ve işleme dahil etme
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // Son 1 saat
    
    // Redis'ten tüm rate limit key'lerini al
    let keys: string[] = [];
    try {
      // KEYS komutu blocking ama alternative yok (SCAN daha yavaş olabilir küçük dataset için)
      const scanResult = await redis.keys("@ratelimit/*");
      keys = Array.isArray(scanResult) ? scanResult : [];
    } catch (error) {
      console.error('Redis KEYS error:', error);
      keys = [];
    }
    
    // OPTIMIZASYON: Sadece yakın zamanlı event key'lerini işle
    // events:17644500000 formatındaki eski timestamp'leri filtrele
    const recentKeys = keys.filter(key => {
      // events: ile bitiyorsa timestamp kontrol et
      const match = key.match(/:events:(\d+)$/);
      if (match) {
        const timestamp = parseInt(match[1]);
        // Son 1 saat içindeki event'leri tut
        return timestamp > oneHourAgo;
      }
      // Diğer key'leri (IP bazlı) tut
      return true;
    });

    console.log(`Rate limit check: ${keys.length} total keys, ${recentKeys.length} recent keys`);
    
    // Eğer hiç key yoksa boş array dön
    if (recentKeys.length === 0) {
      return NextResponse.json({
        success: true,
        bans: [],
        total: 0,
        processed: 0,
        skipped: keys.length,
      });
    }
    
    // PIPELINE kullanarak tüm TYPE sorgularını tek seferde yap
    const pipeline = redis.pipeline();
    recentKeys.forEach(key => {
      pipeline.type(key);
    });
    
    const typeResults = await pipeline.exec() as string[];
    
    const bans: Array<{
      key: string;
      identifier: string;
      action: string;
      bannedUntil: number;
      attempts: number;
    }> = [];
    const batchSize = 50; // Her batch'te 50 key işle
    
    for (let i = 0; i < recentKeys.length; i += batchSize) {
      const batch = recentKeys.slice(i, i + batchSize);
      const batchPipeline = redis.pipeline();
      
      // Batch içindeki her key için gerekli sorguları pipeline'a ekle
      batch.forEach((key, idx) => {
        const globalIdx = i + idx;
        const keyType = typeResults[globalIdx];
        
        if (keyType === 'zset') {
          const windowStart = now - (15 * 60 * 1000);
          batchPipeline.zcount(key, windowStart, now);
          batchPipeline.zrange(key, 0, -1, { withScores: true, rev: true });
        } else if (keyType === 'string') {
          batchPipeline.get(key);
          batchPipeline.ttl(key);
        } else if (keyType === 'hash') {
          batchPipeline.hgetall(key);
        }
      });
      
      const batchResults = await batchPipeline.exec();
      let resultIdx = 0;
      
      // Batch sonuçlarını işle
      batch.forEach((key, idx) => {
        const globalIdx = i + idx;
        const keyType = typeResults[globalIdx];
        
        try {
          if (keyType === 'zset') {
            const count = batchResults[resultIdx++] as number;
            const allElements = batchResults[resultIdx++] as (string | number)[];
            
            if (count >= 5) {
              let lastTimestamp = now;
              if (Array.isArray(allElements) && allElements.length >= 2) {
                const firstScore = allElements[1];
                lastTimestamp = typeof firstScore === 'number' ? firstScore : 
                               typeof firstScore === 'string' ? parseFloat(firstScore) : now;
              }
              
              const bannedUntil = lastTimestamp + (15 * 60 * 1000);
              
              if (bannedUntil > now) {
                const keyWithoutPrefix = key.replace('@ratelimit/', '');
                const parts = keyWithoutPrefix.split(':');
                const action = parts[0] || 'unknown';
                const identifier = parts.slice(1, -1).join(':') || 'unknown';

                bans.push({
                  key,
                  identifier,
                  action,
                  bannedUntil,
                  attempts: count,
                });
              }
            } else {
              resultIdx += 0; // Skip unused results
            }
          } else if (keyType === 'string') {
            const data = batchResults[resultIdx++];
            const ttl = batchResults[resultIdx++] as number;
            
            if (typeof data === 'number' && ttl > 0) {
              const count = data;
              const bannedUntil = now + (ttl * 1000);
              
              if (count >= 5 && bannedUntil > now) {
                const keyWithoutPrefix = key.replace('@ratelimit/', '');
                const firstColonIndex = keyWithoutPrefix.indexOf(':');
                const action = firstColonIndex !== -1 
                  ? keyWithoutPrefix.substring(0, firstColonIndex)
                  : keyWithoutPrefix;
                
                const afterAction = keyWithoutPrefix.substring(firstColonIndex + 1);
                const lastColonIndex = afterAction.lastIndexOf(':');
                let identifier = 'unknown';
                
                if (lastColonIndex !== -1) {
                  const lastPart = afterAction.substring(lastColonIndex + 1);
                  if (/^\d+$/.test(lastPart)) {
                    identifier = afterAction.substring(0, lastColonIndex);
                  } else {
                    identifier = afterAction;
                  }
                } else {
                  identifier = afterAction;
                }

                bans.push({
                  key,
                  identifier,
                  action,
                  bannedUntil,
                  attempts: count,
                });
              }
            }
          } else if (keyType === 'hash') {
            const data = batchResults[resultIdx++] as Record<string, string>;
            
            if (data && typeof data === 'object') {
              const reset = Number(data.reset || data.r);
              const count = Number(data.count || data.c || 0);
              
              if (reset && reset > now && count >= 5) {
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
                  bannedUntil: reset,
                  attempts: count,
                });
              }
            }
          }
        } catch (error) {
          console.error('Error processing key in batch:', key, error);
        }
      });
    }

    bans.sort((a, b) => a.bannedUntil - b.bannedUntil);

    return NextResponse.json({
      success: true,
      bans,
      total: bans.length,
      processed: recentKeys.length,
      skipped: keys.length - recentKeys.length,
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
