import { NextRequest, NextResponse } from 'next/server';
import { MatchRepository } from '@/lib/database/clickhouse/repositories/MatchRepository';
import { MatchFilters } from '@/lib/database/types/match.types_v2';

// Helper: Parse odds filter (">2.5", "<1.8", "1.75")
function parseOddsFilter(filterValue: string): { operator: 'gt' | 'lt' | 'eq', value: number } | null {
  if (!filterValue) return null;
  
  const trimmed = filterValue.trim();
  if (trimmed.startsWith('>')) {
    const val = parseFloat(trimmed.substring(1));
    return !isNaN(val) ? { operator: 'gt', value: val } : null;
  }
  if (trimmed.startsWith('<')) {
    const val = parseFloat(trimmed.substring(1));
    return !isNaN(val) ? { operator: 'lt', value: val } : null;
  }
  const val = parseFloat(trimmed);
  return !isNaN(val) ? { operator: 'eq', value: val } : null;
}

/**
 * GET /api/matches
 * Filtrelenmiş maçları döndürür (ClickHouse)
 * Query params:
 * - leagues: string[] (comma separated)
 * - page: number (default: 1)
 * - limit: number (default: 100, max: 1000)
 * - dateFrom: string (YYYY-MM-DD)
 * - dateTo: string (YYYY-MM-DD)
 * - timeFrom: string (HH:MM)
 * - timeTo: string (HH:MM)
 * - homeTeam: string
 * - awayTeam: string
 * - teamSearch: string
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse parameters
    const leaguesParam = searchParams.get('leagues');
    const leagues = leaguesParam ? leaguesParam.split(',').map(l => l.trim()).filter(Boolean) : [];
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '100')), 1000); // Max 1000
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const timeFrom = searchParams.get('timeFrom');
    const timeTo = searchParams.get('timeTo');
    const homeTeam = searchParams.get('homeTeam');
    const awayTeam = searchParams.get('awayTeam');
    const teamSearch = searchParams.get('teamSearch');
    
    // Build ClickHouse filters
    const filters: MatchFilters = {};
    
    // League filter (en önemli filtre)
    if (leagues.length > 0) {
      filters.leagues = leagues;
    }

    // Date filters
    if (dateFrom) {
      filters.dateFrom = dateFrom;
    }
    if (dateTo) {
      filters.dateTo = dateTo;
    }

    // Time filters  
    if (timeFrom) {
      filters.timeFrom = timeFrom;
    }
    if (timeTo) {
      filters.timeTo = timeTo;
    }

    // Team filters
    if (homeTeam) {
      filters.homeTeam = homeTeam;
    }
    if (awayTeam) {
      filters.awayTeam = awayTeam;
    }
    if (teamSearch) {
      filters.teamSearch = teamSearch;
    }

    // Odds filters - Support all major betting markets
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
        // Direkt olarak string değeri geçir, MatchRepository kendi parse edecek
        filters[oddsType] = filterValue;
        console.log(`🎲 API Odds Filter: ${oddsType} = "${filterValue}"`);
      }
    }

    // Pagination
    filters.page = page;
    filters.limit = limit;

    console.log(`🔍 ClickHouse matches query - Filters:`, {
      leagues: leagues.length,
      dateRange: dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'all',
      teams: homeTeam || awayTeam || teamSearch || 'all',
      oddsFilters: Object.keys(filters).filter(k => k.includes('odds')),
      oddsValues: Object.entries(filters).filter(([k]) => k.includes('odds')).reduce((acc, [k, v]) => ({...acc, [k]: v}), {}),
      page,
      limit
    });

    // Use MatchRepository for ClickHouse queries
    const matchRepo = new MatchRepository();
    const result = await matchRepo.findMatches(filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      count: result.data.length,
      totalMatches: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
      hasMore: page < Math.ceil(result.total / limit)
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' // 30 min cache
      }
    });
  } catch (error) {
    console.error('❌ ClickHouse matches endpoint hatası:', error);
    return NextResponse.json(
      { error: 'Maçlar yüklenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
