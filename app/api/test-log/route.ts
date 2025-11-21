import { NextRequest, NextResponse } from "next/server";
import { serverLogger as logger } from "@/lib/serverLogger";

/**
 * POST - Test log oluştur (Development only)
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { level = 'info', message = 'Test log message' } = body;

    // Test log oluştur
    switch (level) {
      case 'error':
        logger.error(message, { action: 'test', component: 'test-endpoint' });
        break;
      case 'warn':
        logger.warn(message, { action: 'test', component: 'test-endpoint' });
        break;
      default:
        logger.info(message, { action: 'test', component: 'test-endpoint' });
    }

    return NextResponse.json({
      success: true,
      message: 'Test log created',
      level,
    });
  } catch (error) {
    console.error('Create test log error:', error);
    return NextResponse.json(
      { error: 'Failed to create test log' },
      { status: 500 }
    );
  }
}
