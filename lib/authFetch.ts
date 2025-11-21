/**
 * Authenticated Fetch Utility
 * Firebase token ile API çağrıları yapmak için
 */

import { auth } from './firebase';

/**
 * Firebase token ile fetch yapar
 * Otomatik olarak Authorization header ekler
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Firebase'den token al
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  // Authorization header ekle
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * JSON response için authFetch wrapper
 */
export async function authFetchJSON<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authFetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
