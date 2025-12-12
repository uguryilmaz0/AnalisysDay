/**
 * Match Repository
 * Specialized repository for match data with custom queries
 */

import { BaseRepository } from './BaseRepository';
import type {
  MatchData,
  MatchFilters,
  MatchesResponse,
  MatchStatistics,
  StatsFilters,
} from '../types/match.types';
import { parseOddsFilter } from '../clickhouse/queryBuilder';
import { clickHouseClient } from '../clickhouse/client';

// ============================================
// Match Repository
// ============================================

export class MatchRepository extends BaseRepository<MatchData> {
  constructor() {
    super('matches', 'id');
  }

  // ============================================
  // Custom Match Queries
  // ============================================

  /**
   * Find matches (alias for getFilteredMatches for API compatibility)
   */
  async findMatches(filters: MatchFilters & { page?: number; limit?: number }): Promise<MatchesResponse> {
    const page = filters.page || 1;
    const limit = filters.limit || 100;
    return this.getFilteredMatches(filters, page, limit);
  }

  /**
   * Get matches with advanced filters
   */
  async getFilteredMatches(
    filters: MatchFilters,
    page: number = 1,
    limit: number = 100
  ): Promise<MatchesResponse> {
    try {
      console.log('🔎 getFilteredMatches called with filters:', JSON.stringify(filters, null, 2));
      
      const offset = (page - 1) * limit;
      
      // Build WHERE conditions
      const conditions: string[] = [];
      const params: Record<string, unknown> = {};
      let paramCounter = 0;

      // League filter (most important - first)
      if (filters.league && filters.league.length > 0) {
        if (filters.league.length === 1) {
          params[`league_${paramCounter}`] = filters.league[0];
          conditions.push(`league = {league_${paramCounter}: String}`);
          paramCounter++;
        } else {
          params[`leagues_${paramCounter}`] = filters.league;
          conditions.push(`league IN {leagues_${paramCounter}: Array(String)}`);
          paramCounter++;
        }
      }

      // Date filters
      if (filters.dateFrom) {
        params[`dateFrom_${paramCounter}`] = filters.dateFrom;
        conditions.push(`match_date >= {dateFrom_${paramCounter}: Date}`);
        paramCounter++;
      }
      if (filters.dateTo) {
        params[`dateTo_${paramCounter}`] = filters.dateTo;
        conditions.push(`match_date <= {dateTo_${paramCounter}: Date}`);
        paramCounter++;
      }

      // Time filters
      if (filters.timeFrom) {
        params[`timeFrom_${paramCounter}`] = filters.timeFrom;
        conditions.push(`time >= {timeFrom_${paramCounter}: String}`);
        paramCounter++;
      }
      if (filters.timeTo) {
        params[`timeTo_${paramCounter}`] = filters.timeTo;
        conditions.push(`time <= {timeTo_${paramCounter}: String}`);
        paramCounter++;
      }

      // Team filters
      if (filters.homeTeam) {
        params[`homeTeam_${paramCounter}`] = `%${filters.homeTeam}%`;
        conditions.push(`home_team ILIKE {homeTeam_${paramCounter}: String}`);
        paramCounter++;
      }
      if (filters.awayTeam) {
        params[`awayTeam_${paramCounter}`] = `%${filters.awayTeam}%`;
        conditions.push(`away_team ILIKE {awayTeam_${paramCounter}: String}`);
        paramCounter++;
      }
      if (filters.teamSearch) {
        params[`teamSearch_${paramCounter}`] = `%${filters.teamSearch}%`;
        conditions.push(
          `(home_team ILIKE {teamSearch_${paramCounter}: String} OR away_team ILIKE {teamSearch_${paramCounter}: String})`
        );
        paramCounter++;
      }

      // Odds filters
      const oddsFilters = [
        { filter: filters.ft_home_odds, field: 'ft_home_odds_close' },
        { filter: filters.ft_draw_odds, field: 'ft_draw_odds_close' },
        { filter: filters.ft_away_odds, field: 'ft_away_odds_close' },
        { filter: filters.ht_home_odds, field: 'ht_home_odds_close' },
        { filter: filters.ht_draw_odds, field: 'ht_draw_odds_close' },
        { filter: filters.ht_away_odds, field: 'ht_away_odds_close' },
        { filter: filters.ft_dc_1x_odds, field: 'ft_dc_1x_odds_close' },
        { filter: filters.ft_dc_12_odds, field: 'ft_dc_12_odds_close' },
        { filter: filters.ft_dc_x2_odds, field: 'ft_dc_x2_odds_close' },
        { filter: filters.ah_minus_05_odds, field: 'ah_minus_05_home_odds_close' },
        { filter: filters.ah_0_odds, field: 'ah_0_home_odds_close' },
        { filter: filters.ah_plus_05_odds, field: 'ah_plus_05_home_odds_close' },
      ];

      console.log('🔍 Checking odds filters:', oddsFilters.map(f => ({ field: f.field, value: f.filter })));

      oddsFilters.forEach(({ filter, field }) => {
        if (filter) {
          const parsed = parseOddsFilter(filter);
          console.log(`🎲 Odds Filter: ${field} = "${filter}" → `, parsed);
          if (parsed) {
            if (parsed.operator === 'between' && Array.isArray(parsed.value)) {
              params[`${field}_min_${paramCounter}`] = parsed.value[0];
              params[`${field}_max_${paramCounter}`] = parsed.value[1];
              conditions.push(
                `${field} BETWEEN {${field}_min_${paramCounter}: Float32} AND {${field}_max_${paramCounter}: Float32}`
              );
              paramCounter++;
            } else {
              params[`${field}_${paramCounter}`] = parsed.value;
              const op = parsed.operator === 'eq' ? '=' : parsed.operator === 'gt' ? '>' : '<';
              conditions.push(`${field} ${op} {${field}_${paramCounter}: Float32}`);
              paramCounter++;
            }
          }
        }
      });

      // Outcome filters
      if (filters.ht_over_05 !== undefined) {
        conditions.push(`ht_over_05 = ${filters.ht_over_05 ? 1 : 0}`);
      }
      if (filters.ft_over_15 !== undefined) {
        conditions.push(`ft_over_15 = ${filters.ft_over_15 ? 1 : 0}`);
      }
      if (filters.ft_over_25 !== undefined) {
        conditions.push(`ft_over_25 = ${filters.ft_over_25 ? 1 : 0}`);
      }
      if (filters.btts !== undefined) {
        conditions.push(`btts = ${filters.btts ? 1 : 0}`);
      }

      // Build final query
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Data query
      const dataQuery = `
        SELECT *
        FROM ${this.tableName}
        ${whereClause}
        ORDER BY match_date DESC, id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      // Count query
      const countQuery = `
        SELECT count() as total
        FROM ${this.tableName}
        ${whereClause}
      `;

      console.log('📊 ClickHouse Query:', {
        dataQuery: dataQuery.substring(0, 200) + '...',
        whereClause,
        params: Object.keys(params).length > 0 ? params : 'no params',
        limit,
        offset
      });

      // Execute both queries
      const [data, countResult] = await Promise.all([
        clickHouseClient.query<MatchData>(dataQuery, params),
        clickHouseClient.query<{ total: number }>(countQuery, params),
      ]);

      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      console.log(`✅ Found ${data.length} matches (total: ${total})`);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasMore,
      };
    } catch (error) {
      console.error('Error getting filtered matches:', error);
      throw error;
    }
  }

  /**
   * Get match statistics
   */
  async getMatchStatistics(filters: StatsFilters): Promise<MatchStatistics[]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, unknown> = {};
      let paramCounter = 0;

      // League filter
      if (filters.leagues && filters.leagues.length > 0) {
        params[`leagues_${paramCounter}`] = filters.leagues;
        conditions.push(`league IN {leagues_${paramCounter}: Array(String)}`);
        paramCounter++;
      }

      // Date filters
      if (filters.dateFrom) {
        params[`dateFrom_${paramCounter}`] = filters.dateFrom;
        conditions.push(`match_date >= {dateFrom_${paramCounter}: Date}`);
        paramCounter++;
      }
      if (filters.dateTo) {
        params[`dateTo_${paramCounter}`] = filters.dateTo;
        conditions.push(`match_date <= {dateTo_${paramCounter}: Date}`);
        paramCounter++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const groupByField = filters.groupBy || 'league';

      const query = `
        SELECT
          ${groupByField},
          count() as total_matches,
          sum(ht_over_05) as ht_over_05_count,
          round(sum(ht_over_05) * 100.0 / count(), 2) as ht_over_05_percentage,
          sum(ft_over_15) as ft_over_15_count,
          round(sum(ft_over_15) * 100.0 / count(), 2) as ft_over_15_percentage,
          sum(ft_over_25) as ft_over_25_count,
          round(sum(ft_over_25) * 100.0 / count(), 2) as ft_over_25_percentage,
          sum(ft_over_35) as ft_over_35_count,
          round(sum(ft_over_35) * 100.0 / count(), 2) as ft_over_35_percentage,
          sum(btts) as btts_count,
          round(sum(btts) * 100.0 / count(), 2) as btts_percentage,
          round(avg(ft_home_odds_close), 2) as avg_home_odds,
          round(avg(ft_draw_odds_close), 2) as avg_draw_odds,
          round(avg(ft_away_odds_close), 2) as avg_away_odds
        FROM ${this.tableName}
        ${whereClause}
        GROUP BY ${groupByField}
        ORDER BY total_matches DESC
      `;

      const result = await clickHouseClient.query<MatchStatistics>(query, params);
      
      console.log(`✅ Generated statistics for ${result.length} groups`);
      
      return result;
    } catch (error) {
      console.error('Error getting match statistics:', error);
      throw error;
    }
  }

  /**
   * Get matches by team
   */
  async getMatchesByTeam(
    team: string,
    limit: number = 20
  ): Promise<MatchData[]> {
    try {
      const query = `
        SELECT *
        FROM ${this.tableName}
        WHERE home_team ILIKE {team: String} OR away_team ILIKE {team: String}
        ORDER BY match_date DESC
        LIMIT ${limit}
      `;

      const result = await clickHouseClient.query<MatchData>(query, { team: `%${team}%` });
      
      console.log(`✅ Found ${result.length} matches for team: ${team}`);
      
      return result;
    } catch (error) {
      console.error('Error getting matches by team:', error);
      throw error;
    }
  }

  /**
   * Get recent matches
   */
  async getRecentMatches(limit: number = 100): Promise<MatchData[]> {
    try {
      const query = `
        SELECT *
        FROM ${this.tableName}
        ORDER BY match_date DESC, id DESC
        LIMIT ${limit}
      `;

      return await clickHouseClient.query<MatchData>(query);
    } catch (error) {
      console.error('Error getting recent matches:', error);
      throw error;
    }
  }
}

// ============================================
// Singleton Export
// ============================================

export const matchRepository = new MatchRepository();
