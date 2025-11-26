/**
 * IP Address and Geolocation Utilities
 * Handles IP extraction, VPN detection, and geolocation
 */

import { NextRequest } from 'next/server';

export interface IPInfo {
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isp?: string;
  asn?: string;
}

/**
 * Extract real client IP from Next.js request
 * Handles proxies and load balancers (Vercel)
 */
export function getClientIP(req: NextRequest): string {
  // Try x-forwarded-for (most common with proxies)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP if multiple
    const ip = forwardedFor.split(',')[0].trim();
    // Normalize IPv6 localhost to IPv4
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    return ip;
  }

  // Try x-real-ip
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    const ip = realIP.trim();
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    return ip;
  }

  // Vercel specific
  const vercelIP = req.headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    const ip = vercelIP.split(',')[0].trim();
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    return ip;
  }

  // Fallback - localhost
  return '127.0.0.1';
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'unknown';
}

/**
 * Get device type from user agent
 */
export function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' | 'bot' {
  const ua = userAgent.toLowerCase();

  // Bot detection
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
    return 'bot';
  }

  // Mobile detection
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }

  // Tablet detection
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * Check if request is from a bot/crawler
 */
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python',
    'java',
    'go-http',
  ];

  const ua = userAgent.toLowerCase();
  return botPatterns.some((pattern) => ua.includes(pattern));
}

/**
 * Get VPN/Proxy status using IPHub API
 * Free tier: 1000 requests/day
 */
export async function getVPNStatus(ip: string): Promise<{
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  country?: string;
  isp?: string;
  asn?: string;
}> {
  const apiKey = process.env.IPHUB_API_KEY;

  // Skip if no API key
  if (!apiKey) {
    console.warn('[IPUtils] IPHUB_API_KEY not configured - VPN detection disabled');
    return {
      isVPN: false,
      isProxy: false,
      isTor: false,
    };
  }

  // Skip localhost and private IPs
  if (
    ip === 'unknown' ||
    ip === '::1' || // IPv6 localhost
    ip === '::ffff:127.0.0.1' || // IPv6-mapped IPv4 localhost
    ip.startsWith('127.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('fe80:') // IPv6 link-local
  ) {
    return {
      isVPN: false,
      isProxy: false,
      isTor: false,
      country: 'Localhost',
      isp: 'Local Network',
      asn: 'N/A',
    };
  }

  try {
    const response = await fetch(`https://v2.api.iphub.info/ip/${ip}`, {
      headers: {
        'X-Key': apiKey,
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`IPHub API error: ${response.status}`);
    }

    const data = await response.json();

    // IPHub block codes:
    // 0 = Residential/Safe
    // 1 = VPN/Proxy/Bad IP
    // 2 = Datacenter IP
    const block = data.block || 0;

    return {
      isVPN: block === 1,
      isProxy: block === 1,
      isTor: block === 1, // IPHub doesn't separate Tor, but includes it in block=1
      country: data.countryName || data.countryCode,
      isp: data.isp,
      asn: data.asn ? `AS${data.asn}` : undefined,
    };
  } catch (error) {
    console.error('[IPUtils] VPN detection failed:', error);
    // Fail-safe: allow access on API error
    return {
      isVPN: false,
      isProxy: false,
      isTor: false,
    };
  }
}

/**
 * Get geolocation from IP (using IPHub data)
 * Already included in VPN check, but can be called separately
 */
export async function getGeolocation(
  ip: string
): Promise<{ country?: string; city?: string }> {
  const vpnStatus = await getVPNStatus(ip);
  return {
    country: vpnStatus.country,
    city: undefined, // IPHub free tier doesn't provide city
  };
}

/**
 * Get complete IP information
 */
export async function getIPInfo(req: NextRequest): Promise<IPInfo> {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);
  const vpnStatus = await getVPNStatus(ip);

  return {
    ip,
    userAgent,
    country: vpnStatus.country,
    isVPN: vpnStatus.isVPN,
    isProxy: vpnStatus.isProxy,
    isTor: vpnStatus.isTor,
    isp: vpnStatus.isp,
    asn: vpnStatus.asn,
  };
}
