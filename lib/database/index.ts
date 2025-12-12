/**
 * Database Module Exports
 * Central export point for all database functionality
 */

// ============================================
// ClickHouse Client
// ============================================
export {
  clickHouseClient,
  getClickHouseClient,
  executeQuery,
  executeQueryOne,
  getClickHouseStats,
} from './clickhouse/client';

// ============================================
// Query Builder
// ============================================
export {
  ClickHouseQueryBuilder,
  parseOddsFilter,
  calculateOffset,
  calculateTotalPages,
} from './clickhouse/queryBuilder';

// ============================================
// Repositories
// ============================================
export { BaseRepository } from './services/BaseRepository';
export { MatchRepository, matchRepository } from './services/MatchRepository';
export { LeagueRepository, leagueRepository } from './services/LeagueRepository';

// ============================================
// Types
// ============================================
export type {
  // Generic Database Types
  QueryOperator,
  SortDirection,
  WhereCondition,
  OrderByClause,
  PaginationOptions,
  QueryOptions,
  PaginatedResponse,
  AggregationResult,
  DatabaseResponse,
  DatabaseError,
  IRepository,
  IDatabaseConnection,
  IQueryBuilder,
  ICacheManager,
  CacheOptions,
  ConnectionStats,
  CacheStats,
} from './types/database.types';

export type {
  // Match-specific Types
  MatchData,
  MatchFilters,
  League,
  LeaguesResponse,
  MatchesResponse,
  MatchStatistics,
  StatsFilters,
  OddsFilter,
  QueryPerformance,
} from './types/match.types';

// ============================================
// Convenience Functions
// ============================================

import { clickHouseClient } from './clickhouse/client';

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing ClickHouse database...');
    await clickHouseClient.connect();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  stats: Record<string, unknown>;
}> {
  try {
    const isHealthy = await clickHouseClient.ping();
    const stats = clickHouseClient.getStats();

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      stats,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      stats: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  try {
    console.log('🔌 Closing database connection...');
    await clickHouseClient.disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Failed to close database:', error);
  }
}
