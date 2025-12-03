-- =============================================
-- CACHE OPTIMIZATION FUNCTIONS (BASİT YAKLAŞIM)
-- 727K kayıt için 727 istek yerine 3 RPC call
-- =============================================

-- ÖNCE ESKİLERİ SİL (varsa)
DROP FUNCTION IF EXISTS get_all_leagues();
DROP FUNCTION IF EXISTS get_all_teams();
DROP FUNCTION IF EXISTS get_league_match_counts();

-- 1️⃣ TÜM LİGLERİ GETİR (Tek query'de unique)
CREATE OR REPLACE FUNCTION get_all_leagues()
RETURNS TABLE(league TEXT) AS $$
  SELECT DISTINCT league
  FROM matches
  WHERE league IS NOT NULL
  ORDER BY league;
$$ LANGUAGE sql STABLE;

-- 2️⃣ TÜM TAKIMLARI GETİR (Tek query'de unique)
CREATE OR REPLACE FUNCTION get_all_teams()
RETURNS TABLE(team_name TEXT) AS $$
  SELECT DISTINCT team_name
  FROM (
    SELECT home_team AS team_name FROM matches
    UNION
    SELECT away_team AS team_name FROM matches
  ) teams
  WHERE team_name IS NOT NULL
  ORDER BY team_name;
$$ LANGUAGE sql STABLE;

-- 3️⃣ LİG BAŞINA MAÇ SAYILARI (Tek query'de group by)
CREATE OR REPLACE FUNCTION get_league_match_counts()
RETURNS TABLE(league TEXT, match_count BIGINT) AS $$
  SELECT league, COUNT(*)::BIGINT AS match_count
  FROM matches
  WHERE league IS NOT NULL
  GROUP BY league
  ORDER BY match_count DESC;
$$ LANGUAGE sql STABLE;

-- =============================================
-- KULLANIM:
-- SELECT * FROM get_all_leagues();
-- SELECT * FROM get_all_teams();
-- SELECT * FROM get_league_match_counts();
-- =============================================

-- ⚡ PERFORMANS: Bu fonksiyonlar tek query'de çalışır
-- 727K kayıt için ~727 batch yerine sadece 3 RPC call!
