-- =====================================================
-- ClickHouse Matches Table Schema - FINAL VERSION
-- Excel Physical Column Order (0-239) - 730K+ Records
-- Optimized for analytical queries with 240 fields
-- =====================================================

CREATE TABLE IF NOT EXISTS matches (
    -- Excel col 0-3: Takımlar ve skorlar
    home_team String,              -- 0: EV SAHİBİ
    away_team String,              -- 1: DEPLASMAN
    ht_score String,               -- 2: İlk Yarı Skor
    ft_score String,               -- 3: Maç Sonu Skor
    
    -- Excel col 4-9: Sonuç flagleri
    ht_over_05 UInt8,              -- 4: İlk yarı 0.5 üst
    ft_over_15 UInt8,              -- 5: MS 1.5 üst
    ft_over_25 UInt8,              -- 6: MS 2.5 üst
    ft_over_35 UInt8,              -- 7: MS 3.5 üst
    btts UInt8,                    -- 8: KG Var
    ht_ft String,                  -- 9: İY/MS kombinasyonu
    
    -- Excel col 10-15: Maç Sonu 1X2
    ft_home_odds_open Float64,     -- 10: MS 1 Açılış
    ft_home_odds_close Float64,    -- 11: MS 1 Kapanış
    ft_draw_odds_open Float64,     -- 12: MS X Açılış
    ft_draw_odds_close Float64,    -- 13: MS X Kapanış
    ft_away_odds_open Float64,     -- 14: MS 2 Açılış
    ft_away_odds_close Float64,    -- 15: MS 2 Kapanış
    
    -- Excel col 16-21: İlk Yarı 1X2
    ht_home_odds_open Float64,     -- 16: İY 1 Açılış
    ht_home_odds_close Float64,    -- 17: İY 1 Kapanış
    ht_draw_odds_open Float64,     -- 18: İY X Açılış
    ht_draw_odds_close Float64,    -- 19: İY X Kapanış
    ht_away_odds_open Float64,     -- 20: İY 2 Açılış
    ht_away_odds_close Float64,    -- 21: İY 2 Kapanış
    
    -- Excel col 22-27: İkinci Yarı 1X2
    sh_home_odds_open Float64,     -- 22: 2Y 1 Açılış
    sh_home_odds_close Float64,    -- 23: 2Y 1 Kapanış
    sh_draw_odds_open Float64,     -- 24: 2Y X Açılış
    sh_draw_odds_close Float64,    -- 25: 2Y X Kapanış
    sh_away_odds_open Float64,     -- 26: 2Y 2 Açılış
    sh_away_odds_close Float64,    -- 27: 2Y 2 Kapanış
    
    -- Excel col 28-31: Home/Away
    home_away_home_odds_open Float64,  -- 28: EV A
    home_away_home_odds_close Float64, -- 29: EV K
    home_away_away_odds_open Float64,  -- 30: DEP A
    home_away_away_odds_close Float64, -- 31: DEP K
    
    -- Excel col 32-43: BTTS (Karşılıklı Gol)
    ft_btts_yes_odds_open Float64,     -- 32: MS KG Var A
    ft_btts_yes_odds_close Float64,    -- 33: MS KG Var K
    ft_btts_no_odds_open Float64,      -- 34: MS KG Yok A
    ft_btts_no_odds_close Float64,     -- 35: MS KG Yok K
    ht_btts_yes_odds_open Float64,     -- 36: İY KG Var A
    ht_btts_yes_odds_close Float64,    -- 37: İY KG Var K
    ht_btts_no_odds_open Float64,      -- 38: İY KG Yok A
    ht_btts_no_odds_close Float64,     -- 39: İY KG Yok K
    sh_btts_yes_odds_open Float64,     -- 40: 2Y KG Var A
    sh_btts_yes_odds_close Float64,    -- 41: 2Y KG Var K
    sh_btts_no_odds_open Float64,      -- 42: 2Y KG Yok A
    sh_btts_no_odds_close Float64,     -- 43: 2Y KG Yok K
    
    -- Excel col 44-55: Çifte Şans
    ft_dc_1x_odds_open Float64,    -- 44: MS 1X A
    ft_dc_1x_odds_close Float64,   -- 45: MS 1X K
    ft_dc_12_odds_open Float64,    -- 46: MS 12 A
    ft_dc_12_odds_close Float64,   -- 47: MS 12 K
    ft_dc_x2_odds_open Float64,    -- 48: MS X2 A
    ft_dc_x2_odds_close Float64,   -- 49: MS X2 K
    ht_dc_1x_odds_open Float64,    -- 50: İY 1X A
    ht_dc_1x_odds_close Float64,   -- 51: İY 1X K
    ht_dc_12_odds_open Float64,    -- 52: İY 12 A
    ht_dc_12_odds_close Float64,   -- 53: İY 12 K
    ht_dc_x2_odds_open Float64,    -- 54: İY X2 A
    ht_dc_x2_odds_close Float64,   -- 55: İY X2 K
    
    -- Excel col 56-79: Maç Sonu Over/Under (0.5-5.5)
    ft_over_05_odds_open Float64,      -- 56
    ft_over_05_odds_close Float64,     -- 57
    ft_under_05_odds_open Float64,     -- 58
    ft_under_05_odds_close Float64,    -- 59
    ft_over_15_odds_open Float64,      -- 60
    ft_over_15_odds_close Float64,     -- 61
    ft_under_15_odds_open Float64,     -- 62
    ft_under_15_odds_close Float64,    -- 63
    ft_over_25_odds_open Float64,      -- 64
    ft_over_25_odds_close Float64,     -- 65
    ft_under_25_odds_open Float64,     -- 66
    ft_under_25_odds_close Float64,    -- 67
    ft_over_35_odds_open Float64,      -- 68
    ft_over_35_odds_close Float64,     -- 69
    ft_under_35_odds_open Float64,     -- 70
    ft_under_35_odds_close Float64,    -- 71
    ft_over_45_odds_open Float64,      -- 72
    ft_over_45_odds_close Float64,     -- 73
    ft_under_45_odds_open Float64,     -- 74
    ft_under_45_odds_close Float64,    -- 75
    ft_over_55_odds_open Float64,      -- 76
    ft_over_55_odds_close Float64,     -- 77
    ft_under_55_odds_open Float64,     -- 78
    ft_under_55_odds_close Float64,    -- 79
    
    -- Excel col 80-91: İlk Yarı Over/Under
    ht_over_05_odds_open Float64,      -- 80
    ht_over_05_odds_close Float64,     -- 81
    ht_under_05_odds_open Float64,     -- 82
    ht_under_05_odds_close Float64,    -- 83
    ht_over_15_odds_open Float64,      -- 84
    ht_over_15_odds_close Float64,     -- 85
    ht_under_15_odds_open Float64,     -- 86
    ht_under_15_odds_close Float64,    -- 87
    ht_over_25_odds_open Float64,      -- 88
    ht_over_25_odds_close Float64,     -- 89
    ht_under_25_odds_open Float64,     -- 90
    ht_under_25_odds_close Float64,    -- 91
    
    -- Excel col 92-103: İkinci Yarı Over/Under
    sh_over_05_odds_open Float64,      -- 92
    sh_over_05_odds_close Float64,     -- 93
    sh_under_05_odds_open Float64,     -- 94
    sh_under_05_odds_close Float64,    -- 95
    sh_over_15_odds_open Float64,      -- 96
    sh_over_15_odds_close Float64,     -- 97
    sh_under_15_odds_open Float64,     -- 98
    sh_under_15_odds_close Float64,    -- 99
    sh_over_25_odds_open Float64,      -- 100
    sh_over_25_odds_close Float64,     -- 101
    sh_under_25_odds_open Float64,     -- 102
    sh_under_25_odds_close Float64,    -- 103
    
    -- Excel col 104-115: Asya Handikap
    ah_minus_05_home_odds_open Float64,    -- 104
    ah_minus_05_home_odds_close Float64,   -- 105
    ah_minus_05_away_odds_open Float64,    -- 106
    ah_minus_05_away_odds_close Float64,   -- 107
    ah_0_home_odds_open Float64,           -- 108
    ah_0_home_odds_close Float64,          -- 109
    ah_0_away_odds_open Float64,           -- 110
    ah_0_away_odds_close Float64,          -- 111
    ah_plus_05_home_odds_open Float64,     -- 112
    ah_plus_05_home_odds_close Float64,    -- 113
    ah_plus_05_away_odds_open Float64,     -- 114
    ah_plus_05_away_odds_close Float64,    -- 115
    
    -- Excel col 116-121: Avrupa Handikap
    eh_minus_1_home_odds_open Float64,     -- 116
    eh_minus_1_home_odds_close Float64,    -- 117
    eh_minus_1_draw_odds_open Float64,     -- 118
    eh_minus_1_draw_odds_close Float64,    -- 119
    eh_minus_1_away_odds_open Float64,     -- 120
    eh_minus_1_away_odds_close Float64,    -- 121
    
    -- Excel col 122-139: HT/FT (İY/MS)
    ht_ft_11_odds_open Float64,        -- 122: 1/1
    ht_ft_11_odds_close Float64,       -- 123
    ht_ft_1x_odds_open Float64,        -- 124: 1/X
    ht_ft_1x_odds_close Float64,       -- 125
    ht_ft_12_odds_open Float64,        -- 126: 1/2
    ht_ft_12_odds_close Float64,       -- 127
    ht_ft_x1_odds_open Float64,        -- 128: X/1
    ht_ft_x1_odds_close Float64,       -- 129
    ht_ft_xx_odds_open Float64,        -- 130: X/X
    ht_ft_xx_odds_close Float64,       -- 131
    ht_ft_x2_odds_open Float64,        -- 132: X/2
    ht_ft_x2_odds_close Float64,       -- 133
    ht_ft_21_odds_open Float64,        -- 134: 2/1
    ht_ft_21_odds_close Float64,       -- 135
    ht_ft_2x_odds_open Float64,        -- 136: 2/X
    ht_ft_2x_odds_close Float64,       -- 137
    ht_ft_22_odds_open Float64,        -- 138: 2/2
    ht_ft_22_odds_close Float64,       -- 139
    
    -- Excel col 140-169: İlk Yarı Correct Score
    ht_cs_10_odds_open Float64,        -- 140: 1-0
    ht_cs_10_odds_close Float64,       -- 141
    ht_cs_20_odds_open Float64,        -- 142: 2-0
    ht_cs_20_odds_close Float64,       -- 143
    ht_cs_21_odds_open Float64,        -- 144: 2-1
    ht_cs_21_odds_close Float64,       -- 145
    ht_cs_30_odds_open Float64,        -- 146: 3-0
    ht_cs_30_odds_close Float64,       -- 147
    ht_cs_31_odds_open Float64,        -- 148: 3-1
    ht_cs_31_odds_close Float64,       -- 149
    ht_cs_32_odds_open Float64,        -- 150: 3-2
    ht_cs_32_odds_close Float64,       -- 151
    ht_cs_00_odds_open Float64,        -- 152: 0-0
    ht_cs_00_odds_close Float64,       -- 153
    ht_cs_11_odds_open Float64,        -- 154: 1-1
    ht_cs_11_odds_close Float64,       -- 155
    ht_cs_22_odds_open Float64,        -- 156: 2-2
    ht_cs_22_odds_close Float64,       -- 157
    ht_cs_01_odds_open Float64,        -- 158: 0-1
    ht_cs_01_odds_close Float64,       -- 159
    ht_cs_02_odds_open Float64,        -- 160: 0-2
    ht_cs_02_odds_close Float64,       -- 161
    ht_cs_12_odds_open Float64,        -- 162: 1-2
    ht_cs_12_odds_close Float64,       -- 163
    ht_cs_03_odds_open Float64,        -- 164: 0-3
    ht_cs_03_odds_close Float64,       -- 165
    ht_cs_13_odds_open Float64,        -- 166: 1-3
    ht_cs_13_odds_close Float64,       -- 167
    ht_cs_23_odds_open Float64,        -- 168: 2-3
    ht_cs_23_odds_close Float64,       -- 169
    
    -- Excel col 170-205: Maç Sonu Correct Score (1. grup)
    ft_cs_10_odds_open Float64,        -- 170: 1-0
    ft_cs_10_odds_close Float64,       -- 171
    ft_cs_20_odds_open Float64,        -- 172: 2-0
    ft_cs_20_odds_close Float64,       -- 173
    ft_cs_21_odds_open Float64,        -- 174: 2-1
    ft_cs_21_odds_close Float64,       -- 175
    ft_cs_30_odds_open Float64,        -- 176: 3-0
    ft_cs_30_odds_close Float64,       -- 177
    ft_cs_31_odds_open Float64,        -- 178: 3-1
    ft_cs_31_odds_close Float64,       -- 179
    ft_cs_32_odds_open Float64,        -- 180: 3-2
    ft_cs_32_odds_close Float64,       -- 181
    ft_cs_40_odds_open Float64,        -- 182: 4-0
    ft_cs_40_odds_close Float64,       -- 183
    ft_cs_41_odds_open Float64,        -- 184: 4-1
    ft_cs_41_odds_close Float64,       -- 185
    ft_cs_42_odds_open Float64,        -- 186: 4-2
    ft_cs_42_odds_close Float64,       -- 187
    ft_cs_43_odds_open Float64,        -- 188: 4-3
    ft_cs_43_odds_close Float64,       -- 189
    ft_cs_50_odds_open Float64,        -- 190: 5-0
    ft_cs_50_odds_close Float64,       -- 191
    ft_cs_51_odds_open Float64,        -- 192: 5-1
    ft_cs_51_odds_close Float64,       -- 193
    ft_cs_52_odds_open Float64,        -- 194: 5-2
    ft_cs_52_odds_close Float64,       -- 195
    ft_cs_00_odds_open Float64,        -- 196: 0-0
    ft_cs_00_odds_close Float64,       -- 197
    ft_cs_11_odds_open Float64,        -- 198: 1-1
    ft_cs_11_odds_close Float64,       -- 199
    ft_cs_22_odds_open Float64,        -- 200: 2-2
    ft_cs_22_odds_close Float64,       -- 201
    ft_cs_33_odds_open Float64,        -- 202: 3-3
    ft_cs_33_odds_close Float64,       -- 203
    ft_cs_44_odds_open Float64,        -- 204: 4-4
    ft_cs_44_odds_close Float64,       -- 205
    
    -- Excel col 206-231: Maç Sonu Correct Score (2. grup)
    ft_cs_01_odds_open Float64,        -- 206: 0-1
    ft_cs_01_odds_close Float64,       -- 207
    ft_cs_02_odds_open Float64,        -- 208: 0-2
    ft_cs_02_odds_close Float64,       -- 209
    ft_cs_12_odds_open Float64,        -- 210: 1-2
    ft_cs_12_odds_close Float64,       -- 211
    ft_cs_03_odds_open Float64,        -- 212: 0-3
    ft_cs_03_odds_close Float64,       -- 213
    ft_cs_13_odds_open Float64,        -- 214: 1-3
    ft_cs_13_odds_close Float64,       -- 215
    ft_cs_23_odds_open Float64,        -- 216: 2-3
    ft_cs_23_odds_close Float64,       -- 217
    ft_cs_04_odds_open Float64,        -- 218: 0-4
    ft_cs_04_odds_close Float64,       -- 219
    ft_cs_14_odds_open Float64,        -- 220: 1-4
    ft_cs_14_odds_close Float64,       -- 221
    ft_cs_24_odds_open Float64,        -- 222: 2-4
    ft_cs_24_odds_close Float64,       -- 223
    ft_cs_34_odds_open Float64,        -- 224: 3-4
    ft_cs_34_odds_close Float64,       -- 225
    ft_cs_05_odds_open Float64,        -- 226: 0-5
    ft_cs_05_odds_close Float64,       -- 227
    ft_cs_15_odds_open Float64,        -- 228: 1-5
    ft_cs_15_odds_close Float64,       -- 229
    ft_cs_25_odds_open Float64,        -- 230: 2-5
    ft_cs_25_odds_close Float64,       -- 231
    
    -- Excel col 232, 234-238: Lig ve Tarih bilgileri (233 ATLANDI - gereksiz Excel sayısal tarih)
    league String,                     -- 232: ÜLKE/LİG
    bookmaker String,                  -- 234: BÜRO
    day String,                        -- 235: GÜN
    month String,                      -- 236: AY
    year String,                       -- 237: YIL
    time String,                       -- 238: SAAT
    
    -- Metadata (ClickHouse internal)
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
    
) ENGINE = MergeTree()
ORDER BY (league, year, month, day, home_team)
SETTINGS index_granularity = 8192;

-- =====================================================
-- Indexes for Performance (730K+ rows optimization)
-- =====================================================

-- Bloom filter indexes for text search
ALTER TABLE matches ADD INDEX idx_home_team home_team TYPE bloom_filter GRANULARITY 1;
ALTER TABLE matches ADD INDEX idx_away_team away_team TYPE bloom_filter GRANULARITY 1;
ALTER TABLE matches ADD INDEX idx_league league TYPE bloom_filter GRANULARITY 1;
ALTER TABLE matches ADD INDEX idx_bookmaker bookmaker TYPE bloom_filter GRANULARITY 1;

-- MinMax indexes for date filtering
ALTER TABLE matches ADD INDEX idx_year year TYPE minmax GRANULARITY 1;
ALTER TABLE matches ADD INDEX idx_month month TYPE minmax GRANULARITY 1;

-- =====================================================
-- Comments for Documentation
-- =====================================================

-- Table: matches
-- Description: 730K+ match records with 240 fields (Excel columns 0-239)
-- Partitioning: None (single partition for 730K rows is optimal)
-- Ordering: league, year, month, day, home_team for efficient filtering
-- Engine: MergeTree for high-performance analytical queries
-- Data Source: Excel import with physical column mapping
