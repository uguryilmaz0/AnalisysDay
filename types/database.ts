// Supabase Database Types

export interface MatchData {
  id: number;
  home_team: string;
  away_team: string;
  league: string;
  match_date: string;
  bookmaker: string;
  ht_score: string;
  ft_score: string;
  ht_ft: string;
  ht_over_05: number;
  ft_over_15: number;
  ft_over_25: number;
  ft_over_35: number;
  btts: number;
  day: number;
  month: number;
  year: number;
  time: string;
  
  // Full Time Odds - Home/Draw/Away
  ft_home_odds_open: number | null;
  ft_home_odds_close: number | null;
  ft_draw_odds_open: number | null;
  ft_draw_odds_close: number | null;
  ft_away_odds_open: number | null;
  ft_away_odds_close: number | null;
  
  // Half Time Odds - Home/Draw/Away
  ht_home_odds_open: number | null;
  ht_home_odds_close: number | null;
  ht_draw_odds_open: number | null;
  ht_draw_odds_close: number | null;
  ht_away_odds_open: number | null;
  ht_away_odds_close: number | null;
  
  // Second Half Odds - Home/Draw/Away
  sh_home_odds_open: number | null;
  sh_home_odds_close: number | null;
  sh_draw_odds_open: number | null;
  sh_draw_odds_close: number | null;
  sh_away_odds_open: number | null;
  sh_away_odds_close: number | null;
  
  // Home/Away (No Draw) Odds
  home_away_home_odds_open: number | null;
  home_away_home_odds_close: number | null;
  home_away_away_odds_open: number | null;
  home_away_away_odds_close: number | null;
  
  // BTTS (Both Teams To Score) Odds
  ft_btts_yes_odds_open: number | null;
  ft_btts_yes_odds_close: number | null;
  ft_btts_no_odds_open: number | null;
  ft_btts_no_odds_close: number | null;
  ht_btts_yes_odds_open: number | null;
  ht_btts_yes_odds_close: number | null;
  ht_btts_no_odds_open: number | null;
  ht_btts_no_odds_close: number | null;
  sh_btts_yes_odds_open: number | null;
  sh_btts_yes_odds_close: number | null;
  sh_btts_no_odds_open: number | null;
  sh_btts_no_odds_close: number | null;
  
  // Double Chance Odds
  ft_dc_1x_odds_open: number | null;
  ft_dc_1x_odds_close: number | null;
  ft_dc_12_odds_open: number | null;
  ft_dc_12_odds_close: number | null;
  ft_dc_x2_odds_open: number | null;
  ft_dc_x2_odds_close: number | null;
  ht_dc_1x_odds_open: number | null;
  ht_dc_1x_odds_close: number | null;
  ht_dc_12_odds_open: number | null;
  ht_dc_12_odds_close: number | null;
  ht_dc_x2_odds_open: number | null;
  ht_dc_x2_odds_close: number | null;
  
  // Over/Under Odds - Full Time
  ft_over_05_odds_open: number | null;
  ft_over_05_odds_close: number | null;
  ft_under_05_odds_open: number | null;
  ft_under_05_odds_close: number | null;
  ft_over_15_odds_open: number | null;
  ft_over_15_odds_close: number | null;
  ft_under_15_odds_open: number | null;
  ft_under_15_odds_close: number | null;
  ft_over_25_odds_open: number | null;
  ft_over_25_odds_close: number | null;
  ft_under_25_odds_open: number | null;
  ft_under_25_odds_close: number | null;
  ft_over_35_odds_open: number | null;
  ft_over_35_odds_close: number | null;
  ft_under_35_odds_open: number | null;
  ft_under_35_odds_close: number | null;
  ft_over_45_odds_open: number | null;
  ft_over_45_odds_close: number | null;
  ft_under_45_odds_open: number | null;
  ft_under_45_odds_close: number | null;
  ft_over_55_odds_open: number | null;
  ft_over_55_odds_close: number | null;
  ft_under_55_odds_open: number | null;
  ft_under_55_odds_close: number | null;
  
  // Over/Under Odds - Half Time
  ht_over_05_odds_open: number | null;
  ht_over_05_odds_close: number | null;
  ht_under_05_odds_open: number | null;
  ht_under_05_odds_close: number | null;
  ht_over_15_odds_open: number | null;
  ht_over_15_odds_close: number | null;
  ht_under_15_odds_open: number | null;
  ht_under_15_odds_close: number | null;
  ht_over_25_odds_open: number | null;
  ht_over_25_odds_close: number | null;
  ht_under_25_odds_open: number | null;
  ht_under_25_odds_close: number | null;
  
  // Over/Under Odds - Second Half
  sh_over_05_odds_open: number | null;
  sh_over_05_odds_close: number | null;
  sh_under_05_odds_open: number | null;
  sh_under_05_odds_close: number | null;
  sh_over_15_odds_open: number | null;
  sh_over_15_odds_close: number | null;
  sh_under_15_odds_open: number | null;
  sh_under_15_odds_close: number | null;
  sh_over_25_odds_open: number | null;
  sh_over_25_odds_close: number | null;
  sh_under_25_odds_open: number | null;
  sh_under_25_odds_close: number | null;
  
  // Asian Handicap Odds
  ah_minus_05_home_odds_open: number | null;
  ah_minus_05_home_odds_close: number | null;
  ah_minus_05_away_odds_open: number | null;
  ah_minus_05_away_odds_close: number | null;
  ah_0_home_odds_open: number | null;
  ah_0_home_odds_close: number | null;
  ah_0_away_odds_open: number | null;
  ah_0_away_odds_close: number | null;
  ah_plus_05_home_odds_open: number | null;
  ah_plus_05_home_odds_close: number | null;
  ah_plus_05_away_odds_open: number | null;
  ah_plus_05_away_odds_close: number | null;
  
  // European Handicap Odds
  eh_minus_1_home_odds_open: number | null;
  eh_minus_1_home_odds_close: number | null;
  eh_minus_1_draw_odds_open: number | null;
  eh_minus_1_draw_odds_close: number | null;
  eh_minus_1_away_odds_open: number | null;
  eh_minus_1_away_odds_close: number | null;
  
  // Half Time / Full Time Odds
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
  
  // Correct Score Odds - Half Time
  ht_cs_10_odds_open: number | null;
  ht_cs_10_odds_close: number | null;
  ht_cs_20_odds_open: number | null;
  ht_cs_20_odds_close: number | null;
  ht_cs_21_odds_open: number | null;
  ht_cs_21_odds_close: number | null;
  ht_cs_00_odds_open: number | null;
  ht_cs_00_odds_close: number | null;
  ht_cs_11_odds_open: number | null;
  ht_cs_11_odds_close: number | null;
  ht_cs_01_odds_open: number | null;
  ht_cs_01_odds_close: number | null;
  ht_cs_02_odds_open: number | null;
  ht_cs_02_odds_close: number | null;
  ht_cs_12_odds_open: number | null;
  ht_cs_12_odds_close: number | null;
  
  // Correct Score Odds - Full Time
  ft_cs_10_odds_open: number | null;
  ft_cs_10_odds_close: number | null;
  ft_cs_20_odds_open: number | null;
  ft_cs_20_odds_close: number | null;
  ft_cs_21_odds_open: number | null;
  ft_cs_21_odds_close: number | null;
  ft_cs_30_odds_open: number | null;
  ft_cs_30_odds_close: number | null;
  ft_cs_31_odds_open: number | null;
  ft_cs_31_odds_close: number | null;
  ft_cs_00_odds_open: number | null;
  ft_cs_00_odds_close: number | null;
  ft_cs_11_odds_open: number | null;
  ft_cs_11_odds_close: number | null;
  ft_cs_22_odds_open: number | null;
  ft_cs_22_odds_close: number | null;
  ft_cs_01_odds_open: number | null;
  ft_cs_01_odds_close: number | null;
  ft_cs_02_odds_open: number | null;
  ft_cs_02_odds_close: number | null;
  ft_cs_12_odds_open: number | null;
  ft_cs_12_odds_close: number | null;
  
  created_at: string;
  updated_at: string;
}

// Filtre için type'lar
export interface MatchFilters {
  league?: string[];
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string; // Başlangıç saati
  timeTo?: string; // Bitiş saati
  homeTeam?: string; // Ev sahibi takım
  awayTeam?: string; // Deplasman takım
  teamSearch?: string;
  
  // Odds Filtreleri (Server-side)
  // Format: ">2.5", "<1.8", "1.75"
  ft_home_odds?: string;
  ft_draw_odds?: string;
  ft_away_odds?: string;
  ht_home_odds?: string;
  ht_draw_odds?: string;
  ht_away_odds?: string;
  ft_dc_1x_odds?: string;
  ft_dc_12_odds?: string;
  ft_dc_x2_odds?: string;
  ht_dc_1x_odds?: string;
  ht_dc_12_odds?: string;
  ht_dc_x2_odds?: string;
  ah_minus_05_odds?: string;
  ah_0_odds?: string;
  ah_plus_05_odds?: string;
  eh_minus_1_odds?: string;
  ht_ft_11_odds?: string;
  ht_ft_1x_odds?: string;
  ht_ft_12_odds?: string;
  ht_ft_x1_odds?: string;
  ht_ft_xx_odds?: string;
  ht_ft_x2_odds?: string;
  ht_ft_21_odds?: string;
  ht_ft_2x_odds?: string;
  ht_ft_22_odds?: string;
}

// API Response type'ları
export interface MatchesResponse {
  data: MatchData[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface LeaguesResponse {
  leagues: string[];
  count: number;
}

export interface MatchStatistics {
  totalMatches: number;
  over15: {
    count: number;
    percentage: string;
  };
  over25: {
    count: number;
    percentage: string;
  };
  btts: {
    count: number;
    percentage: string;
  };
}
