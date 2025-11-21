import { NextRequest, NextResponse } from "next/server";
import { testRedisConnection, checkRateLimit } from "@/lib/rateLimitServer";

/**
 * GET - Test Redis connection and rate limiting
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
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
      redis: {
        connected: redisConnected,
        url: process.env.UPSTASH_REDIS_REST_URL ? '✓ configured' : '✗ missing',
        token: process.env.UPSTASH_REDIS_REST_TOKEN ? '✓ configured' : '✗ missing',
      },
      rateLimit: {
        success: rateLimitResult.success,
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset).toISOString(),
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
