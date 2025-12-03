-- =============================================
-- GROUP 5: İLK YARI 1X2
-- Half Time odds - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_ht_home_close ON matches(ht_home_odds_close) WHERE ht_home_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_draw_close ON matches(ht_draw_odds_close) WHERE ht_draw_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_away_close ON matches(ht_away_odds_close) WHERE ht_away_odds_close IS NOT NULL;
