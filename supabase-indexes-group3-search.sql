-- =============================================
-- GROUP 3: TAKIM ARAMA DEVAM + YARDIMCI
-- Full-text search ve diğerleri - Tahmini: 1-2 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_away_team_lower ON matches(LOWER(away_team) text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_matches_teams_fulltext ON matches USING GIN (to_tsvector('english', home_team || ' ' || away_team));
CREATE INDEX IF NOT EXISTS idx_matches_time ON matches(time);
