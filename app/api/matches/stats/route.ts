import { NextRequest, NextResponse } from 'next/server';
import { MatchRepository } from '@/lib/database/clickhouse/repositories/MatchRepository';
import { MatchFilters } from '@/lib/database/types/match.types_v2';

/**
 * GET /api/matches/stats
 * Filtrelenmiş maç istatistiklerini döndürür (ClickHouse optimized)
 * Query params:
 * - leagues: string[] (comma separated)
 * - dateFrom: string (YYYY-MM-DD)
 * - dateTo: string (YYYY-MM-DD)
 * - type: 'daily' | 'monthly' | 'team' | 'aggregated' (default: aggregated)
 * Uses: mv_daily_stats, mv_monthly_league_stats, mv_team_stats materialized views
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse parameters
    const leaguesParam = searchParams.get('leagues');
    const leagues = leaguesParam ? leaguesParam.split(',').map(l => l.trim()).filter(Boolean) : [];
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const teamSearch = searchParams.get('teamSearch');
    const statsType = searchParams.get('type') || 'aggregated'; // daily, monthly, team, aggregated
    
    // Build ClickHouse filters
    const filters: MatchFilters = {};
    
    if (leagues.length > 0) {
      filters.leagues = leagues;
    }
    if (dateFrom) {
      filters.dateFrom = dateFrom;
    }
    if (dateTo) {
      filters.dateTo = dateTo;
    }
    if (teamSearch) {
      filters.teamSearch = teamSearch;
    }

    // Odds filters - same as matches endpoint
    const oddsFilters = [
      'ft_home_odds', 'ft_draw_odds', 'ft_away_odds',
      'ht_home_odds', 'ht_draw_odds', 'ht_away_odds',
      'ft_dc_1x_odds', 'ft_dc_12_odds', 'ft_dc_x2_odds',
      'ht_dc_1x_odds', 'ht_dc_12_odds', 'ht_dc_x2_odds',
      'ah_minus_05_odds', 'ah_0_odds', 'ah_plus_05_odds',
      'eh_minus_1_odds',
      'ht_ft_11_odds', 'ht_ft_1x_odds', 'ht_ft_12_odds',
      'ht_ft_x1_odds', 'ht_ft_xx_odds', 'ht_ft_x2_odds',
      'ht_ft_21_odds', 'ht_ft_2x_odds', 'ht_ft_22_odds'
    ];

    for (const oddsType of oddsFilters) {
      const filterValue = searchParams.get(oddsType);
      if (filterValue) {
        filters[oddsType] = filterValue;
        console.log(`🎲 Stats Odds Filter: ${oddsType} = "${filterValue}"`);
      }
    }

    console.log(`🚀 ClickHouse Stats endpoint - Type: ${statsType}, Filters:`, {
      leagues: leagues.length,
      dateRange: dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'all',
      teams: teamSearch || 'all',
      oddsFilters: Object.keys(filters).filter(k => k.includes('odds'))
    });

    const matchRepo = new MatchRepository();
    let result: any;
    let source: string;

    switch (statsType) {
      case 'daily':
        console.log('📊 Getting daily stats from mv_daily_stats...');
        result = await matchRepo.getDailyStats(filters);
        source = 'clickhouse_mv_daily_stats';
        
        return NextResponse.json({
          type: 'daily',
          data: result,
          count: result.length,
          source
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=1800' // 30 min cache
          }
        });

      case 'monthly':
        console.log('📊 Getting monthly stats from mv_monthly_league_stats...');
        result = await matchRepo.getMonthlyLeagueStats(filters);
        source = 'clickhouse_mv_monthly_league_stats';
        
        return NextResponse.json({
          type: 'monthly',
          data: result,
          count: result.length,
          source
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600' // 1 hour cache
          }
        });

      case 'team':
        console.log('📊 Getting team stats from mv_team_stats...');
        result = await matchRepo.getTeamStats(filters);
        source = 'clickhouse_mv_team_stats';
        
        return NextResponse.json({
          type: 'team',
          data: result,
          count: result.length,
          source
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=1800' // 30 min cache
          }
        });

      case 'aggregated':
      default:
        console.log('📊 Getting aggregated stats from matches table...');
        result = await matchRepo.getAggregatedStats(filters);
        source = 'clickhouse_aggregated';
        
        // Calculate percentages
        const totalMatches = Number(result.total_matches || 0);
        const htOver05Count = Number(result.ht_over_05_count || 0);
        const ftOver15Count = Number(result.ft_over_15_count || 0);
        const ftOver25Count = Number(result.ft_over_25_count || 0);
        const ftOver35Count = Number(result.ft_over_35_count || 0);
        const bttsCount = Number(result.btts_count || 0);

        const calculatePercentage = (count: number, total: number): string => {
          return total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
        };

        return NextResponse.json({
          type: 'aggregated',
          totalMatches,
          htOver05: {
            count: htOver05Count,
            percentage: calculatePercentage(htOver05Count, totalMatches)
          },
          ftOver15: {
            count: ftOver15Count,
            percentage: calculatePercentage(ftOver15Count, totalMatches)
          },
          ftOver25: {
            count: ftOver25Count,
            percentage: calculatePercentage(ftOver25Count, totalMatches)
          },
          ftOver35: {
            count: ftOver35Count,
            percentage: calculatePercentage(ftOver35Count, totalMatches)
          },
          btts: {
            count: bttsCount,
            percentage: calculatePercentage(bttsCount, totalMatches)
          },
          avgOdds: {
            home: parseFloat(result.avg_home_odds || 0).toFixed(2),
            draw: parseFloat(result.avg_draw_odds || 0).toFixed(2),
            away: parseFloat(result.avg_away_odds || 0).toFixed(2)
          },
          uniqueLeagues: Number(result.unique_leagues || 0),
          uniqueTeams: Number(result.unique_teams || 0),
          source
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=1800' // 30 min cache
          }
        });
    }

  } catch (error) {
    console.error('❌ ClickHouse Stats endpoint hatası:', error);
    return NextResponse.json(
      { 
        error: 'İstatistikler yüklenemedi', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}