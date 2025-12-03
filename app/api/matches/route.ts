import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/matches
 * Filtrelenmiş maçları döndürür
 * Query params:
 * - leagues: string[] (comma separated)
 * - page: number (default: 1)
 * - limit: number (default: 100, max: 1000)
 * - dateFrom: string (YYYY-MM-DD)
 * - dateTo: string (YYYY-MM-DD)
 * - homeTeam: string
 * - awayTeam: string
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
    const homeTeam = searchParams.get('homeTeam');
    const awayTeam = searchParams.get('awayTeam');

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

    // Team filters
    if (homeTeam && awayTeam) {
      // Her iki takım varsa: A vs B veya B vs A
      query = query.or(
        `and(home_team.eq.${homeTeam},away_team.eq.${awayTeam}),and(home_team.eq.${awayTeam},away_team.eq.${homeTeam})`
      );
    } else if (homeTeam) {
      query = query.or(`home_team.eq.${homeTeam},home_team.ilike.${homeTeam}%`);
    } else if (awayTeam) {
      query = query.or(`away_team.eq.${awayTeam},away_team.ilike.${awayTeam}%`);
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
