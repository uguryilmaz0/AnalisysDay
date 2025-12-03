-- =============================================
-- GROUP 8: HANDICAP
-- Asian & European Handicap - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_ah_minus_05_close ON matches(ah_minus_05_home_odds_close) WHERE ah_minus_05_home_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ah_0_close ON matches(ah_0_home_odds_close) WHERE ah_0_home_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ah_plus_05_close ON matches(ah_plus_05_home_odds_close) WHERE ah_plus_05_home_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_eh_minus_1_close ON matches(eh_minus_1_home_odds_close) WHERE eh_minus_1_home_odds_close IS NOT NULL;
