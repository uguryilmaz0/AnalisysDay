-- =============================================
-- League Sayısı Kontrolü
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- =============================================

-- 1. Toplam unique league sayısı
SELECT COUNT(DISTINCT league) as total_unique_leagues
FROM matches;

-- 2. RPC fonksiyonunun döndürdüğü kayıt sayısı
SELECT COUNT(*) as rpc_returns
FROM get_unique_leagues();

-- 3. İlk 10 lig (alfabetik)
SELECT league, COUNT(*) as match_count
FROM matches
GROUP BY league
ORDER BY league ASC
LIMIT 10;

-- 4. Son 10 lig (alfabetik)
SELECT league, COUNT(*) as match_count
FROM matches
GROUP BY league
ORDER BY league DESC
LIMIT 10;

-- 5. RPC fonksiyonunun tam çıktısını görmek (kaç satır döndürüyor?)
-- Bu sorgu RPC'nin döndürdüğü tüm kayıtları getirir
SELECT * FROM get_unique_leagues()
ORDER BY league ASC;
