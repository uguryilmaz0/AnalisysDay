/**
 * ⚠️ DEPRECATED - SUPABASE VERSION
 * TODO: Replace with ClickHouse sync implementation
 * 
 * Günlük maç verilerini external API'den çekip ClickHouse'a aktarır
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    error: 'DEPRECATED: This endpoint is replaced by ClickHouse implementation',
    message: 'Please use new ClickHouse data import workflow'
  }, { status: 410 }); // 410 Gone
}
