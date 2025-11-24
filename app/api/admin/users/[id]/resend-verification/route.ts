import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/middleware/auth';
import { withRateLimit } from '@/lib/rateLimitServer';
import { serverLogger as logger } from '@/lib/serverLogger';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST - Resend email verification
 * Admin panelden email doğrulama linkini tekrar gönder
 */
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;

    // 1. Rate limiting
    const rateLimitError = await withRateLimit(req, 'admin-update');
    if (rateLimitError) return rateLimitError;

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const admin = authResult.user;

    // 3. Get user
    const userRecord = await adminAuth.getUser(userId);
    
    if (!userRecord.email) {
      return NextResponse.json(
        { error: 'User has no email' },
        { status: 400 }
      );
    }

    if (userRecord.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // 4. Generate email verification link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/verify-email`,
      handleCodeInApp: false,
    };

    const verificationLink = await adminAuth.generateEmailVerificationLink(
      userRecord.email,
      actionCodeSettings
    );

    // 5. Send email (TODO: Email service entegrasyonu)
    // Şimdilik linki döndürüyoruz, admin kullanıcıya manuel gönderebilir
    
    logger.info('Email verification link generated', {
      userId,
      email: userRecord.email,
      generatedBy: admin.uid,
    });

    return NextResponse.json({
      success: true,
      message: 'Email verification link generated',
      verificationLink,
      email: userRecord.email,
    });

  } catch (error) {
    logger.error('Failed to resend email verification', { error });
    return NextResponse.json(
      { 
        error: 'Failed to generate verification link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
