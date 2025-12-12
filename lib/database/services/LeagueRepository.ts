/**
 * League Repository
 * Specialized repository for league data
 */

import { BaseRepository } from './BaseRepository';
import type { League, LeaguesResponse } from '../types/match.types';
import { clickHouseClient } from '../clickhouse/client';

// ============================================
// League Repository
// ============================================

export class LeagueRepository extends BaseRepository<League> {
  constructor() {
    super('matches', 'league' as keyof League);
  }

  // ============================================
  // Custom League Queries
  // ============================================

  /**
   * Get all unique leagues (ultra-fast with materialized view)
   */
  async getAllLeagues(search?: string): Promise<LeaguesResponse> {
    try {
      // Try materialized view first (ultra-fast)
      let query = `
        SELECT 
          league,
          match_count,
          first_match,
          last_match
        FROM analysisday.mv_unique_leagues
      `;

      const params: Record<string, unknown> = {};

      if (search) {
        params.search = `%${search}%`;
        query += ` WHERE league ILIKE {search: String}`;
      }

      query += ` ORDER BY league ASC`;

      let results: League[];

      try {
        results = await clickHouseClient.query<League>(query, params);
      } catch {
        // Fallback to regular query if materialized view doesn't exist
        console.warn('⚠️ Materialized view not found, using fallback query');
        results = await this.getAllLeaguesFallback(search);
      }

      const leagues = results.map(r => r.league);
      const count = leagues.length;

      console.log(`✅ Found ${count} leagues${search ? ` matching "${search}"` : ''}`);

      return { leagues, count };
    } catch (error) {
      console.error('Error getting leagues:', error);
      throw error;
    }
  }

  /**
   * Fallback: Get leagues without materialized view
   */
  private async getAllLeaguesFallback(search?: string): Promise<League[]> {
    let query = `
      SELECT 
        league,
        count() as match_count,
        min(match_date) as first_match,
        max(match_date) as last_match
      FROM matches
    `;

    const params: Record<string, unknown> = {};

    if (search) {
      params.search = `%${search}%`;
      query += ` WHERE league ILIKE {search: String}`;
    }

    query += `
      GROUP BY league
      ORDER BY league ASC
    `;

    return await clickHouseClient.query<League>(query, params);
  }

  /**
   * Get favorite leagues (most common)
   */
  async getFavoriteLeagues(limit: number = 50): Promise<LeaguesResponse> {
    try {
      const query = `
        SELECT 
          league,
          count() as match_count
        FROM matches
        GROUP BY league
        ORDER BY match_count DESC
        LIMIT ${limit}
      `;

      const results = await clickHouseClient.query<League>(query);
      const leagues = results.map(r => r.league);
      const count = leagues.length;

      console.log(`✅ Found ${count} favorite leagues`);

      return { leagues, count };
    } catch (error) {
      console.error('Error getting favorite leagues:', error);
      throw error;
    }
  }

  /**
   * Search leagues by name
   */
  async searchLeagues(search: string, limit: number = 20): Promise<LeaguesResponse> {
    try {
      const query = `
        SELECT DISTINCT league
        FROM matches
        WHERE league ILIKE {search: String}
        ORDER BY league ASC
        LIMIT ${limit}
      `;

      const results = await clickHouseClient.query<{ league: string }>(
        query,
        { search: `%${search}%` }
      );

      const leagues = results.map(r => r.league);
      const count = leagues.length;

      console.log(`✅ Found ${count} leagues matching "${search}"`);

      return { leagues, count };
    } catch (error) {
      console.error('Error searching leagues:', error);
      throw error;
    }
  }

  /**
   * Get league details
   */
  async getLeagueDetails(leagueName: string): Promise<League | null> {
    try {
      const query = `
        SELECT 
          league,
          count() as match_count,
          min(match_date) as first_match,
          max(match_date) as last_match
        FROM matches
        WHERE league = {league: String}
        GROUP BY league
      `;

      const result = await clickHouseClient.queryOne<League>(query, { league: leagueName });

      if (result) {
        console.log(`✅ Found league details for: ${leagueName}`);
      } else {
        console.log(`⚠️ League not found: ${leagueName}`);
      }

      return result;
    } catch (error) {
      console.error('Error getting league details:', error);
      throw error;
    }
  }

  /**
   * Get leagues by date range
   */
  async getLeaguesByDateRange(
    dateFrom: string,
    dateTo: string
  ): Promise<LeaguesResponse> {
    try {
      const query = `
        SELECT DISTINCT league
        FROM matches
        WHERE match_date BETWEEN {dateFrom: Date} AND {dateTo: Date}
        ORDER BY league ASC
      `;

      const results = await clickHouseClient.query<{ league: string }>(
        query,
        { dateFrom, dateTo }
      );

      const leagues = results.map(r => r.league);
      const count = leagues.length;

      console.log(`✅ Found ${count} leagues between ${dateFrom} and ${dateTo}`);

      return { leagues, count };
    } catch (error) {
      console.error('Error getting leagues by date range:', error);
      throw error;
    }
  }

  /**
   * Get active leagues (with recent matches)
   */
  async getActiveLeagues(daysBack: number = 30, limit: number = 100): Promise<LeaguesResponse> {
    try {
      const query = `
        SELECT 
          league,
          count() as match_count,
          max(match_date) as last_match
        FROM matches
        WHERE match_date >= today() - INTERVAL ${daysBack} DAY
        GROUP BY league
        ORDER BY last_match DESC, match_count DESC
        LIMIT ${limit}
      `;

      const results = await clickHouseClient.query<League>(query);
      const leagues = results.map(r => r.league);
      const count = leagues.length;

      console.log(`✅ Found ${count} active leagues (last ${daysBack} days)`);

      return { leagues, count };
    } catch (error) {
      console.error('Error getting active leagues:', error);
      throw error;
    }
  }
}

// ============================================
// Singleton Export
// ============================================

export const leagueRepository = new LeagueRepository();
