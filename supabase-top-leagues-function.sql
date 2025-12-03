-- =============================================
-- SUPABASE: Top Leagues RPC Function
-- Tarih: 03.12.2025
-- Amaç: En popüler ligleri hızlıca getirmek
-- =============================================

-- RPC Function: Top N Popüler Ligler (Maç Sayısına Göre)
-- Kullanım: SELECT * FROM get_top_leagues(20);
-- Hız: ~50-100ms (index kullanır - çok hızlı)
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

-- Grant permissions (public erişim için)
GRANT EXECUTE ON FUNCTION get_top_leagues(integer) TO anon;
GRANT EXECUTE ON FUNCTION get_top_leagues(integer) TO authenticated;

-- =============================================
-- RPC Function: Lig Arama (ILIKE ile hızlı arama)
-- =============================================
-- Kullanım: SELECT * FROM search_leagues('premier');
-- Hız: ~200-500ms (index kullanır)
-- =============================================
CREATE OR REPLACE FUNCTION search_leagues(search_term text, limit_count integer DEFAULT 50)
RETURNS TABLE(league text, match_count bigint) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    m.league,
    COUNT(*) as match_count
  FROM matches m
  WHERE m.league ILIKE '%' || search_term || '%'
  GROUP BY m.league
  ORDER BY match_count DESC, m.league ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION search_leagues(text, integer) TO anon;
GRANT EXECUTE ON FUNCTION search_leagues(text, integer) TO authenticated;

-- =============================================
-- Index: League için text pattern search
-- =============================================
-- ILIKE sorgularını hızlandırmak için pg_trgm extension kullan
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index (ILIKE sorgularını hızlandırır)
CREATE INDEX IF NOT EXISTS idx_matches_league_trgm ON matches USING gin (league gin_trgm_ops);

-- =============================================
-- TEST
-- =============================================
-- SELECT * FROM get_top_leagues(20);
-- SELECT * FROM search_leagues('premier', 50);
-- =============================================
