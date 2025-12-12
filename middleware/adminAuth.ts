/**
 * Admin Authentication Middleware
 * Checks user roles and permissions via Firebase Auth headers
 */
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export interface AuthContext {
  user: {
    uid: string;
    email: string;
    role: 'user' | 'admin' | 'moderator';
    superAdmin?: boolean;
  } | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModeratorOrAbove: boolean;
}

/**
 * Extract and verify Firebase Auth token from request headers
 */
export async function verifyAuthToken(request: NextRequest): Promise<string | null> {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return null;
    }

    return idToken;
  } catch (error) {
    console.error('❌ Token extraction failed:', error);
    return null;
  }
}

/**
 * Get user authentication context from request
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  try {
    const idToken = await verifyAuthToken(request);
    
    if (!idToken) {
      return {
        user: null,
        isAdmin: false,
        isSuperAdmin: false,
        isModeratorOrAbove: false
      };
    }

    // Verify token with Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', decodedToken.uid));
    
    if (!userDoc.exists()) {
      return {
        user: null,
        isAdmin: false,
        isSuperAdmin: false,
        isModeratorOrAbove: false
      };
    }

    const userData = userDoc.data() as User;
    
    const isAdmin = userData.role === 'admin' || userData.superAdmin === true;
    const isSuperAdmin = userData.superAdmin === true;
    const isModeratorOrAbove = userData.role === 'moderator' || isAdmin;

    return {
      user: {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        superAdmin: userData.superAdmin
      },
      isAdmin,
      isSuperAdmin,
      isModeratorOrAbove
    };
  } catch (error) {
    console.error('❌ Auth context verification failed:', error);
    return {
      user: null,
      isAdmin: false,
      isSuperAdmin: false,
      isModeratorOrAbove: false
    };
  }
}

/**
 * Middleware function to check if user is admin
 */
export async function requireAdmin(request: NextRequest): Promise<AuthContext | Response> {
  const authContext = await getAuthContext(request);
  
  if (!authContext.isAdmin) {
    return new Response(
      JSON.stringify({
        error: 'Yetkisiz erişim',
        message: 'Bu işlem için admin yetkisi gerekli',
        required: 'admin'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  return authContext;
}

/**
 * Middleware function to check if user is super admin
 */
export async function requireSuperAdmin(request: NextRequest): Promise<AuthContext | Response> {
  const authContext = await getAuthContext(request);
  
  if (!authContext.isSuperAdmin) {
    return new Response(
      JSON.stringify({
        error: 'Yetkisiz erişim',
        message: 'Bu işlem için süper admin yetkisi gerekli',
        required: 'super-admin'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  return authContext;
}

/**
 * Middleware function to check if user is moderator or above
 */
export async function requireModeratorOrAbove(request: NextRequest): Promise<AuthContext | Response> {
  const authContext = await getAuthContext(request);
  
  if (!authContext.isModeratorOrAbove) {
    return new Response(
      JSON.stringify({
        error: 'Yetkisiz erişim',
        message: 'Bu işlem için moderatör veya daha yüksek yetki gerekli',
        required: 'moderator'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  return authContext;
}