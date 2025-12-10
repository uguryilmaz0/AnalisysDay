import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getClientIP, getIPInfo, getDeviceType } from '@/lib/ipUtils';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * POST - Login activity'yi kaydet (REDIS)
 * Bu endpoint client-side'dan çağrılır (AuthContext.signIn içinde)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, success, failReason } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // IP bilgilerini al
    const ipAddress = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const deviceType = getDeviceType(userAgent);

    // Detaylı IP bilgisi al (VPN, country, ISP etc.)
    const ipInfo = await getIPInfo(req);

    const timestamp = Date.now();
    // Login log oluştur
    const loginLog = {
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || null,
      email,
      ipAddress,
      userAgent,
      deviceType,
      country: ipInfo.country || null,
      isp: ipInfo.isp || null,
      asn: ipInfo.asn || null,
      isVPN: ipInfo.isVPN || false,
      isProxy: ipInfo.isProxy || false,
      isTor: ipInfo.isTor || false,
      success: success || false,
      failReason: failReason || null,
      timestamp,
    };

    // Redis'e kaydet (sorted set - timestamp score)
    await redis.zadd('login_logs:all', {
      score: timestamp,
      member: JSON.stringify(loginLog),
    });
    
    // Son 2000 login log tut
    await redis.zremrangebyrank('login_logs:all', 0, -2001);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log login activity error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to log login activity';
    
    // Login logging hatası uygulamayı kırmamalı, sadece loglayalım
    return NextResponse.json(
      { error: 'Failed to log login activity', details: errorMessage },
      { status: 500 }
    );
  }
}
