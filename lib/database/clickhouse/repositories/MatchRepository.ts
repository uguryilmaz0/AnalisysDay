import { ClickHouseClientManager } from '../client';
import { MatchData, MatchFilters, MatchesResponse, DailyStats, AggregatedStats, TeamStats } from '@/lib/database/types/match.types_v2';

/**
 * ClickHouse Match Repository
 * Handles all match-related database operations with optimized queries
 */
export class MatchRepository {
  private client = ClickHouseClientManager.getInstance();

  /**
   * Find matches with advanced filtering
   */
  async findMatches(filters: MatchFilters): Promise<MatchesResponse> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const whereConditions: string[] = [];
      const params: Record<string, unknown> = {};

      // League filter - most important for performance
      if (filters.leagues && filters.leagues.length > 0) {
        if (filters.leagues.length === 1) {
          whereConditions.push('league = {league:String}');
          params.league = filters.leagues[0];
        } else {
          whereConditions.push('league IN ({leagues:Array(String)})');
          params.leagues = filters.leagues;
        }
      }

      // Date filters
      if (filters.dateFrom) {
        whereConditions.push('year >= {dateFrom:String}');
        params.dateFrom = filters.dateFrom.substring(0, 4);
      }
      if (filters.dateTo) {
        whereConditions.push('year <= {dateTo:String}');
        params.dateTo = filters.dateTo.substring(0, 4);
      }

      // Time filters (assuming time is stored as string HH:MM)
      if (filters.timeFrom) {
        whereConditions.push('time >= {timeFrom:String}');
        params.timeFrom = filters.timeFrom;
      }
      if (filters.timeTo) {
        whereConditions.push('time <= {timeTo:String}');
        params.timeTo = filters.timeTo;
      }

      // Team filters
      if (filters.homeTeam) {
        whereConditions.push('home_team ILIKE {homeTeam:String}');
        params.homeTeam = `%${filters.homeTeam}%`;
      }
      if (filters.awayTeam) {
        whereConditions.push('away_team ILIKE {awayTeam:String}');
        params.awayTeam = `%${filters.awayTeam}%`;
      }
      if (filters.teamSearch) {
        whereConditions.push('(home_team ILIKE {teamSearch:String} OR away_team ILIKE {teamSearch:String})');
        params.teamSearch = `%${filters.teamSearch}%`;
      }

      // Dynamic odds filters
      this.addOddsFilters(filters, whereConditions, params);

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count query for pagination
      const countQuery = `
        SELECT count() as total
        FROM matches
        ${whereClause}
      `;

      // Main query with pagination
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 100, 1000);
      const offset = (page - 1) * limit;

      const dataQuery = `
        SELECT *
        FROM matches
        ${whereClause}
        ORDER BY year DESC, month DESC, day DESC
        LIMIT {limit:UInt32} OFFSET {offset:UInt32}
      `;

      // Add pagination params
      params.limit = limit;
      params.offset = offset;

      console.log('🔍 ClickHouse query:', dataQuery.replace(/\s+/g, ' ').trim());
      console.log('🎯 Query params:', params);

      // Execute queries in parallel
      const [countResult, dataResult] = await Promise.all([
        this.client.query(countQuery, params),
        this.client.query(dataQuery, params)
      ]);

      const total = countResult.length > 0 ? Number((countResult[0] as Record<string, unknown>).total) : 0;
      const dataRows = dataResult as MatchData[];

      return {
        success: true,
        data: dataRows,
        total,
        page,
        limit
      };

    } catch (error) {
      console.error('❌ MatchRepository.findMatches error:', error);
      throw new Error(`Failed to fetch matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add dynamic odds filters to query
   * Client-side sends filters like: { ft_home_odds: ">1.70", ft_draw_odds: "<3.5" }
   */
  private addOddsFilters(
    filters: Record<string, string | number | boolean | string[]>, 
    whereConditions: string[], 
    params: Record<string, unknown>
  ): void {
    // Map filter keys to database column names
    const oddsFieldsMap: Record<string, string> = {
      'ft_home_odds': 'ft_home_odds_close',
      'ft_draw_odds': 'ft_draw_odds_close',
      'ft_away_odds': 'ft_away_odds_close',
      'ht_home_odds': 'ht_home_odds_close',
      'ht_draw_odds': 'ht_draw_odds_close',
      'ht_away_odds': 'ht_away_odds_close',
      'ft_dc_1x_odds': 'ft_dc_1x_odds_close',
      'ft_dc_12_odds': 'ft_dc_12_odds_close',
      'ft_dc_x2_odds': 'ft_dc_x2_odds_close',
      'ht_dc_1x_odds': 'ht_dc_1x_odds_close',
      'ht_dc_12_odds': 'ht_dc_12_odds_close',
      'ht_dc_x2_odds': 'ht_dc_x2_odds_close',
      'ah_minus_05_odds': 'ah_minus_05_home_odds_close',
      'ah_0_odds': 'ah_0_home_odds_close',
      'ah_plus_05_odds': 'ah_plus_05_home_odds_close',
      'eh_minus_1_odds': 'eh_minus_1_home_odds_close',
      'ht_ft_11_odds': 'ht_ft_11_odds_close',
      'ht_ft_1x_odds': 'ht_ft_1x_odds_close',
      'ht_ft_12_odds': 'ht_ft_12_odds_close',
      'ht_ft_x1_odds': 'ht_ft_x1_odds_close',
      'ht_ft_xx_odds': 'ht_ft_xx_odds_close',
      'ht_ft_x2_odds': 'ht_ft_x2_odds_close',
      'ht_ft_21_odds': 'ht_ft_21_odds_close',
      'ht_ft_2x_odds': 'ht_ft_2x_odds_close',
      'ht_ft_22_odds': 'ht_ft_22_odds_close'
    };

    console.log('🔍 Checking odds filters:', Object.keys(oddsFieldsMap).map(k => ({ key: k, value: filters[k] })).filter(f => f.value));

    for (const [filterKey, dbColumn] of Object.entries(oddsFieldsMap)) {
      const filterValue = filters[filterKey];
      
      if (filterValue && typeof filterValue === 'string') {
        const parsed = this.parseOddsFilter(filterValue);
        console.log(`🎲 Odds Filter: ${filterKey} = "${filterValue}" →`, parsed);
        
        if (parsed) {
          if (parsed.operator === 'between' && Array.isArray(parsed.value)) {
            // Between range: "1.5-2.5"
            const minKey = `${filterKey}_min`;
            const maxKey = `${filterKey}_max`;
            whereConditions.push(`${dbColumn} BETWEEN {${minKey}:Float64} AND {${maxKey}:Float64}`);
            params[minKey] = parsed.value[0];
            params[maxKey] = parsed.value[1];
          } else {
            // Single comparison: ">1.70", "<2.5", "1.80"
            const op = parsed.operator === 'eq' ? '=' : parsed.operator === 'gt' ? '>' : '<';
            whereConditions.push(`${dbColumn} ${op} {${filterKey}:Float64}`);
            params[filterKey] = parsed.value;
          }
        }
      }
    }
  }

  /**
   * Parse odds filter string into operator and value
   * Examples: ">1.70" → {operator: 'gt', value: 1.7}
   *          "<2.5" → {operator: 'lt', value: 2.5}
   *          "1.80" → {operator: 'eq', value: 1.8}
   *          "1.5-2.5" → {operator: 'between', value: [1.5, 2.5]}
   */
  private parseOddsFilter(filter: string): { operator: 'gt' | 'lt' | 'eq' | 'between'; value: number | number[] } | null {
    if (!filter || typeof filter !== 'string') return null;

    const trimmed = filter.trim();
    
    // Between range: "1.5-2.5"
    const betweenMatch = trimmed.match(/^(\d+\.?\d*)-(\d+\.?\d*)$/);
    if (betweenMatch) {
      const min = parseFloat(betweenMatch[1]);
      const max = parseFloat(betweenMatch[2]);
      if (!isNaN(min) && !isNaN(max) && min < max) {
        return { operator: 'between', value: [min, max] };
      }
    }

    // Greater than: ">1.70"
    if (trimmed.startsWith('>')) {
      const value = parseFloat(trimmed.substring(1));
      if (!isNaN(value)) {
        return { operator: 'gt', value };
      }
    }

    // Less than: "<2.5"
    if (trimmed.startsWith('<')) {
      const value = parseFloat(trimmed.substring(1));
      if (!isNaN(value)) {
        return { operator: 'lt', value };
      }
    }

    // Exact match with tolerance: "1.70" → BETWEEN 1.695 AND 1.705
    // Float hassasiyeti için küçük tolerans kullan
    const value = parseFloat(trimmed);
    if (!isNaN(value)) {
      const tolerance = 0.005; // ±0.005 tolerans
      return { operator: 'between', value: [value - tolerance, value + tolerance] };
    }

    return null;
  }

  /**
   * Get total matches count
   */
  async getTotalCount(): Promise<number> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const result = await this.client.query(
        'SELECT count() as total FROM matches'
      );
      
      return result.length > 0 ? Number((result[0] as Record<string, unknown>).total) : 0;
    } catch (error) {
      console.error('❌ MatchRepository.getTotalCount error:', error);
      return 0;
    }
  }

  /**
   * Get unique leagues using materialized view
   */
  async getUniqueLeagues(): Promise<{ league: string; match_count: number }[]> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const result = await this.client.query(`
          SELECT league, match_count
          FROM mv_unique_leagues
          ORDER BY match_count DESC
        `);
      
      return result as { league: string; match_count: number }[];
    } catch (error) {
      console.error('❌ MatchRepository.getUniqueLeagues error:', error);
      return [];
    }
  }

  /**
   * Get top leagues by match count
   */
  async getTopLeagues(limit: number = 20): Promise<{ league: string; match_count: number }[]> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const result = await this.client.query(`
          SELECT league, match_count
          FROM mv_unique_leagues
          ORDER BY match_count DESC
          LIMIT {limit:UInt32}
        `, { limit });
      
      return result as { league: string; match_count: number }[];
    } catch (error) {
      console.error('❌ MatchRepository.getTopLeagues error:', error);
      return [];
    }
  }

  /**
   * Search leagues by name
   */
  async searchLeagues(searchTerm: string): Promise<{ league: string; match_count: number }[]> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const result = await this.client.query(`
          SELECT league, match_count
          FROM mv_unique_leagues
          WHERE league ILIKE {searchTerm:String}
          ORDER BY match_count DESC
        `, { searchTerm: `%${searchTerm}%` });
      
      return result as { league: string; match_count: number }[];
    } catch (error) {
      console.error('❌ MatchRepository.searchLeagues error:', error);
      return [];
    }
  }

  /**
   * Get daily statistics using materialized view
   */
  async getDailyStats(filters: MatchFilters = {}): Promise<DailyStats[]> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const whereConditions: string[] = [];
      const params: Record<string, unknown> = {};

      // League filter
      if (filters.leagues && filters.leagues.length > 0) {
        if (filters.leagues.length === 1) {
          whereConditions.push('league = {league:String}');
          params.league = filters.leagues[0];
        } else {
          whereConditions.push('league IN ({leagues:Array(String)})');
          params.leagues = filters.leagues;
        }
      }

      // Date filters
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        whereConditions.push('year >= {yearFrom:String} AND month >= {monthFrom:String} AND day >= {dayFrom:String}');
        params.yearFrom = dateFrom.getFullYear().toString();
        params.monthFrom = (dateFrom.getMonth() + 1).toString().padStart(2, '0');
        params.dayFrom = dateFrom.getDate().toString().padStart(2, '0');
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        whereConditions.push('year <= {yearTo:String} AND month <= {monthTo:String} AND day <= {dayTo:String}');
        params.yearTo = dateTo.getFullYear().toString();
        params.monthTo = (dateTo.getMonth() + 1).toString().padStart(2, '0');
        params.dayTo = dateTo.getDate().toString().padStart(2, '0');
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const result = await this.client.query(`
          SELECT *
          FROM mv_daily_stats
          ${whereClause}
          ORDER BY year DESC, month DESC, day DESC
          LIMIT 100
        `, params);
      
      return result as DailyStats[];
    } catch (error) {
      console.error('❌ MatchRepository.getDailyStats error:', error);
      return [];
    }
  }

  /**
   * Get monthly league statistics using materialized view
   */
  async getMonthlyLeagueStats(filters: MatchFilters = {}): Promise<DailyStats[]> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const whereConditions: string[] = [];
      const params: Record<string, unknown> = {};

      // League filter
      if (filters.leagues && filters.leagues.length > 0) {
        if (filters.leagues.length === 1) {
          whereConditions.push('league = {league:String}');
          params.league = filters.leagues[0];
        } else {
          whereConditions.push('league IN ({leagues:Array(String)})');
          params.leagues = filters.leagues;
        }
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const result = await this.client.query(`
          SELECT *
          FROM mv_monthly_league_stats
          ${whereClause}
          ORDER BY year DESC, month DESC, total_matches DESC
          LIMIT 100
        `, params);
      
      return result as DailyStats[];
    } catch (error) {
      console.error('❌ MatchRepository.getMonthlyLeagueStats error:', error);
      return [];
    }
  }

  /**
   * Get team statistics using materialized view
   */
  async getTeamStats(filters: MatchFilters = {}): Promise<TeamStats[]> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const whereConditions: string[] = [];
      const params: Record<string, unknown> = {};

      // Team filter
      if (filters.teamSearch) {
        whereConditions.push('team_name ILIKE {teamSearch:String}');
        params.teamSearch = `%${filters.teamSearch}%`;
      }
      if (filters.homeTeam) {
        whereConditions.push('team_name = {homeTeam:String} AND venue = \'home\'');
        params.homeTeam = filters.homeTeam;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const result = await this.client.query(`
          SELECT *
          FROM mv_team_stats
          ${whereClause}
          ORDER BY total_matches DESC
          LIMIT 50
        `, params);
      
      return result as TeamStats[];
    } catch (error) {
      console.error('❌ MatchRepository.getTeamStats error:', error);
      return [];
    }
  }

  /**
   * Get aggregated statistics for matches with filters
   */
  async getAggregatedStats(filters: MatchFilters = {}): Promise<AggregatedStats | Record<string, never>> {
    try {
      // Ensure connection
      await this.client.connect();
      
      const whereConditions: string[] = [];
      const params: Record<string, unknown> = {};

      // League filter
      if (filters.leagues && filters.leagues.length > 0) {
        if (filters.leagues.length === 1) {
          whereConditions.push('league = {league:String}');
          params.league = filters.leagues[0];
        } else {
          whereConditions.push('league IN ({leagues:Array(String)})');
          params.leagues = filters.leagues;
        }
      }

      // Date filters
      if (filters.dateFrom) {
        const yearFrom = filters.dateFrom.split('-')[0];
        whereConditions.push('year >= {dateFrom:String}');
        params.dateFrom = yearFrom;
      }
      if (filters.dateTo) {
        const yearTo = filters.dateTo.split('-')[0];
        whereConditions.push('year <= {dateTo:String}');
        params.dateTo = yearTo;
      }

      // Odds filters - reuse the same logic from findMatches
      this.addOddsFilters(filters, whereConditions, params);

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const result = await this.client.query(`
          SELECT 
            count() as total_matches,
            sum(ht_over_05) as ht_over_05_count,
            sum(ft_over_15) as ft_over_15_count,
            sum(ft_over_25) as ft_over_25_count,
            sum(ft_over_35) as ft_over_35_count,
            sum(btts) as btts_count,
            avg(ft_home_odds_close) as avg_home_odds,
            avg(ft_draw_odds_close) as avg_draw_odds,
            avg(ft_away_odds_close) as avg_away_odds,
            count(DISTINCT league) as unique_leagues,
            count(DISTINCT home_team) as unique_teams
          FROM matches
          ${whereClause}
        `, params);
      
      return result.length > 0 ? (result[0] as AggregatedStats) : {};
    } catch (error) {
      console.error('❌ MatchRepository.getAggregatedStats error:', error);
      return {};
    }
  }
}