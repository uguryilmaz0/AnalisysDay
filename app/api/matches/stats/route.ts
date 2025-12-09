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
// Parse odds filter helper (same as matches route)
function parseOddsFilter(filterValue: string): { operator: 'gt' | 'lt' | 'eq', value: number } | null {
  if (!filterValue) return null;
  if (filterValue.startsWith('>')) {
    return { operator: 'gt', value: parseFloat(filterValue.substring(1)) };
  } else if (filterValue.startsWith('<')) {
    return { operator: 'lt', value: parseFloat(filterValue.substring(1)) };
  } else {
    return { operator: 'eq', value: parseFloat(filterValue) };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse parameters
    const leaguesParam = searchParams.get('leagues');
    const leagues = leaguesParam ? leaguesParam.split(',').map(l => l.trim()) : [];
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const timeFrom = searchParams.get('timeFrom');
    const timeTo = searchParams.get('timeTo');
    const homeTeam = searchParams.get('homeTeam');
    const awayTeam = searchParams.get('awayTeam');
    const teamSearch = searchParams.get('teamSearch');
    
    // Odds filters - 25 columns
    const oddsFilters: Record<string, string> = {};
    const oddsColumns = [
      'ft_home_odds_close', 'ft_draw_odds_close', 'ft_away_odds_close',
      'ht_home_odds_close', 'ht_draw_odds_close', 'ht_away_odds_close',
      'ft_dc_1x_odds_close', 'ft_dc_12_odds_close', 'ft_dc_x2_odds_close',
      'ht_dc_1x_odds_close', 'ht_dc_12_odds_close', 'ht_dc_x2_odds_close',
      'ah_minus_05_home_odds_close', 'ah_0_home_odds_close', 'ah_plus_05_home_odds_close',
      'eh_minus_1_home_odds_close',
      'ht_ft_11_odds_close', 'ht_ft_1x_odds_close', 'ht_ft_12_odds_close',
      'ht_ft_x1_odds_close', 'ht_ft_xx_odds_close', 'ht_ft_x2_odds_close',
      'ht_ft_21_odds_close', 'ht_ft_2x_odds_close', 'ht_ft_22_odds_close'
    ];
    oddsColumns.forEach(column => {
      const value = searchParams.get(column.replace('_close', ''));
      if (value) oddsFilters[column] = value;
    });

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
      .select('ft_over_15, ft_over_25, btts', { count: 'exact' });

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

    // Time filters
    if (timeFrom) {
      query = query.gte('time', timeFrom);
    }
    if (timeTo) {
      query = query.lte('time', timeTo);
    }

    // Team filters
    const teamConditions: string[] = [];
    if (homeTeam && awayTeam) {
      query = query.or(
        `and(home_team.eq.${homeTeam},away_team.eq.${awayTeam}),and(home_team.eq.${awayTeam},away_team.eq.${homeTeam})`
      );
    } else {
      if (homeTeam) {
        teamConditions.push(`home_team.eq.${homeTeam}`);
        teamConditions.push(`home_team.ilike.${homeTeam}%`);
      }
      if (awayTeam) {
        teamConditions.push(`away_team.eq.${awayTeam}`);
        teamConditions.push(`away_team.ilike.${awayTeam}%`);
      }
      if (teamSearch) {
        teamConditions.push(`home_team.ilike.%${teamSearch}%`);
        teamConditions.push(`away_team.ilike.%${teamSearch}%`);
      }
      
      if (teamConditions.length > 0) {
        query = query.or(teamConditions.join(','));
      }
    }

    // Odds filters - Her kolon ayrı ayrı filtrele
    for (const [column, filterValue] of Object.entries(oddsFilters)) {
      if (!filterValue) continue;
      
      const parsed = parseOddsFilter(filterValue);
      if (!parsed) continue;
      
      if (parsed.operator === 'gt') {
        query = query.gt(column, parsed.value);
      } else if (parsed.operator === 'lt') {
        query = query.lt(column, parsed.value);
      } else if (parsed.operator === 'eq') {
        query = query.eq(column, parsed.value);
      }
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
