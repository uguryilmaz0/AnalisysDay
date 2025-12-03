-- =====================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- =====================================================
-- 
-- Bu dosya matches tablosu için RLS politikalarını içerir.
-- RLS'i etkinleştirip güvenli erişim sağlar.
--
-- Kullanım:
-- 1. Supabase Dashboard -> SQL Editor'e gidin
-- 2. Bu dosyayı çalıştırın
-- 3. RLS otomatik olarak aktif olacak
--
-- =====================================================

-- 1. RLS'i etkinleştir
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 2. Tüm kullanıcıların matches tablosunu okuma (SELECT) yetkisi
-- Herkese açık okuma - anonim kullanıcılar dahil
CREATE POLICY "matches_select_policy"
ON matches
FOR SELECT
TO public
USING (true);

-- 3. Sadece authenticated kullanıcılar INSERT yapabilir
-- (Normalde matches tablosuna INSERT yapılmaz ama güvenlik için)
CREATE POLICY "matches_insert_policy"
ON matches
FOR INSERT
TO authenticated
WITH CHECK (false); -- Kimse INSERT yapamaz

-- 4. Sadece authenticated kullanıcılar UPDATE yapabilir
-- (Normalde matches tablosuna UPDATE yapılmaz ama güvenlik için)
CREATE POLICY "matches_update_policy"
ON matches
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false); -- Kimse UPDATE yapamaz

-- 5. Sadece authenticated kullanıcılar DELETE yapabilir
-- (Normalde matches tablosuna DELETE yapılmaz ama güvenlik için)
CREATE POLICY "matches_delete_policy"
ON matches
FOR DELETE
TO authenticated
USING (false); -- Kimse DELETE yapamaz

-- =====================================================
-- POLİTİKA KONTROLÜ
-- =====================================================

-- RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'matches';

-- Tüm politikaları listele
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'matches'
ORDER BY policyname;

-- =====================================================
-- POLİTİKALARI SİLMEK İÇİN (Gerekirse)
-- =====================================================

-- DROP POLICY IF EXISTS "matches_select_policy" ON matches;
-- DROP POLICY IF EXISTS "matches_insert_policy" ON matches;
-- DROP POLICY IF EXISTS "matches_update_policy" ON matches;
-- DROP POLICY IF EXISTS "matches_delete_policy" ON matches;

-- RLS'i devre dışı bırakmak için (KULLANMAYIN - TEHLİKELİ!)
-- ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
