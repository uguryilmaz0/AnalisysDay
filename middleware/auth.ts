/**
 * Authentication Middleware
 * API Routes için auth kontrolü
 * 
 * Kullanım:
 * - verifyAuth(): Token doğrular, uid döner
 * - requireAuth(): Token doğrular, user data döner
 * - requireAdmin(): Admin kontrolü yapar
 * - getAuthToken(): Request'ten token çıkarır
 */

import { NextRequest } from 'next/server';
import { verifyIdToken, getUserData, isAdmin as checkIsAdmin } from '@/lib/firebaseAdmin';
import { serverLogger as logger } from '@/lib/serverLogger';

/**
 * Request'ten auth token'ı çıkar
 * 
 * Token konumları (sırayla):
 * 1. Authorization header (Bearer token)
 * 2. Cookie (auth-token)
 */
export function getAuthToken(req: NextRequest): string | null {
  // 1. Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Cookie
  const cookieToken = req.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Token'ı doğrula ve decoded token döner
 * 
 * @throws {Error} Token geçersiz veya eksikse
 */
export async function verifyAuth(req: NextRequest) {
  const token = getAuthToken(req);

  if (!token) {
    logger.warn('Auth token missing', {
      path: req.nextUrl.pathname,
      method: req.method,
    });
    throw new Error('Unauthorized: Token missing');
  }

  try {
    const decodedToken = await verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    logger.warn('Token verification failed', {
      path: req.nextUrl.pathname,
      error,
    });
    throw new Error('Unauthorized: Invalid token');
  }
}

/**
 * Auth kontrolü + user data döner
 * 
 * @throws {Error} Token geçersiz veya user bulunamazsa
 */
export async function requireAuth(req: NextRequest) {
  const decodedToken = await verifyAuth(req);
  
  try {
    const userData = await getUserData(decodedToken.uid);
    
    if (!userData) {
      throw new Error('User data not found');
    }
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email,
      role: userData.role || 'user',
      ...userData,
    };
  } catch (error) {
    logger.error('Failed to get user data', {
      uid: decodedToken.uid,
      error,
    });
    throw new Error('User not found');
  }
}

/**
 * Admin kontrolü yapar (admin veya moderator)
 * 
 * @returns Success: { user } | Error: { error, status }
 */
export async function requireAdmin(
  req: NextRequest
): Promise<
  | { user: { uid: string; email: string | null; role: string } }
  | { error: string; status: number }
> {
  try {
    const user = await requireAuth(req);

    const isAdminUser = await checkIsAdmin(user.uid);

    if (!isAdminUser) {
      logger.warn('Admin access denied', {
        uid: user.uid,
        email: user.email,
        path: req.nextUrl.pathname,
      });
      return { error: 'Forbidden: Admin access required', status: 403 };
    }

    return { user: { uid: user.uid, email: user.email, role: user.role } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Admin authentication failed', {
      path: req.nextUrl.pathname,
      error: errorMessage,
    });
    return { 
      error: errorMessage.includes('Token missing') || errorMessage.includes('Invalid token')
        ? errorMessage
        : 'Authentication failed', 
      status: 401 
    };
  }
}

/**
 * Moderator kontrolü (moderator veya üstü)
 * Moderator: Sadece analiz yükleme yetkisi
 * 
 * @returns Success: { user } | Error: { error, status }
 */
export async function requireModerator(
  req: NextRequest
): Promise<
  | { user: { uid: string; email: string | null; role: string } }
  | { error: string; status: number }
> {
  try {
    const user = await requireAuth(req);

    // moderator, admin, veya superAdmin olmalı
    if (user.role !== 'moderator' && user.role !== 'admin') {
      logger.warn('Moderator access denied', {
        uid: user.uid,
        email: user.email,
        role: user.role,
        path: req.nextUrl.pathname,
      });
      return { error: 'Forbidden: Moderator access required', status: 403 };
    }

    return { user: { uid: user.uid, email: user.email, role: user.role } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Moderator authentication failed', {
      path: req.nextUrl.pathname,
      error: errorMessage,
    });
    return { 
      error: errorMessage.includes('Token missing') || errorMessage.includes('Invalid token')
        ? errorMessage
        : 'Authentication failed', 
      status: 401 
    };
  }
}

/**
 * Super Admin kontrolü (NEXT_PUBLIC_SUPER_ADMIN_EMAILS)
 * Super adminler için email doğrulama ve diğer kontroller bypass edilir
 * 
 * @returns Success: { user } | Error: { error, status }
 */
export async function requireSuperAdmin(
  req: NextRequest
): Promise<
  | { user: Awaited<ReturnType<typeof requireAuth>> }
  | { error: string; status: number }
> {
  try {
    // Önce token'ı doğrula
    const decodedToken = await verifyAuth(req);
    
    // Super admin email listesi
    const superAdminEmails = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS
      ?.split(',')
      .map(e => e.trim().toLowerCase()) || [];

    const userEmail = decodedToken.email?.toLowerCase() || '';
    const isSuperAdmin = superAdminEmails.includes(userEmail);

    if (!isSuperAdmin) {
      logger.warn('Super admin access denied - not in super admin list', {
        uid: decodedToken.uid,
        email: decodedToken.email,
        path: req.nextUrl.pathname,
      });
      return {
        error: 'Forbidden: Super admin access required',
        status: 403,
      };
    }

    // Super admin olduğu doğrulandı, user data al (email doğrulama bypass)
    const userData = await getUserData(decodedToken.uid);
    
    if (!userData) {
      return {
        error: 'User data not found',
        status: 404,
      };
    }

    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email,
      role: userData.role || 'admin',
      ...userData,
    };

    // Super admin authenticated - log atma (her request'te log atılmasın)
    return { user };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Super admin authentication failed', {
      path: req.nextUrl.pathname,
      error: errorMessage,
    });
    return { 
      error: errorMessage.includes('Token missing') || errorMessage.includes('Invalid token')
        ? errorMessage
        : 'Authentication failed', 
      status: 401 
    };
  }
}

/**
 * API Error Response Helper
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: unknown
) {
  const response: { error: string; details?: unknown } = {
    error: message,
  };

  if (details) {
    response.details = details;
  }

  logger.error('API Error', { message, status, details });

  return Response.json(response, { status });
}

/**
 * API Success Response Helper
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
) {
  return Response.json(data, { status });
}
