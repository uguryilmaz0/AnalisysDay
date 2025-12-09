import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
 * Filtrelenmiş maçları döndürür
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
    const leagues = leaguesParam ? leaguesParam.split(',').map(l => l.trim()) : [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000); // Max 1000
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const timeFrom = searchParams.get('timeFrom');
    const timeTo = searchParams.get('timeTo');
    const homeTeam = searchParams.get('homeTeam');
    const awayTeam = searchParams.get('awayTeam');
    const teamSearch = searchParams.get('teamSearch');
    
    // Odds filters
    const oddsFilters: Record<string, string> = {
      ft_home_odds_close: searchParams.get('ft_home_odds') || '',
      ft_draw_odds_close: searchParams.get('ft_draw_odds') || '',
      ft_away_odds_close: searchParams.get('ft_away_odds') || '',
      ht_home_odds_close: searchParams.get('ht_home_odds') || '',
      ht_draw_odds_close: searchParams.get('ht_draw_odds') || '',
      ht_away_odds_close: searchParams.get('ht_away_odds') || '',
      ft_dc_1x_odds_close: searchParams.get('ft_dc_1x_odds') || '',
      ft_dc_12_odds_close: searchParams.get('ft_dc_12_odds') || '',
      ft_dc_x2_odds_close: searchParams.get('ft_dc_x2_odds') || '',
      ht_dc_1x_odds_close: searchParams.get('ht_dc_1x_odds') || '',
      ht_dc_12_odds_close: searchParams.get('ht_dc_12_odds') || '',
      ht_dc_x2_odds_close: searchParams.get('ht_dc_x2_odds') || '',
      ah_minus_05_home_odds_close: searchParams.get('ah_minus_05_odds') || '',
      ah_0_home_odds_close: searchParams.get('ah_0_odds') || '',
      ah_plus_05_home_odds_close: searchParams.get('ah_plus_05_odds') || '',
      eh_minus_1_home_odds_close: searchParams.get('eh_minus_1_odds') || '',
      ht_ft_11_odds_close: searchParams.get('ht_ft_11_odds') || '',
      ht_ft_1x_odds_close: searchParams.get('ht_ft_1x_odds') || '',
      ht_ft_12_odds_close: searchParams.get('ht_ft_12_odds') || '',
      ht_ft_x1_odds_close: searchParams.get('ht_ft_x1_odds') || '',
      ht_ft_xx_odds_close: searchParams.get('ht_ft_xx_odds') || '',
      ht_ft_x2_odds_close: searchParams.get('ht_ft_x2_odds') || '',
      ht_ft_21_odds_close: searchParams.get('ht_ft_21_odds') || '',
      ht_ft_2x_odds_close: searchParams.get('ht_ft_2x_odds') || '',
      ht_ft_22_odds_close: searchParams.get('ht_ft_22_odds') || '',
    };

    // Build query
    let query = supabase.from('matches').select('*', { count: 'exact' });

    // League filter (en önemli filtre)
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
      // Her iki takım varsa: A vs B veya B vs A
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
    // NOT: Aynı kolon için gte+lte çağrısı yapılmayacak, sadece tek operatör kullanılacak
    for (const [column, filterValue] of Object.entries(oddsFilters)) {
      if (!filterValue) continue;
      
      const parsed = parseOddsFilter(filterValue);
      if (!parsed) {
        console.warn(`⚠️ Odds filtre parse edilemedi: ${column} = "${filterValue}"`);
        continue;
      }
      
      console.log(`🔍 Odds filtre uygulanıyor: ${column} ${parsed.operator} ${parsed.value}`);
      
      if (parsed.operator === 'gt') {
        query = query.gt(column, parsed.value);
      } else if (parsed.operator === 'lt') {
        query = query.lt(column, parsed.value);
      } else if (parsed.operator === 'eq') {
        // Tam eşit için sadece eq kullan (tolerance yok)
        query = query.eq(column, parsed.value);
      }
    }

    // Sort by date (descending)
    query = query.order('match_date', { ascending: false });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Matches query hatası:', error);
      throw error;
    }

    const totalPages = count ? Math.ceil(count / limit) : 1;
    const hasMore = count ? page < totalPages : false;

    return NextResponse.json({
      data: data || [],
      count: data?.length || 0,
      totalMatches: count || 0,
      page,
      limit,
      totalPages,
      hasMore
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' // 30 min cache
      }
    });
  } catch (error) {
    console.error('❌ Matches endpoint hatası:', error);
    return NextResponse.json(
      { error: 'Maçlar yüklenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
