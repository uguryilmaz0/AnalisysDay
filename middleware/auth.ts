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
import { logger } from '@/lib/logger';

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
 * Admin kontrolü yapar
 * 
 * @throws {Error} User admin değilse
 */
export async function requireAdmin(req: NextRequest) {
  const user = await requireAuth(req);

  const isAdminUser = await checkIsAdmin(user.uid);

  if (!isAdminUser) {
    logger.warn('Admin access denied', {
      uid: user.uid,
      email: user.email,
      path: req.nextUrl.pathname,
    });
    throw new Error('Forbidden: Admin access required');
  }

  logger.info('Admin authenticated', {
    uid: user.uid,
    email: user.email,
    path: req.nextUrl.pathname,
  });

  return user;
}

/**
 * Super Admin kontrolü (NEXT_PUBLIC_SUPER_ADMIN_EMAILS)
 * 
 * @throws {Error} User super admin değilse
 */
export async function requireSuperAdmin(req: NextRequest) {
  const user = await requireAdmin(req);

  const superAdminEmails = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS
    ?.split(',')
    .map(e => e.trim().toLowerCase()) || [];

  const isSuperAdmin = superAdminEmails.includes(user.email.toLowerCase());

  if (!isSuperAdmin) {
    logger.warn('Super admin access denied', {
      uid: user.uid,
      email: user.email,
      path: req.nextUrl.pathname,
    });
    throw new Error('Forbidden: Super admin access required');
  }

  return user;
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
