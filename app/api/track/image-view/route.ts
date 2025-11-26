/**
 * Image View Tracking API
 * POST /api/track/image-view - Track image views, right-clicks, screenshots
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { getIPInfo, getDeviceType, isBot } from '@/lib/ipUtils';
import { serverLogger } from '@/lib/serverLogger';

interface TrackingRequest {
  type: 'view' | 'right_click' | 'screenshot' | 'download';
  userId: string;
  userEmail: string;
  userName: string;
  analysisId: string;
  analysisTitle: string;
  imageUrl: string;
  imageIndex: number;
}

export async function POST(req: NextRequest) {
  try {
    // Body parsing
    let body: TrackingRequest;
    try {
      body = (await req.json()) as TrackingRequest;
    } catch (parseError) {
      console.error('[API /track/image-view] JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const {
      type,
      userId,
      userEmail,
      userName,
      analysisId,
      analysisTitle,
      imageUrl,
      imageIndex,
    } = body;

    // Validation
    if (
      !type ||
      !userId ||
      !userEmail ||
      !analysisId ||
      !imageUrl ||
      imageIndex === undefined
    ) {
      console.error('[API /track/image-view] Missing required fields:', {
        type: !!type,
        userId: !!userId,
        userEmail: !!userEmail,
        analysisId: !!analysisId,
        imageUrl: !!imageUrl,
        imageIndex: imageIndex !== undefined,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get IP and VPN info (with error handling)
    let ipInfo;
    try {
      ipInfo = await getIPInfo(req);
    } catch (ipError) {
      console.error('[API /track/image-view] IP detection failed:', ipError);
      // Fallback to basic info
      ipInfo = {
        ip: 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        country: 'Unknown',
        isVPN: false,
        isProxy: false,
        isTor: false,
      };
    }

    const deviceType = getDeviceType(ipInfo.userAgent);

    // Block bots
    if (isBot(ipInfo.userAgent)) {
      console.log('[API /track/image-view] Bot detected - blocking', {
        ip: ipInfo.ip,
        userAgent: ipInfo.userAgent,
      });
      return NextResponse.json(
        { error: 'Bot detected', blocked: true },
        { status: 403 }
      );
    }

    // VPN Warning (log but allow for now - strategy C)
    if (ipInfo.isVPN || ipInfo.isProxy || ipInfo.isTor) {
      console.warn('[API /track/image-view] VPN/Proxy detected', {
        userId,
        userEmail,
        ip: ipInfo.ip,
        isVPN: ipInfo.isVPN,
      });
    }

    // Save to Firestore (with error handling)
    const trackingData = {
      type,
      userId,
      userEmail,
      userName: userName || 'Unknown',
      analysisId,
      analysisTitle: analysisTitle || 'Unknown',
      imageUrl,
      imageIndex,
      ipAddress: ipInfo.ip,
      userAgent: ipInfo.userAgent,
      deviceType,
      country: ipInfo.country || 'Unknown',
      isp: ipInfo.isp || 'Unknown',
      asn: ipInfo.asn || 'Unknown',
      isVPN: ipInfo.isVPN,
      isProxy: ipInfo.isProxy,
      isTor: ipInfo.isTor,
      timestamp: Date.now(),
      createdAt: new Date(),
    };

    let docRef;
    try {
      docRef = await adminDb.collection('image_tracking').add(trackingData);
      console.log('[API /track/image-view] Tracking saved:', {
        type,
        userId,
        trackingId: docRef.id,
      });
    } catch (firestoreError) {
      console.error('[API /track/image-view] Firestore save failed:', firestoreError);
      // Log but don't fail the request
      docRef = { id: 'failed' };
    }

    // Log to system logs as well (fire-and-forget)
    try {
      serverLogger.info(`Image ${type}: ${analysisTitle}`, {
        userId,
        userEmail,
        action: `image_${type}`,
        metadata: {
          analysisId,
          imageIndex,
          isVPN: ipInfo.isVPN,
          country: ipInfo.country,
        },
      });
    } catch (logError) {
      // Logging failure shouldn't break the request
      console.error('[API /track/image-view] System log failed:', logError);
    }

    return NextResponse.json(
      {
        success: true,
        trackingId: docRef.id,
        vpnDetected: ipInfo.isVPN || ipInfo.isProxy || ipInfo.isTor,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[API /track/image-view] Error:', {
      message: errorMessage,
      stack: errorStack,
      error,
    });
    
    serverLogger.error('Image tracking failed', {
      error: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      { 
        error: 'Failed to track image view',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
