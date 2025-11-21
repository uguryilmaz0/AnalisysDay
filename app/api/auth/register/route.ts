import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimitServer";
import { isUsernameAvailable } from "@/lib/db";
import { serverLogger } from "@/lib/serverLogger";

/**
 * POST - Register with server-side rate limiting
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username } = body;

    if (!email || !username) {
      return NextResponse.json(
        { error: "Email and username required" },
        { status: 400 }
      );
    }

    // Server-side rate limit (IP based)
    const rateLimitResult = await checkRateLimit(req, 'auth-register');
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      
      serverLogger.warn('Register rate limit exceeded', {
        action: 'register_rate_limit',
        email,
        username,
      });
      
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: `Çok fazla kayıt denemesi. ${Math.ceil(retryAfter / 60)} dakika sonra tekrar deneyin.`,
          retryAfter,
          remaining: rateLimitResult.remaining,
          limit: rateLimitResult.limit,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Username availability check
    const available = await isUsernameAvailable(username);
    if (!available) {
      serverLogger.warn('Register failed - username taken', {
        action: 'register_failed',
        username,
      });
      return NextResponse.json(
        { error: "USERNAME_TAKEN", message: "Bu kullanıcı adı zaten kullanılıyor" },
        { status: 409 }
      );
    }

    // Rate limit passed - client tarafında Firebase auth yapacak
    return NextResponse.json({
      success: true,
      username,
      rateLimitInfo: {
        remaining: rateLimitResult.remaining,
        limit: rateLimitResult.limit,
      },
    });

  } catch (error) {
    console.error("Register API error:", error);
    serverLogger.error('Register API error', {
      action: 'register_error',
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
