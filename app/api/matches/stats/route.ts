import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/matches/stats
 * Filtrelenmiş maç istatistiklerini döndürür
 * Query params:
 * - leagues: string[] (comma separated)
 * - dateFrom: string (YYYY-MM-DD)
 * - dateTo: string (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse parameters
    const leaguesParam = searchParams.get('leagues');
    const leagues = leaguesParam ? leaguesParam.split(',').map(l => l.trim()) : [];
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // RPC function kullan (çok daha hızlı)
    if (leagues.length > 0) {
      const { data, error } = await supabase.rpc('get_match_stats_by_leagues', {
        league_names: leagues
      });

      if (error) {
        console.error('❌ RPC get_match_stats_by_leagues hatası:', error);
        // Fallback'e düş
      } else if (data && data.length > 0) {
        const stats = data[0];
        return NextResponse.json({
          totalMatches: Number(stats.total_matches),
          over15: {
            count: Number(stats.over15_count),
            percentage: stats.over15_percentage.toString()
          },
          over25: {
            count: Number(stats.over25_count),
            percentage: stats.over25_percentage.toString()
          },
          btts: {
            count: Number(stats.btts_count),
            percentage: stats.btts_percentage.toString()
          },
          source: 'rpc'
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' // 30 min
          }
        });
      }
    }

    // Fallback: Manuel hesaplama (RPC yoksa veya hata varsa)
    let query = supabase
      .from('matches')
      .select('ft_over_15, ft_over_25, btts');

    // League filter
    if (leagues.length > 0) {
      if (leagues.length === 1) {
        query = query.eq('league', leagues[0]);
      } else {
        query = query.in('league', leagues);
      }
    }

    // Date filters
    if (dateFrom) {
      query = query.gte('match_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('match_date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Stats query hatası:', error);
      throw error;
    }

    // Client-side hesaplama
    const totalMatches = data?.length || 0;
    let over15Count = 0;
    let over25Count = 0;
    let bttsCount = 0;

    data?.forEach((match) => {
      if (Number(match.ft_over_15) === 1) over15Count++;
      if (Number(match.ft_over_25) === 1) over25Count++;
      if (Number(match.btts) === 1) bttsCount++;
    });

    return NextResponse.json({
      totalMatches,
      over15: {
        count: over15Count,
        percentage: totalMatches > 0 ? ((over15Count / totalMatches) * 100).toFixed(2) : '0'
      },
      over25: {
        count: over25Count,
        percentage: totalMatches > 0 ? ((over25Count / totalMatches) * 100).toFixed(2) : '0'
      },
      btts: {
        count: bttsCount,
        percentage: totalMatches > 0 ? ((bttsCount / totalMatches) * 100).toFixed(2) : '0'
      },
      source: 'fallback'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    console.error('❌ Stats endpoint hatası:', error);
    return NextResponse.json(
      { error: 'İstatistikler yüklenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
