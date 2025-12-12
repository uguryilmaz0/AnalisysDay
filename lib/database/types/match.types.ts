/**
 * Match-specific Types for Database
 * Extends generic database types
 */

import type { PaginatedResponse } from './database.types';

// ============================================
// Match Data Model
// ============================================

export interface MatchData {
  // Primary Fields
  id: number;
  match_date: string; // YYYY-MM-DD
  match_datetime?: string; // ISO 8601
  
  // Teams & League
  home_team: string;
  away_team: string;
  league: string;
  bookmaker: string;
  
  // Scores
  ht_score: string;
  ft_score: string;
  ht_ft: string;
  
  // Match Outcomes (0 or 1)
  ht_over_05: number;
  ft_over_15: number;
  ft_over_25: number;
  ft_over_35: number;
  btts: number;
  
  // Time Components
  day: number;
  month: number;
  year: number;
  time: string;
  
  // Full Time Odds
  ft_home_odds_open: number | null;
  ft_home_odds_close: number | null;
  ft_draw_odds_open: number | null;
  ft_draw_odds_close: number | null;
  ft_away_odds_open: number | null;
  ft_away_odds_close: number | null;
  
  // Half Time Odds
  ht_home_odds_open: number | null;
  ht_home_odds_close: number | null;
  ht_draw_odds_open: number | null;
  ht_draw_odds_close: number | null;
  ht_away_odds_open: number | null;
  ht_away_odds_close: number | null;
  
  // Second Half Odds
  sh_home_odds_open: number | null;
  sh_home_odds_close: number | null;
  sh_draw_odds_open: number | null;
  sh_draw_odds_close: number | null;
  sh_away_odds_open: number | null;
  sh_away_odds_close: number | null;
  
  // Home/Away Odds (No Draw)
  home_away_home_odds_open: number | null;
  home_away_home_odds_close: number | null;
  home_away_away_odds_open: number | null;
  home_away_away_odds_close: number | null;
  
  // Double Chance Odds - Full Time
  ft_dc_1x_odds_open: number | null;
  ft_dc_1x_odds_close: number | null;
  ft_dc_12_odds_open: number | null;
  ft_dc_12_odds_close: number | null;
  ft_dc_x2_odds_open: number | null;
  ft_dc_x2_odds_close: number | null;
  
  // Double Chance Odds - Half Time
  ht_dc_1x_odds_open: number | null;
  ht_dc_1x_odds_close: number | null;
  ht_dc_12_odds_open: number | null;
  ht_dc_12_odds_close: number | null;
  ht_dc_x2_odds_open: number | null;
  ht_dc_x2_odds_close: number | null;
  
  // Asian Handicap -0.5
  ah_minus_05_home_odds_open: number | null;
  ah_minus_05_home_odds_close: number | null;
  ah_minus_05_away_odds_open: number | null;
  ah_minus_05_away_odds_close: number | null;
  
  // Asian Handicap 0
  ah_0_home_odds_open: number | null;
  ah_0_home_odds_close: number | null;
  ah_0_away_odds_open: number | null;
  ah_0_away_odds_close: number | null;
  
  // Asian Handicap +0.5
  ah_plus_05_home_odds_open: number | null;
  ah_plus_05_home_odds_close: number | null;
  ah_plus_05_away_odds_open: number | null;
  ah_plus_05_away_odds_close: number | null;
  
  // European Handicap -1
  eh_minus_1_home_odds_open: number | null;
  eh_minus_1_home_odds_close: number | null;
  eh_minus_1_draw_odds_open: number | null;
  eh_minus_1_draw_odds_close: number | null;
  eh_minus_1_away_odds_open: number | null;
  eh_minus_1_away_odds_close: number | null;
  
  // HT/FT Odds (9 combinations)
  ht_ft_11_odds_open: number | null;
  ht_ft_11_odds_close: number | null;
  ht_ft_1x_odds_open: number | null;
  ht_ft_1x_odds_close: number | null;
  ht_ft_12_odds_open: number | null;
  ht_ft_12_odds_close: number | null;
  ht_ft_x1_odds_open: number | null;
  ht_ft_x1_odds_close: number | null;
  ht_ft_xx_odds_open: number | null;
  ht_ft_xx_odds_close: number | null;
  ht_ft_x2_odds_open: number | null;
  ht_ft_x2_odds_close: number | null;
  ht_ft_21_odds_open: number | null;
  ht_ft_21_odds_close: number | null;
  ht_ft_2x_odds_open: number | null;
  ht_ft_2x_odds_close: number | null;
  ht_ft_22_odds_open: number | null;
  ht_ft_22_odds_close: number | null;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

// ============================================
// Match Filters
// ============================================

export interface MatchFilters {
  // League & Teams
  league?: string[];
  homeTeam?: string;
  awayTeam?: string;
  teamSearch?: string; // Search in both home and away
  
  // Date & Time
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;
  timeFrom?: string; // HH:MM
  timeTo?: string;
  
  // Odds Filters (format: ">2.5", "<1.8", "1.75")
  ft_home_odds?: string;
  ft_draw_odds?: string;
  ft_away_odds?: string;
  ht_home_odds?: string;
  ht_draw_odds?: string;
  ht_away_odds?: string;
  
  // Double Chance
  ft_dc_1x_odds?: string;
  ft_dc_12_odds?: string;
  ft_dc_x2_odds?: string;
  ht_dc_1x_odds?: string;
  ht_dc_12_odds?: string;
  ht_dc_x2_odds?: string;
  
  // Asian Handicap
  ah_minus_05_odds?: string;
  ah_0_odds?: string;
  ah_plus_05_odds?: string;
  
  // European Handicap
  eh_minus_1_odds?: string;
  
  // HT/FT
  ht_ft_11_odds?: string;
  ht_ft_1x_odds?: string;
  ht_ft_12_odds?: string;
  ht_ft_x1_odds?: string;
  ht_ft_xx_odds?: string;
  ht_ft_x2_odds?: string;
  ht_ft_21_odds?: string;
  ht_ft_2x_odds?: string;
  ht_ft_22_odds?: string;
  
  // Outcomes
  ht_over_05?: boolean;
  ft_over_15?: boolean;
  ft_over_25?: boolean;
  ft_over_35?: boolean;
  btts?: boolean;
}

// ============================================
// League Types
// ============================================

export interface League {
  league: string;
  match_count?: number;
  first_match?: string;
  last_match?: string;
}

export interface LeaguesResponse {
  leagues: string[];
  count: number;
}

// ============================================
// Match Response Types
// ============================================

export interface MatchesResponse extends PaginatedResponse<MatchData> {
  // Extends PaginatedResponse with match-specific metadata
  filters?: MatchFilters;
}

// ============================================
// Match Statistics
// ============================================

export interface MatchStatistics {
  league: string;
  total_matches: number;
  ht_over_05_count: number;
  ht_over_05_percentage: number;
  ft_over_15_count: number;
  ft_over_15_percentage: number;
  ft_over_25_count: number;
  ft_over_25_percentage: number;
  ft_over_35_count: number;
  ft_over_35_percentage: number;
  btts_count: number;
  btts_percentage: number;
  avg_home_odds: number;
  avg_draw_odds: number;
  avg_away_odds: number;
}

export interface StatsFilters {
  leagues?: string[];
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'league' | 'month' | 'year';
}

// ============================================
// Odds Filter Parser
// ============================================

export interface OddsFilter {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number;
  value2?: number; // For 'between'
}

// ============================================
// Query Performance
// ============================================

export interface QueryPerformance {
  query: string;
  executionTime: number;
  rowsRead: number;
  bytesRead: number;
  cached: boolean;
}
