/**
 * =====================================================
 * ClickHouse Match Types - FINAL VERSION
 * Excel Physical Column Order (0-239) - 730K+ Records
 * =====================================================
 */

/**
 * Complete Match Data Interface
 * Maps to Excel columns 0-239 (730K+ records)
 */
export interface MatchData {
  // Excel col 0-3: Takımlar ve skorlar
  home_team: string;              // 0: EV SAHİBİ
  away_team: string;              // 1: DEPLASMAN
  ht_score: string;               // 2: İlk Yarı Skor
  ft_score: string;               // 3: Maç Sonu Skor
  
  // Excel col 4-9: Sonuç flagleri
  ht_over_05: number;             // 4: İlk yarı 0.5 üst (0 or 1)
  ft_over_15: number;             // 5: MS 1.5 üst (0 or 1)
  ft_over_25: number;             // 6: MS 2.5 üst (0 or 1)
  ft_over_35: number;             // 7: MS 3.5 üst (0 or 1)
  btts: number;                   // 8: KG Var (0 or 1)
  ht_ft: string;                  // 9: İY/MS kombinasyonu
  
  // Excel col 10-15: Maç Sonu 1X2
  ft_home_odds_open: number;      // 10: MS 1 Açılış
  ft_home_odds_close: number;     // 11: MS 1 Kapanış
  ft_draw_odds_open: number;      // 12: MS X Açılış
  ft_draw_odds_close: number;     // 13: MS X Kapanış
  ft_away_odds_open: number;      // 14: MS 2 Açılış
  ft_away_odds_close: number;     // 15: MS 2 Kapanış
  
  // Excel col 16-21: İlk Yarı 1X2
  ht_home_odds_open: number;      // 16: İY 1 Açılış
  ht_home_odds_close: number;     // 17: İY 1 Kapanış
  ht_draw_odds_open: number;      // 18: İY X Açılış
  ht_draw_odds_close: number;     // 19: İY X Kapanış
  ht_away_odds_open: number;      // 20: İY 2 Açılış
  ht_away_odds_close: number;     // 21: İY 2 Kapanış
  
  // Excel col 22-27: İkinci Yarı 1X2
  sh_home_odds_open: number;      // 22: 2Y 1 Açılış
  sh_home_odds_close: number;     // 23: 2Y 1 Kapanış
  sh_draw_odds_open: number;      // 24: 2Y X Açılış
  sh_draw_odds_close: number;     // 25: 2Y X Kapanış
  sh_away_odds_open: number;      // 26: 2Y 2 Açılış
  sh_away_odds_close: number;     // 27: 2Y 2 Kapanış
  
  // Excel col 28-31: Home/Away
  home_away_home_odds_open: number;   // 28: EV A
  home_away_home_odds_close: number;  // 29: EV K
  home_away_away_odds_open: number;   // 30: DEP A
  home_away_away_odds_close: number;  // 31: DEP K
  
  // Excel col 32-43: BTTS (Karşılıklı Gol)
  ft_btts_yes_odds_open: number;      // 32: MS KG Var A
  ft_btts_yes_odds_close: number;     // 33: MS KG Var K
  ft_btts_no_odds_open: number;       // 34: MS KG Yok A
  ft_btts_no_odds_close: number;      // 35: MS KG Yok K
  ht_btts_yes_odds_open: number;      // 36: İY KG Var A
  ht_btts_yes_odds_close: number;     // 37: İY KG Var K
  ht_btts_no_odds_open: number;       // 38: İY KG Yok A
  ht_btts_no_odds_close: number;      // 39: İY KG Yok K
  sh_btts_yes_odds_open: number;      // 40: 2Y KG Var A
  sh_btts_yes_odds_close: number;     // 41: 2Y KG Var K
  sh_btts_no_odds_open: number;       // 42: 2Y KG Yok A
  sh_btts_no_odds_close: number;      // 43: 2Y KG Yok K
  
  // Excel col 44-55: Çifte Şans
  ft_dc_1x_odds_open: number;     // 44: MS 1X A
  ft_dc_1x_odds_close: number;    // 45: MS 1X K
  ft_dc_12_odds_open: number;     // 46: MS 12 A
  ft_dc_12_odds_close: number;    // 47: MS 12 K
  ft_dc_x2_odds_open: number;     // 48: MS X2 A
  ft_dc_x2_odds_close: number;    // 49: MS X2 K
  ht_dc_1x_odds_open: number;     // 50: İY 1X A
  ht_dc_1x_odds_close: number;    // 51: İY 1X K
  ht_dc_12_odds_open: number;     // 52: İY 12 A
  ht_dc_12_odds_close: number;    // 53: İY 12 K
  ht_dc_x2_odds_open: number;     // 54: İY X2 A
  ht_dc_x2_odds_close: number;    // 55: İY X2 K
  
  // Excel col 56-79: Maç Sonu Over/Under (0.5-5.5)
  ft_over_05_odds_open: number;       // 56
  ft_over_05_odds_close: number;      // 57
  ft_under_05_odds_open: number;      // 58
  ft_under_05_odds_close: number;     // 59
  ft_over_15_odds_open: number;       // 60
  ft_over_15_odds_close: number;      // 61
  ft_under_15_odds_open: number;      // 62
  ft_under_15_odds_close: number;     // 63
  ft_over_25_odds_open: number;       // 64
  ft_over_25_odds_close: number;      // 65
  ft_under_25_odds_open: number;      // 66
  ft_under_25_odds_close: number;     // 67
  ft_over_35_odds_open: number;       // 68
  ft_over_35_odds_close: number;      // 69
  ft_under_35_odds_open: number;      // 70
  ft_under_35_odds_close: number;     // 71
  ft_over_45_odds_open: number;       // 72
  ft_over_45_odds_close: number;      // 73
  ft_under_45_odds_open: number;      // 74
  ft_under_45_odds_close: number;     // 75
  ft_over_55_odds_open: number;       // 76
  ft_over_55_odds_close: number;      // 77
  ft_under_55_odds_open: number;      // 78
  ft_under_55_odds_close: number;     // 79
  
  // Excel col 80-91: İlk Yarı Over/Under
  ht_over_05_odds_open: number;       // 80
  ht_over_05_odds_close: number;      // 81
  ht_under_05_odds_open: number;      // 82
  ht_under_05_odds_close: number;     // 83
  ht_over_15_odds_open: number;       // 84
  ht_over_15_odds_close: number;      // 85
  ht_under_15_odds_open: number;      // 86
  ht_under_15_odds_close: number;     // 87
  ht_over_25_odds_open: number;       // 88
  ht_over_25_odds_close: number;      // 89
  ht_under_25_odds_open: number;      // 90
  ht_under_25_odds_close: number;     // 91
  
  // Excel col 92-103: İkinci Yarı Over/Under
  sh_over_05_odds_open: number;       // 92
  sh_over_05_odds_close: number;      // 93
  sh_under_05_odds_open: number;      // 94
  sh_under_05_odds_close: number;     // 95
  sh_over_15_odds_open: number;       // 96
  sh_over_15_odds_close: number;      // 97
  sh_under_15_odds_open: number;      // 98
  sh_under_15_odds_close: number;     // 99
  sh_over_25_odds_open: number;       // 100
  sh_over_25_odds_close: number;      // 101
  sh_under_25_odds_open: number;      // 102
  sh_under_25_odds_close: number;     // 103
  
  // Excel col 104-115: Asya Handikap
  ah_minus_05_home_odds_open: number;     // 104
  ah_minus_05_home_odds_close: number;    // 105
  ah_minus_05_away_odds_open: number;     // 106
  ah_minus_05_away_odds_close: number;    // 107
  ah_0_home_odds_open: number;            // 108
  ah_0_home_odds_close: number;           // 109
  ah_0_away_odds_open: number;            // 110
  ah_0_away_odds_close: number;           // 111
  ah_plus_05_home_odds_open: number;      // 112
  ah_plus_05_home_odds_close: number;     // 113
  ah_plus_05_away_odds_open: number;      // 114
  ah_plus_05_away_odds_close: number;     // 115
  
  // Excel col 116-121: Avrupa Handikap
  eh_minus_1_home_odds_open: number;      // 116
  eh_minus_1_home_odds_close: number;     // 117
  eh_minus_1_draw_odds_open: number;      // 118
  eh_minus_1_draw_odds_close: number;     // 119
  eh_minus_1_away_odds_open: number;      // 120
  eh_minus_1_away_odds_close: number;     // 121
  
  // Excel col 122-139: HT/FT (İY/MS)
  ht_ft_11_odds_open: number;         // 122: 1/1
  ht_ft_11_odds_close: number;        // 123
  ht_ft_1x_odds_open: number;         // 124: 1/X
  ht_ft_1x_odds_close: number;        // 125
  ht_ft_12_odds_open: number;         // 126: 1/2
  ht_ft_12_odds_close: number;        // 127
  ht_ft_x1_odds_open: number;         // 128: X/1
  ht_ft_x1_odds_close: number;        // 129
  ht_ft_xx_odds_open: number;         // 130: X/X
  ht_ft_xx_odds_close: number;        // 131
  ht_ft_x2_odds_open: number;         // 132: X/2
  ht_ft_x2_odds_close: number;        // 133
  ht_ft_21_odds_open: number;         // 134: 2/1
  ht_ft_21_odds_close: number;        // 135
  ht_ft_2x_odds_open: number;         // 136: 2/X
  ht_ft_2x_odds_close: number;        // 137
  ht_ft_22_odds_open: number;         // 138: 2/2
  ht_ft_22_odds_close: number;        // 139
  
  // Excel col 140-169: İlk Yarı Correct Score
  ht_cs_10_odds_open: number;         // 140: 1-0
  ht_cs_10_odds_close: number;        // 141
  ht_cs_20_odds_open: number;         // 142: 2-0
  ht_cs_20_odds_close: number;        // 143
  ht_cs_21_odds_open: number;         // 144: 2-1
  ht_cs_21_odds_close: number;        // 145
  ht_cs_30_odds_open: number;         // 146: 3-0
  ht_cs_30_odds_close: number;        // 147
  ht_cs_31_odds_open: number;         // 148: 3-1
  ht_cs_31_odds_close: number;        // 149
  ht_cs_32_odds_open: number;         // 150: 3-2
  ht_cs_32_odds_close: number;        // 151
  ht_cs_00_odds_open: number;         // 152: 0-0
  ht_cs_00_odds_close: number;        // 153
  ht_cs_11_odds_open: number;         // 154: 1-1
  ht_cs_11_odds_close: number;        // 155
  ht_cs_22_odds_open: number;         // 156: 2-2
  ht_cs_22_odds_close: number;        // 157
  ht_cs_01_odds_open: number;         // 158: 0-1
  ht_cs_01_odds_close: number;        // 159
  ht_cs_02_odds_open: number;         // 160: 0-2
  ht_cs_02_odds_close: number;        // 161
  ht_cs_12_odds_open: number;         // 162: 1-2
  ht_cs_12_odds_close: number;        // 163
  ht_cs_03_odds_open: number;         // 164: 0-3
  ht_cs_03_odds_close: number;        // 165
  ht_cs_13_odds_open: number;         // 166: 1-3
  ht_cs_13_odds_close: number;        // 167
  ht_cs_23_odds_open: number;         // 168: 2-3
  ht_cs_23_odds_close: number;        // 169
  
  // Excel col 170-205: Maç Sonu Correct Score (1. grup)
  ft_cs_10_odds_open: number;         // 170: 1-0
  ft_cs_10_odds_close: number;        // 171
  ft_cs_20_odds_open: number;         // 172: 2-0
  ft_cs_20_odds_close: number;        // 173
  ft_cs_21_odds_open: number;         // 174: 2-1
  ft_cs_21_odds_close: number;        // 175
  ft_cs_30_odds_open: number;         // 176: 3-0
  ft_cs_30_odds_close: number;        // 177
  ft_cs_31_odds_open: number;         // 178: 3-1
  ft_cs_31_odds_close: number;        // 179
  ft_cs_32_odds_open: number;         // 180: 3-2
  ft_cs_32_odds_close: number;        // 181
  ft_cs_40_odds_open: number;         // 182: 4-0
  ft_cs_40_odds_close: number;        // 183
  ft_cs_41_odds_open: number;         // 184: 4-1
  ft_cs_41_odds_close: number;        // 185
  ft_cs_42_odds_open: number;         // 186: 4-2
  ft_cs_42_odds_close: number;        // 187
  ft_cs_43_odds_open: number;         // 188: 4-3
  ft_cs_43_odds_close: number;        // 189
  ft_cs_50_odds_open: number;         // 190: 5-0
  ft_cs_50_odds_close: number;        // 191
  ft_cs_51_odds_open: number;         // 192: 5-1
  ft_cs_51_odds_close: number;        // 193
  ft_cs_52_odds_open: number;         // 194: 5-2
  ft_cs_52_odds_close: number;        // 195
  ft_cs_00_odds_open: number;         // 196: 0-0
  ft_cs_00_odds_close: number;        // 197
  ft_cs_11_odds_open: number;         // 198: 1-1
  ft_cs_11_odds_close: number;        // 199
  ft_cs_22_odds_open: number;         // 200: 2-2
  ft_cs_22_odds_close: number;        // 201
  ft_cs_33_odds_open: number;         // 202: 3-3
  ft_cs_33_odds_close: number;        // 203
  ft_cs_44_odds_open: number;         // 204: 4-4
  ft_cs_44_odds_close: number;        // 205
  
  // Excel col 206-231: Maç Sonu Correct Score (2. grup)
  ft_cs_01_odds_open: number;         // 206: 0-1
  ft_cs_01_odds_close: number;        // 207
  ft_cs_02_odds_open: number;         // 208: 0-2
  ft_cs_02_odds_close: number;        // 209
  ft_cs_12_odds_open: number;         // 210: 1-2
  ft_cs_12_odds_close: number;        // 211
  ft_cs_03_odds_open: number;         // 212: 0-3
  ft_cs_03_odds_close: number;        // 213
  ft_cs_13_odds_open: number;         // 214: 1-3
  ft_cs_13_odds_close: number;        // 215
  ft_cs_23_odds_open: number;         // 216: 2-3
  ft_cs_23_odds_close: number;        // 217
  ft_cs_04_odds_open: number;         // 218: 0-4
  ft_cs_04_odds_close: number;        // 219
  ft_cs_14_odds_open: number;         // 220: 1-4
  ft_cs_14_odds_close: number;        // 221
  ft_cs_24_odds_open: number;         // 222: 2-4
  ft_cs_24_odds_close: number;        // 223
  ft_cs_34_odds_open: number;         // 224: 3-4
  ft_cs_34_odds_close: number;        // 225
  ft_cs_05_odds_open: number;         // 226: 0-5
  ft_cs_05_odds_close: number;        // 227
  ft_cs_15_odds_open: number;         // 228: 1-5
  ft_cs_15_odds_close: number;        // 229
  ft_cs_25_odds_open: number;         // 230: 2-5
  ft_cs_25_odds_close: number;        // 231
  
  // Excel col 232, 234-238: Lig ve Tarih bilgileri (233 ATLANDI)
  league: string;                     // 232: ÜLKE/LİG
  bookmaker: string;                  // 234: BÜRO
  day: string;                        // 235: GÜN
  month: string;                      // 236: AY
  year: string;                       // 237: YIL
  time: string;                       // 238: SAAT
  
  // Metadata (ClickHouse internal)
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Match Filter Options for API Queries
 */
export interface MatchFilters {
  // Date filters
  year?: string;
  month?: string;
  day?: string;
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string;   // YYYY-MM-DD format
  
  // Time filters  
  timeFrom?: string; // HH:MM format
  timeTo?: string;   // HH:MM format
  
  // Team filters
  homeTeam?: string;
  awayTeam?: string;
  teamSearch?: string; // Search in both home and away
  
  // League filters
  league?: string | string[];
  leagues?: string[];
  
  // Bookmaker filter
  bookmaker?: string;
  
  // Result filters
  ht_over_05?: boolean;
  ft_over_15?: boolean;
  ft_over_25?: boolean;
  ft_over_35?: boolean;
  btts?: boolean;
  ht_ft?: string;
  
  // Score filters
  ht_score?: string;
  ft_score?: string;
  
  // Dynamic odds filters - support gt, lt, eq operations
  [key: string]: any; // Allow dynamic odds filters like ft_home_odds_gt, ft_home_odds_lt, etc.
  
  // Pagination
  page?: number;
  limit?: number;
  offset?: number;
  
  // Sorting
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

/**
 * League Information
 */
export interface League {
  league: string;
  match_count: number;
  first_year: string;
  last_year: string;
  first_month: string;
  last_month: string;
}

/**
 * Daily Statistics
 */
export interface DailyStats {
  year: string;
  month: string;
  day: string;
  league: string;
  total_matches: number;
  ht_over_05_count: number;
  ft_over_15_count: number;
  ft_over_25_count: number;
  ft_over_35_count: number;
  btts_count: number;
  avg_home_odds: number;
  avg_draw_odds: number;
  avg_away_odds: number;
  min_home_odds: number;
  max_home_odds: number;
  min_away_odds: number;
  max_away_odds: number;
}

/**
 * Team Statistics
 */
export interface TeamStats {
  team_name: string;
  year: string;
  venue: 'home' | 'away';
  matches_played: number;
  over_25_count: number;
  btts_count: number;
  avg_odds: number;
}

/**
 * Bookmaker Comparison
 */
export interface BookmakerComparison {
  bookmaker: string;
  league: string;
  year: string;
  total_matches: number;
  avg_home_odds: number;
  avg_draw_odds: number;
  avg_away_odds: number;
  avg_over_25_odds: number;
  avg_btts_yes_odds: number;
  home_odds_volatility: number;
  away_odds_volatility: number;
}

/**
 * Score Frequency
 */
export interface ScoreFrequency {
  league: string;
  ft_score: string;
  year: string;
  frequency: number;
  avg_10_odds: number;
  avg_20_odds: number;
  avg_21_odds: number;
  avg_00_odds: number;
  avg_11_odds: number;
}

/**
 * API Response Wrapper
 */
export interface MatchesResponse {
  success: boolean;
  data: MatchData[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  error?: string;
}

export interface LeaguesResponse {
  success: boolean;
  data: League[];
  total: number;
  error?: string;
}

export interface StatsResponse {
  success: boolean;
  data: DailyStats[];
  total: number;
  error?: string;
}

/**
 * Additional Stats Interfaces for ClickHouse
 */
export interface AggregatedStats {
  total_matches: number;
  ht_over_05_count: number;
  ft_over_15_count: number;
  ft_over_25_count: number;
  ft_over_35_count: number;
  btts_count: number;
  avg_home_odds: number;
  avg_draw_odds: number;
  avg_away_odds: number;
  unique_leagues: number;
  unique_teams: number;
}

export interface TeamStats {
  team_name: string;
  venue: 'home' | 'away';
  total_matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  avg_home_odds: number;
  avg_draw_odds: number;
  avg_away_odds: number;
}
