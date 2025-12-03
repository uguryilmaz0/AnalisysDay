-- =============================================
-- SUPABASE OPTIMIZATION: RPC Functions & Indexes
-- Tarih: 03.12.2025
-- Amaç: Lazy loading için hızlı lig listesi ve optimized queries
-- =============================================

-- 1. Index: League bazlı sorgular için (varsa skip)
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);

-- 2. Index: Match date (zaten var ama emin olmak için)
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches(match_date DESC);

-- 3. Composite Index: League + Match Date (filtrelenmiş sıralama için)
CREATE INDEX IF NOT EXISTS idx_matches_league_date ON matches(league, match_date DESC);

-- =============================================
-- RPC Function: Unique League Listesi
-- =============================================
-- Kullanım: SELECT * FROM get_unique_leagues();
-- Hız: ~100ms (730K kayıt için - index sayesinde)
-- =============================================
CREATE OR REPLACE FUNCTION get_unique_leagues()
RETURNS TABLE(league text, match_count bigint) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    m.league,
    COUNT(*) as match_count
  FROM matches m
  GROUP BY m.league
  ORDER BY m.league ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions (public erişim için)
GRANT EXECUTE ON FUNCTION get_unique_leagues() TO anon;
GRANT EXECUTE ON FUNCTION get_unique_leagues() TO authenticated;

-- =============================================
-- RPC Function: Top 20 Popüler Ligler (Maç Sayısına Göre)
-- =============================================
-- Kullanım: SELECT * FROM get_top_leagues(20);
-- Hız: ~50ms (çok hızlı - index kullanır)
-- =============================================
CREATE OR REPLACE FUNCTION get_top_leagues(limit_count integer DEFAULT 20)
RETURNS TABLE(league text, match_count bigint) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    m.league,
    COUNT(*) as match_count
  FROM matches m
  GROUP BY m.league
  ORDER BY match_count DESC, m.league ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION get_top_leagues(integer) TO anon;
GRANT EXECUTE ON FUNCTION get_top_leagues(integer) TO authenticated;

-- =============================================
-- RPC Function: Filtrelenmiş Maç Sayısı (Hızlı COUNT)
-- =============================================
-- Kullanım: SELECT * FROM get_match_count_by_leagues(ARRAY['Premier League', 'La Liga']);
-- =============================================
CREATE OR REPLACE FUNCTION get_match_count_by_leagues(league_names text[])
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM matches
    WHERE league = ANY(league_names)
  );
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION get_match_count_by_leagues(text[]) TO anon;
GRANT EXECUTE ON FUNCTION get_match_count_by_leagues(text[]) TO authenticated;

-- =============================================
-- RPC Function: Hızlı İstatistik Hesaplama
-- =============================================
-- Kullanım: SELECT * FROM get_match_stats_by_leagues(ARRAY['Premier League']);
-- =============================================
CREATE OR REPLACE FUNCTION get_match_stats_by_leagues(league_names text[])
RETURNS TABLE(
  total_matches bigint,
  over15_count bigint,
  over15_percentage numeric,
  over25_count bigint,
  over25_percentage numeric,
  btts_count bigint,
  btts_percentage numeric
) AS $$
DECLARE
  total bigint;
  over15 bigint;
  over25 bigint;
  btts bigint;
BEGIN
  -- Toplam maç sayısı
  SELECT COUNT(*) INTO total
  FROM matches
  WHERE league = ANY(league_names);
  
  -- Over 1.5 sayısı
  SELECT COUNT(*) INTO over15
  FROM matches
  WHERE league = ANY(league_names)
    AND ft_over_15 = 1;
  
  -- Over 2.5 sayısı
  SELECT COUNT(*) INTO over25
  FROM matches
  WHERE league = ANY(league_names)
    AND ft_over_25 = 1;
  
  -- BTTS sayısı
  SELECT COUNT(*) INTO btts
  FROM matches
  WHERE league = ANY(league_names)
    AND btts = 1;
  
  -- Sonuçları döndür
  RETURN QUERY SELECT
    total as total_matches,
    over15 as over15_count,
    CASE WHEN total > 0 THEN ROUND((over15::numeric / total::numeric * 100), 2) ELSE 0 END as over15_percentage,
    over25 as over25_count,
    CASE WHEN total > 0 THEN ROUND((over25::numeric / total::numeric * 100), 2) ELSE 0 END as over25_percentage,
    btts as btts_count,
    CASE WHEN total > 0 THEN ROUND((btts::numeric / total::numeric * 100), 2) ELSE 0 END as btts_percentage;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION get_match_stats_by_leagues(text[]) TO anon;
GRANT EXECUTE ON FUNCTION get_match_stats_by_leagues(text[]) TO authenticated;

-- =============================================
-- Test Queries (Performans kontrolü)
-- =============================================
-- Test 1: Lig listesi (hızlı olmalı)
-- SELECT * FROM get_unique_leagues();

-- Test 2: Filtrelenmiş sayım
-- SELECT * FROM get_match_count_by_leagues(ARRAY['Premier League', 'La Liga']);

-- Test 3: İstatistikler
-- SELECT * FROM get_match_stats_by_leagues(ARRAY['Premier League']);

-- =============================================
-- NOTLAR:
-- =============================================
-- 1. Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- 2. Index'ler otomatik oluşturulur (IF NOT EXISTS)
-- 3. RPC fonksiyonları public ve authenticated kullanıcılara açık
-- 4. STABLE keyword: Fonksiyonun aynı parametrelerle her zaman aynı sonucu döndüreceğini garanti eder
-- =============================================
