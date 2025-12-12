/**
 * ClickHouse Match Service
 * Replaces Supabase with optimized ClickHouse API calls
 */
import { MatchData, MatchFilters } from '@/lib/database/types/match.types_v2';

// =============================================
// ClickHouse API Service Layer
// =============================================

export interface MatchServiceFilters {
  leagues?: string[];
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  homeTeam?: string;
  awayTeam?: string;
  teamSearch?: string;
  page?: number;
  limit?: number;
  // Dynamic odds filters
  [key: string]: unknown;
}

export interface MatchServiceResponse {
  success: boolean;
  data: MatchData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  error?: string;
}

export interface LeagueServiceResponse {
  success: boolean;
  leagues: Array<{ league: string; match_count: number }>;
  count: number;
  source: string;
  error?: string;
}

export interface StatsServiceResponse {
  success: boolean;
  type: string;
  totalMatches?: number;
  count?: number;
  data?: unknown[];
  source: string;
  // Aggregated stats fields
  htOver05?: { count: number; percentage: string };
  ftOver15?: { count: number; percentage: string };
  ftOver25?: { count: number; percentage: string };
  ftOver35?: { count: number; percentage: string };
  btts?: { count: number; percentage: string };
  avgOdds?: { home: string; draw: string; away: string };
  uniqueLeagues?: number;
  uniqueTeams?: number;
  error?: string;
}

/**
 * Base API call helper with error handling
 */
async function apiCall<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  try {
    const url = new URL(endpoint, process.env.NODE_ENV === 'production' 
      ? 'https://analizgunu.com' 
      : 'http://localhost:3000'
    );
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }

    console.log('🔍 API call:', url.pathname + url.search);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Let API handle caching
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
}

/**
 * Get matches with advanced filtering (ClickHouse optimized)
 */
export async function getMatches(filters: MatchServiceFilters = {}): Promise<MatchServiceResponse> {
  try {
    const params: Record<string, string> = {};
    
    // Basic filters
    if (filters.leagues && filters.leagues.length > 0) {
      params.leagues = filters.leagues.join(',');
    }
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.timeFrom) params.timeFrom = filters.timeFrom;
    if (filters.timeTo) params.timeTo = filters.timeTo;
    if (filters.homeTeam) params.homeTeam = filters.homeTeam;
    if (filters.awayTeam) params.awayTeam = filters.awayTeam;
    if (filters.teamSearch) params.teamSearch = filters.teamSearch;
    if (filters.page) params.page = filters.page.toString();
    if (filters.limit) params.limit = filters.limit.toString();

    // Dynamic odds filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key.includes('odds') && value !== undefined) {
        params[key] = String(value);
      }
    });

    const response = await apiCall<MatchServiceResponse>('/api/matches', params);
    
    console.log('✅ getMatches response:', {
      success: response.success,
      total: response.total,
      dataLength: response.data?.length,
      hasData: response.data && response.data.length > 0
    });
    
    return response;
  } catch (error) {
    console.error('❌ getMatches failed:', error);
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get unique leagues (using mv_unique_leagues materialized view)
 */
export async function getLeagues(options: {
  search?: string;
  favorites?: boolean;
} = {}): Promise<LeagueServiceResponse> {
  try {
    const params: Record<string, string> = {};
    
    if (options.search) params.search = options.search;
    if (options.favorites) params.favorites = 'true';

    const response = await apiCall<LeagueServiceResponse>('/api/matches/leagues', params);
    
    return response;
  } catch (error) {
    console.error('❌ getLeagues failed:', error);
    return {
      success: false,
      leagues: [],
      count: 0,
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get top leagues by match count
 */
export async function getTopLeagues(limit: number = 20): Promise<LeagueServiceResponse> {
  return getLeagues({ favorites: true });
}

/**
 * Search leagues by name
 */
export async function searchLeagues(searchTerm: string): Promise<LeagueServiceResponse> {
  return getLeagues({ search: searchTerm });
}

/**
 * Get match statistics (using materialized views)
 */
export async function getMatchStats(options: {
  leagues?: string[];
  dateFrom?: string;
  dateTo?: string;
  teamSearch?: string;
  type?: 'aggregated' | 'daily' | 'monthly' | 'team';
  [key: string]: unknown; // Dynamic odds filters support
} = {}): Promise<StatsServiceResponse> {
  try {
    const params: Record<string, string> = {};
    
    if (options.leagues && options.leagues.length > 0) {
      params.leagues = options.leagues.join(',');
    }
    if (options.dateFrom) params.dateFrom = options.dateFrom;
    if (options.dateTo) params.dateTo = options.dateTo;
    if (options.teamSearch) params.teamSearch = options.teamSearch;
    if (options.type) params.type = options.type;

    // Dynamic odds filters - same as getMatches
    Object.entries(options).forEach(([key, value]) => {
      if (key.includes('odds') && value !== undefined) {
        params[key] = String(value);
      }
    });

    const response = await apiCall<StatsServiceResponse>('/api/matches/stats', params);
    
    return response;
  } catch (error) {
    console.error('❌ getMatchStats failed:', error);
    return {
      success: false,
      type: 'error',
      count: 0,
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get league statistics for specific leagues
 */
export async function getLeagueStats(leagues: string[]): Promise<StatsServiceResponse> {
  return getMatchStats({ leagues, type: 'aggregated' });
}

/**
 * Get daily match statistics
 */
export async function getDailyStats(options: {
  leagues?: string[];
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<StatsServiceResponse> {
  return getMatchStats({ ...options, type: 'daily' });
}

/**
 * Get monthly league statistics
 */
export async function getMonthlyStats(options: {
  leagues?: string[];
} = {}): Promise<StatsServiceResponse> {
  return getMatchStats({ ...options, type: 'monthly' });
}

/**
 * Get team statistics
 */
export async function getTeamStats(teamSearch: string): Promise<StatsServiceResponse> {
  return getMatchStats({ teamSearch, type: 'team' });
}

/**
 * Backward compatibility - deprecated functions
 */

/**
 * @deprecated Use getMatches() instead
 */
export async function getAllMatches(): Promise<MatchServiceResponse> {
  console.warn('⚠️ getAllMatches() is deprecated, use getMatches() instead');
  return getMatches({ limit: 1000 });
}

/**
 * @deprecated Cache is handled at API level now
 */
export function clearCache(): void {
  console.warn('⚠️ clearCache() is deprecated - caching handled at API level');
}

/**
 * @deprecated Use getLeagues() instead
 */
export async function getUniqueLeagues(): Promise<LeagueServiceResponse> {
  console.warn('⚠️ getUniqueLeagues() is deprecated, use getLeagues() instead');
  return getLeagues();
}

// Export default for backward compatibility
const MatchService = {
  getMatches,
  getLeagues,
  getTopLeagues,
  searchLeagues,
  getMatchStats,
  getLeagueStats,
  getDailyStats,
  getMonthlyStats,
  getTeamStats,
  clearCache,
  // Deprecated
  getAllMatches,
  getUniqueLeagues,
};

export default MatchService;