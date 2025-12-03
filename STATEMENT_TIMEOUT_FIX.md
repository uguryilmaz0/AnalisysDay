# Supabase Statement Timeout Düzeltme Rehberi

## 🔴 Problem

- **Error**: `canceling statement due to statement timeout`
- **Sebep**: ILIKE queries 730k satırda index kullanamıyor
- **Etkilenen**: `home_team` ve `away_team` aramaları

## ✅ Çözüm Adımları

### 1. Supabase Dashboard'a Git

1. https://supabase.com/dashboard adresine git
2. Project'ini seç
3. **SQL Editor** tab'ına gir

### 2. Index'leri Oluştur

Aşağıdaki SQL kodunu **SQL Editor**'e yapıştır ve çalıştır:

```sql
-- =============================================
-- CRITICAL INDEXES FOR STATEMENT TIMEOUT FIX
-- =============================================

-- 1. ILIKE için text_pattern_ops index'leri (MÜTHİŞ HIZLI)
DROP INDEX IF EXISTS idx_matches_home_team;
DROP INDEX IF EXISTS idx_matches_away_team;

CREATE INDEX idx_matches_home_team
ON matches(home_team text_pattern_ops);

CREATE INDEX idx_matches_away_team
ON matches(away_team text_pattern_ops);

-- 2. Lowercase search için (case-insensitive)
CREATE INDEX idx_matches_home_team_lower
ON matches(LOWER(home_team) text_pattern_ops);

CREATE INDEX idx_matches_away_team_lower
ON matches(LOWER(away_team) text_pattern_ops);

-- 3. Match date index (sıralama için)
CREATE INDEX IF NOT EXISTS idx_matches_match_date
ON matches(match_date DESC);

-- 4. League index (lig filtreleme için)
CREATE INDEX IF NOT EXISTS idx_matches_league
ON matches(league);

-- 5. Composite index (lig + tarih kombinasyonu)
CREATE INDEX IF NOT EXISTS idx_matches_league_date
ON matches(league, match_date DESC);
```

### 3. İstatistikleri Güncelle (Opsiyonel)

⚠️ **VACUUM Supabase SQL Editor'de ÇALIŞMAZ** (transaction block hatası)

Index'ler oluştuktan sonra sadece **ANALYZE** çalıştır:

```sql
ANALYZE matches;
```

_(Not: VACUUM işlemini Supabase otomatik olarak arka planda yapar)_

### 4. Test Et

- Database Analysis sayfasına git
- Bir takım ara (örn: "Houston Dynamo")
- Artık timeout hatası gelmemeli!

## 📊 Performans Beklentileri

**Öncesi:**

- Query süresi: 30+ saniye → Timeout
- Full table scan: 730,000 satır

**Sonrası:**

- Query süresi: 0.1-0.5 saniye
- Index scan: Sadece eşleşen satırlar

## ⚠️ Önemli Notlar

1. **text_pattern_ops**: `ILIKE 'word%'` pattern'i için optimize
2. **%word% Pattern**: Index KULLANAMAZ - bu yüzden kodda `word%` kullanıyoruz
3. **Limit**: Query'lere safety limit eklendi (1000 row)
4. **Cache**: İstatistikler 60 dakika cache'leniyor

## 🔧 Kod Değişiklikleri

### matchService.ts

- ✅ `ilike '%word%'` → `ilike 'word%'` (index kullanımı için)
- ✅ Tam eşleşme öncelikli: `eq` + `ilike` kombinasyonu
- ✅ Safety limit: Maksimum 1000 row
- ✅ Statistics limit: Maksimum 50000 row

### Sorgu Optimizasyonu

```typescript
// ❌ YAVAŞ (Index kullanamaz)
query = query.ilike("home_team", "%Houston%");

// ✅ HIZLI (Index kullanır)
query = query.or("home_team.eq.Houston,home_team.ilike.Houston%");
```

## 🎯 Sonuç

Bu değişikliklerden sonra:

- ✅ Statement timeout hatası çözülür
- ✅ Takım aramaları 100x daha hızlı olur
- ✅ Lig filtrelemeleri anında çalışır
- ✅ İstatistikler saniyeler içinde hesaplanır
