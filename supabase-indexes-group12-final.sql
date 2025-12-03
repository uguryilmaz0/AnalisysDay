-- =============================================
-- GROUP 12: TARİH & BOOKMAKER (SON GRUP)
-- Tarih index'leri ve Bookmaker - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_bookmaker ON matches(bookmaker);
CREATE INDEX IF NOT EXISTS idx_matches_year ON matches(year);
CREATE INDEX IF NOT EXISTS idx_matches_month ON matches(month);
CREATE INDEX IF NOT EXISTS idx_matches_day ON matches(day);
CREATE INDEX IF NOT EXISTS idx_matches_year_month ON matches(year, month);

-- =============================================
-- ✅ TÜM İNDEXLER TAMAMLANDI!
-- SON ADIM: Aşağıdaki komutu çalıştırın
-- =============================================
-- ANALYZE matches;
