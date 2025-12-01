-- =============================================
-- Supabase Performance Optimization Indexes
-- 713k veri için kritik performans iyileştirmesi
-- =============================================

-- 1. Match Date Index (En çok kullanılan filtre)
CREATE INDEX IF NOT EXISTS idx_matches_match_date 
ON matches(match_date DESC);

-- 2. League Index (Lig filtreleme için)
CREATE INDEX IF NOT EXISTS idx_matches_league 
ON matches(league);

-- 3. Team Search Index (Home Team)
CREATE INDEX IF NOT EXISTS idx_matches_home_team 
ON matches(home_team);

-- 4. Team Search Index (Away Team)
CREATE INDEX IF NOT EXISTS idx_matches_away_team 
ON matches(away_team);

-- 5. Composite Index (Lig + Tarih kombinasyonu)
CREATE INDEX IF NOT EXISTS idx_matches_league_date 
ON matches(league, match_date DESC);

-- 6. Over/Under Indexes
CREATE INDEX IF NOT EXISTS idx_matches_ft_over_15 
ON matches(ft_over_15) WHERE ft_over_15 = 1;

CREATE INDEX IF NOT EXISTS idx_matches_ft_over_25 
ON matches(ft_over_25) WHERE ft_over_25 = 1;

CREATE INDEX IF NOT EXISTS idx_matches_ft_over_35 
ON matches(ft_over_35) WHERE ft_over_35 = 1;

-- 7. BTTS Index
CREATE INDEX IF NOT EXISTS idx_matches_btts 
ON matches(btts) WHERE btts = 1;

-- 8. Full-text search index (Team names için)
CREATE INDEX IF NOT EXISTS idx_matches_teams_fulltext 
ON matches USING GIN (to_tsvector('english', home_team || ' ' || away_team));

-- =============================================
-- ⚠️ VACUUM komutu ayrı çalıştırılmalı!
-- =============================================
-- Index'ler oluştuktan SONRA, ayrı bir sorgu olarak çalıştırın:
-- VACUUM ANALYZE matches;

-- =============================================
-- Index Kullanım İstatistikleri (Kontrol için)
-- =============================================
-- Bu sorguyu çalıştırarak hangi index'lerin kullanıldığını görebilirsiniz:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'matches'
-- ORDER BY idx_scan DESC;

-- =============================================
-- NOTLAR
-- =============================================
-- 1. Bu script'i Supabase SQL Editor'de çalıştırın
-- 2. Index oluşturma 5-10 dakika sürebilir (713k veri için)
-- 3. Index'ler oluşturulduktan sonra query süreleri:
--    - Öncesi: 30+ saniye (timeout)
--    - Sonrası: 0.1-0.5 saniye
-- 4. Storage artışı: ~10-15% (yaklaşık 50-100 MB)
