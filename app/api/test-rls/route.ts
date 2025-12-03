/**
 * Supabase RLS Test API
 * GET /api/test-rls - RLS politikalarını test eder
 * 
 * Bu endpoint ile RLS'in doğru çalıştığını kontrol edebilirsiniz.
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🧪 Testing Supabase RLS...');

    // Test 1: SELECT - İzin verilmeli
    const { data: selectData, error: selectError } = await supabase
      .from('matches')
      .select('id, date, home_team, away_team')
      .limit(1);

    // Test 2: INSERT - Reddedilmeli (RLS policy)
    const { error: insertError } = await supabase
      .from('matches')
      .insert({
        date: '2025-01-01',
        home_team: 'Test Team',
        away_team: 'Test Team 2',
      });

    // Test 3: DELETE - Reddedilmeli (RLS policy)
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('id', 999999); // Random ID

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        select: {
          allowed: !selectError,
          recordCount: selectData?.length || 0,
          error: selectError?.message || null,
          status: !selectError ? '✅ PASSED' : '❌ FAILED',
        },
        insert: {
          blocked: !!insertError,
          error: insertError?.message || null,
          status: insertError?.message?.includes('violates row-level security')
            ? '✅ PASSED (Blocked as expected)'
            : '❌ FAILED (Should be blocked)',
        },
        delete: {
          blocked: !!deleteError,
          error: deleteError?.message || null,
          status: deleteError?.message?.includes('violates row-level security')
            ? '✅ PASSED (Blocked as expected)'
            : '❌ FAILED (Should be blocked)',
        },
      },
      summary: {
        message: 'RLS Test Complete',
        selectWorks: !selectError,
        insertBlocked: !!insertError,
        deleteBlocked: !!deleteError,
        overall:
          !selectError && !!insertError && !!deleteError
            ? '✅ RLS is working correctly!'
            : '⚠️ RLS might not be configured properly',
      },
    });
  } catch (error) {
    console.error('❌ RLS test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
