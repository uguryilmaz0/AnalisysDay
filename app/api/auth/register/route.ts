import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimitServer";
import { isUsernameAvailable, getUserByEmail } from "@/lib/db";
import { serverLogger } from "@/lib/serverLogger";
import { adminAuth } from "@/lib/firebaseAdmin";

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

    // 1. Email duplicate check (Firestore)
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      // Email zaten kullanılıyor - Firebase Auth'da kontrol et
      try {
        const userRecord = await adminAuth.getUserByEmail(email);
        
        if (!userRecord.emailVerified) {
          // Email doğrulanmamış - doğrulama sayfasına yönlendir
          serverLogger.info('Register blocked - email exists but not verified', {
            action: 'register_redirect_verification',
            email,
            username,
            existingUid: userRecord.uid,
          });
          
          return NextResponse.json(
            { 
              error: "EMAIL_NOT_VERIFIED", 
              message: "Bu email adresi ile kayıt başlatılmış ancak doğrulanmamış. Lütfen email adresinizi kontrol edin.",
              requiresVerification: true,
              email,
            },
            { status: 409 }
          );
        } else {
          // Email doğrulanmış - kullanıcı login yapmalı
          serverLogger.warn('Register failed - email already registered', {
            action: 'register_failed',
            email,
            username,
          });
          
          return NextResponse.json(
            { 
              error: "EMAIL_TAKEN", 
              message: "Bu email adresi zaten kullanılıyor. Lütfen giriş yapın.",
            },
            { status: 409 }
          );
        }
      } catch (authError: unknown) {
        // Firebase Auth'da bulunamadı ama Firestore'da var - veri tutarsızlığı
        const errorCode = (authError as { code?: string }).code;
        if (errorCode === 'auth/user-not-found') {
          serverLogger.warn('Data inconsistency - email in Firestore but not in Auth', {
            email,
            firestoreUid: existingUserByEmail.uid,
          });
          // Firestore'dan silinmiş kullanıcı - kayda devam edebilir
        } else {
          throw authError;
        }
      }
    }

    // 2. Username availability check
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
