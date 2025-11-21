import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimitServer";
import { getUserByUsername } from "@/lib/db";
import { serverLogger } from "@/lib/serverLogger";

/**
 * POST - Login with server-side rate limiting
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Email/username and password required" },
        { status: 400 }
      );
    }

    // Server-side rate limit (IP based)
    const rateLimitResult = await checkRateLimit(req, 'auth-login');
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      
      serverLogger.warn('Login rate limit exceeded', {
        action: 'login_rate_limit',
        emailOrUsername,
      });
      
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: `Çok fazla giriş denemesi. ${Math.ceil(retryAfter / 60)} dakika sonra tekrar deneyin.`,
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

    // Email or username lookup
    let email = emailOrUsername;
    if (!emailOrUsername.includes("@")) {
      const user = await getUserByUsername(emailOrUsername);
      if (!user) {
        serverLogger.warn('Login failed - user not found', {
          action: 'login_failed',
          emailOrUsername,
        });
        return NextResponse.json(
          { error: "USER_NOT_FOUND", message: "Kullanıcı bulunamadı" },
          { status: 404 }
        );
      }
      email = user.email;
    }

    // Rate limit passed - client tarafında Firebase auth yapacak
    return NextResponse.json({
      success: true,
      email,
      rateLimitInfo: {
        remaining: rateLimitResult.remaining,
        limit: rateLimitResult.limit,
      },
    });

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
