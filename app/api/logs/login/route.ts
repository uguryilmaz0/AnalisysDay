import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { getClientIP, getIPInfo, getDeviceType } from '@/lib/ipUtils';

/**
 * POST - Login activity'yi kaydet
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

    // Login log oluştur
    const loginLog = {
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
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    // Firestore'a kaydet (Admin SDK kullanarak)
    await adminDb.collection('login_logs').add(loginLog);

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
