import { NextRequest, NextResponse } from "next/server";
import { testRedisConnection, checkRateLimit } from "@/lib/rateLimitServer";

/**
 * GET - Test Redis connection and rate limiting
 */
export async function GET(req: NextRequest) {
  // Production'da sadece admin check ekleyelim
  const authHeader = req.headers.get('authorization');
  const isDevMode = process.env.NODE_ENV !== 'production';
  const hasAdminAuth = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  
  if (!isDevMode && !hasAdminAuth) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin only' },
      { status: 403 }
    );
  }

  try {
    // Test Redis connection
    const redisConnected = await testRedisConnection();

    // Test rate limit
    const rateLimitResult = await checkRateLimit(req, 'api-general');

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      redis: {
        connected: redisConnected,
        url: process.env.UPSTASH_REDIS_REST_URL ? '✓ configured' : '✗ missing',
        token: process.env.UPSTASH_REDIS_REST_TOKEN ? '✓ configured' : '✗ missing',
        urlPreview: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 30) + '...',
      },
      rateLimit: {
        success: rateLimitResult.success,
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset).toISOString(),
        error: 'error' in rateLimitResult ? rateLimitResult.error : undefined,
      },
      request: {
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent')?.substring(0, 50),
      },
    });
  } catch (error) {
    console.error('Rate limit test error:', error);
    return NextResponse.json(
      { 
        error: 'Rate limit test failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
