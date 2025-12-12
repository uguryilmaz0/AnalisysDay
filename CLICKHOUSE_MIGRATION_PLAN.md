# 🚀 ClickHouse Migration Plan - AnalysisDay

> **Proje:** Supabase'den ClickHouse'a Tam Geçiş Stratejisi
> **Tarih:** 12 Aralık 2025
> **Hedef:** Enterprise-grade, scalable, generic database architecture

---

## 📊 Mevcut Sistem Analizi

### Kullanılan Veritabanları

1. **Firebase Firestore** (Auth + User Data)
   - Authentication (Firebase Auth)
   - Users collection
   - Daily analyses collection
   - Email verification
   - Password reset
2. **Supabase (PostgreSQL)** (Match Data)
   - ⚠️ \*\*KALDIRILACAKMatches tablosu (~500K+ rows, complex queries)
   - RLS politikaları
   - RPC functions (get_unique_leagues)
3. **Upstash Redis** (Rate Limiting)
   - ✅ **KALACAK** - Rate limiting için ideal

### Supabase Kullanım Noktaları

```
lib/supabase.ts              → Supabase client tanımları
lib/matchService.ts          → Match queries (CORE)
app/api/matches/route.ts     → Match API endpoint
app/api/matches/leagues/route.ts → Leagues API
app/api/matches/stats/route.ts   → Stats API
app/api/cron/sync-matches/route.ts → Match sync cron
app/api/test-rls/route.ts    → Test endpoint
```

---

## 🎯 Geçiş Stratejisi

### Faz 1: ClickHouse Kurulumu ve Generic Infrastructure

- ClickHouse client kurulumu
- Generic database service layer
- Connection pooling & optimization
- Environment setup

### Faz 2: Data Migration

- Schema migration (Supabase → ClickHouse)
- Data migration script
- Validation & testing

### Faz 3: Code Refactoring

- Service layer implementation
- API endpoints refactoring
- Client-side integration

### Faz 4: Testing & Deployment

- Performance testing
- Load testing
- Production deployment
- Supabase cleanup

---

## 📦 Gerekli Paketler

### Production Dependencies

```bash
npm install @clickhouse/client
npm install @clickhouse/client-web  # Client-side için (optional)
```

### Dev Dependencies

```bash
npm install -D @types/node
```

### Kaldırılacak Paketler

```bash
npm uninstall @supabase/supabase-js
npm uninstall @supabase/auth-js
npm uninstall @supabase/postgrest-js
npm uninstall @supabase/realtime-js
npm uninstall @supabase/storage-js
npm uninstall @supabase/functions-js
```

---

## 🔐 Environment Variables

### Yeni Eklenmesi Gerekenler (.env.local)

```env
# =====================================================
# ClickHouse Configuration
# =====================================================

# ClickHouse Connection
CLICKHOUSE_HOST=https://your-clickhouse-instance.cloud
CLICKHOUSE_PORT=8443
CLICKHOUSE_DATABASE=analysisday
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=your_secure_password

# ClickHouse Cloud (Alternatif - Managed Service)
# https://clickhouse.cloud/
CLICKHOUSE_CLOUD_HOST=https://xxxxx.clickhouse.cloud:8443
CLICKHOUSE_CLOUD_USER=default
CLICKHOUSE_CLOUD_PASSWORD=your_password
CLICKHOUSE_CLOUD_DATABASE=analysisday

# Connection Pool Settings
CLICKHOUSE_MAX_OPEN_CONNECTIONS=10
CLICKHOUSE_REQUEST_TIMEOUT=30000
CLICKHOUSE_COMPRESSION=true

# Query Optimization
CLICKHOUSE_MAX_EXECUTION_TIME=60
CLICKHOUSE_ENABLE_QUERY_CACHE=true

# Client-Side (Public - Read Only)
NEXT_PUBLIC_CLICKHOUSE_HOST=https://xxxxx.clickhouse.cloud:8443
NEXT_PUBLIC_CLICKHOUSE_DATABASE=analysisday
NEXT_PUBLIC_CLICKHOUSE_USER=public_readonly
NEXT_PUBLIC_CLICKHOUSE_PASSWORD=public_password_readonly
```

### Kaldırılacak Olanlar

```env
# KALDIRIN - Artık kullanılmayacak
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### Güncellenmiş .env.local Template

```env
# =====================================================
# Firebase Configuration (AUTH - KORUNACAK)
# =====================================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# =====================================================
# ClickHouse Configuration (YENİ - MATCH DATA)
# =====================================================
CLICKHOUSE_HOST=https://your-instance.clickhouse.cloud:8443
CLICKHOUSE_DATABASE=analysisday
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=your_secure_password
CLICKHOUSE_MAX_OPEN_CONNECTIONS=10
CLICKHOUSE_REQUEST_TIMEOUT=30000
CLICKHOUSE_COMPRESSION=true
CLICKHOUSE_MAX_EXECUTION_TIME=60

# Client-Side ClickHouse (Read-Only User)
NEXT_PUBLIC_CLICKHOUSE_HOST=https://your-instance.clickhouse.cloud:8443
NEXT_PUBLIC_CLICKHOUSE_DATABASE=analysisday
NEXT_PUBLIC_CLICKHOUSE_USER=public_readonly
NEXT_PUBLIC_CLICKHOUSE_PASSWORD=readonly_password

# =====================================================
# Upstash Redis (RATE LIMITING - KORUNACAK)
# =====================================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# =====================================================
# Application Configuration
# =====================================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET=your_receipt_preset
NEXT_PUBLIC_WHATSAPP_NUMBER=905xxxxxxxxx
NEXT_PUBLIC_IBAN=TR00 0000 0000 0000 0000 0000 00
NEXT_PUBLIC_BANK_NAME=Bank Name
NEXT_PUBLIC_ACCOUNT_HOLDER=Account Holder
NEXT_PUBLIC_SUPER_ADMIN_EMAILS=admin@admin.com

# =====================================================
# Optional Services
# =====================================================
# Sentry, Analytics, etc.
```

---

## 🗄️ ClickHouse Schema Design

### Matches Table (Optimized for Analytics)

```sql
CREATE TABLE IF NOT EXISTS analysisday.matches
(
    -- Primary Fields
    id UInt64,
    match_date Date,
    match_datetime DateTime,

    -- Teams & League
    home_team String,
    away_team String,
    league String,
    bookmaker String,

    -- Scores
    ht_score String,
    ft_score String,
    ht_ft String,

    -- Match Outcomes (Boolean as UInt8)
    ht_over_05 UInt8,
    ft_over_15 UInt8,
    ft_over_25 UInt8,
    ft_over_35 UInt8,
    btts UInt8,

    -- Time Components (for filtering)
    day UInt8,
    month UInt8,
    year UInt16,
    time String,

    -- Full Time Odds
    ft_home_odds_open Nullable(Float32),
    ft_home_odds_close Nullable(Float32),
    ft_draw_odds_open Nullable(Float32),
    ft_draw_odds_close Nullable(Float32),
    ft_away_odds_open Nullable(Float32),
    ft_away_odds_close Nullable(Float32),

    -- Half Time Odds
    ht_home_odds_open Nullable(Float32),
    ht_home_odds_close Nullable(Float32),
    ht_draw_odds_open Nullable(Float32),
    ht_draw_odds_close Nullable(Float32),
    ht_away_odds_open Nullable(Float32),
    ht_away_odds_close Nullable(Float32),

    -- Second Half Odds
    sh_home_odds_open Nullable(Float32),
    sh_home_odds_close Nullable(Float32),
    sh_draw_odds_open Nullable(Float32),
    sh_draw_odds_close Nullable(Float32),
    sh_away_odds_open Nullable(Float32),
    sh_away_odds_close Nullable(Float32),

    -- Double Chance Odds
    ft_dc_1x_odds_open Nullable(Float32),
    ft_dc_1x_odds_close Nullable(Float32),
    ft_dc_12_odds_open Nullable(Float32),
    ft_dc_12_odds_close Nullable(Float32),
    ft_dc_x2_odds_open Nullable(Float32),
    ft_dc_x2_odds_close Nullable(Float32),

    ht_dc_1x_odds_open Nullable(Float32),
    ht_dc_1x_odds_close Nullable(Float32),
    ht_dc_12_odds_open Nullable(Float32),
    ht_dc_12_odds_close Nullable(Float32),
    ht_dc_x2_odds_open Nullable(Float32),
    ht_dc_x2_odds_close Nullable(Float32),

    -- Asian Handicap
    ah_minus_05_home_odds_open Nullable(Float32),
    ah_minus_05_home_odds_close Nullable(Float32),
    ah_minus_05_away_odds_open Nullable(Float32),
    ah_minus_05_away_odds_close Nullable(Float32),

    ah_0_home_odds_open Nullable(Float32),
    ah_0_home_odds_close Nullable(Float32),
    ah_0_away_odds_open Nullable(Float32),
    ah_0_away_odds_close Nullable(Float32),

    ah_plus_05_home_odds_open Nullable(Float32),
    ah_plus_05_home_odds_close Nullable(Float32),
    ah_plus_05_away_odds_open Nullable(Float32),
    ah_plus_05_away_odds_close Nullable(Float32),

    -- European Handicap
    eh_minus_1_home_odds_open Nullable(Float32),
    eh_minus_1_home_odds_close Nullable(Float32),
    eh_minus_1_draw_odds_open Nullable(Float32),
    eh_minus_1_draw_odds_close Nullable(Float32),
    eh_minus_1_away_odds_open Nullable(Float32),
    eh_minus_1_away_odds_close Nullable(Float32),

    -- HT/FT Odds (9 combinations)
    ht_ft_11_odds_open Nullable(Float32),
    ht_ft_11_odds_close Nullable(Float32),
    ht_ft_1x_odds_open Nullable(Float32),
    ht_ft_1x_odds_close Nullable(Float32),
    ht_ft_12_odds_open Nullable(Float32),
    ht_ft_12_odds_close Nullable(Float32),
    ht_ft_x1_odds_open Nullable(Float32),
    ht_ft_x1_odds_close Nullable(Float32),
    ht_ft_xx_odds_open Nullable(Float32),
    ht_ft_xx_odds_close Nullable(Float32),
    ht_ft_x2_odds_open Nullable(Float32),
    ht_ft_x2_odds_close Nullable(Float32),
    ht_ft_21_odds_open Nullable(Float32),
    ht_ft_21_odds_close Nullable(Float32),
    ht_ft_2x_odds_open Nullable(Float32),
    ht_ft_2x_odds_close Nullable(Float32),
    ht_ft_22_odds_open Nullable(Float32),
    ht_ft_22_odds_close Nullable(Float32),

    -- Metadata
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(match_date)
ORDER BY (league, match_date, id)
SETTINGS index_granularity = 8192;

-- Indexes for Performance
ALTER TABLE analysisday.matches ADD INDEX idx_home_team home_team TYPE bloom_filter GRANULARITY 1;
ALTER TABLE analysisday.matches ADD INDEX idx_away_team away_team TYPE bloom_filter GRANULARITY 1;
ALTER TABLE analysisday.matches ADD INDEX idx_match_datetime match_datetime TYPE minmax GRANULARITY 1;
```

### Leagues Materialized View (Ultra-Fast)

```sql
-- Unique leagues için materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS analysisday.mv_unique_leagues
ENGINE = AggregatingMergeTree()
ORDER BY league
AS SELECT
    league,
    count() as match_count,
    min(match_date) as first_match,
    max(match_date) as last_match
FROM analysisday.matches
GROUP BY league;
```

### Stats Aggregation (Pre-calculated)

```sql
-- Günlük istatistikler için materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS analysisday.mv_daily_stats
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(match_date)
ORDER BY (match_date, league)
AS SELECT
    match_date,
    league,
    count() as total_matches,
    sum(ht_over_05) as ht_over_05_count,
    sum(ft_over_15) as ft_over_15_count,
    sum(ft_over_25) as ft_over_25_count,
    sum(btts) as btts_count,
    avg(ft_home_odds_close) as avg_home_odds,
    avg(ft_draw_odds_close) as avg_draw_odds,
    avg(ft_away_odds_close) as avg_away_odds
FROM analysisday.matches
GROUP BY match_date, league;
```

---

## 🏗️ Generic Architecture Design

### Folder Structure

```
lib/
├── database/
│   ├── clickhouse/
│   │   ├── client.ts              # ClickHouse client singleton
│   │   ├── connection.ts          # Connection pool manager
│   │   ├── queryBuilder.ts        # Generic query builder
│   │   └── migrations/
│   │       ├── 001_create_matches_table.sql
│   │       └── 002_create_materialized_views.sql
│   │
│   ├── services/
│   │   ├── BaseRepository.ts      # Generic repository pattern
│   │   ├── MatchRepository.ts     # Match-specific queries
│   │   └── LeagueRepository.ts    # League-specific queries
│   │
│   ├── types/
│   │   ├── database.types.ts      # Generic DB types
│   │   ├── match.types.ts         # Match-specific types
│   │   └── query.types.ts         # Query builder types
│   │
│   └── utils/
│       ├── queryOptimizer.ts      # Query optimization utilities
│       ├── cacheManager.ts        # Query result caching
│       └── errorHandler.ts        # DB error handling
│
├── firebase.ts                     # Korunacak (Auth)
├── db.ts                           # Güncellenecek (Firebase + ClickHouse)
└── supabase.ts                     # SİLİNECEK
```

---

## 🔧 Implementation Checklist

### Phase 1: Infrastructure Setup ✅

- [ ] ClickHouse Cloud/Server kurulumu
- [ ] Environment variables tanımlama
- [ ] npm paketleri kurulumu
- [ ] Generic client implementation
- [ ] Connection pool setup
- [ ] Error handling setup

### Phase 2: Generic Service Layer ✅

- [ ] BaseRepository sınıfı
- [ ] QueryBuilder utility
- [ ] Type definitions
- [ ] MatchRepository implementation
- [ ] LeagueRepository implementation
- [ ] Cache manager

### Phase 3: Schema Migration ✅

- [ ] ClickHouse schema oluşturma
- [ ] Materialized views oluşturma
- [ ] Indexes oluşturma
- [ ] Data migration script
- [ ] Data validation

### Phase 4: Code Refactoring ✅

- [ ] lib/matchService.ts refactor
- [ ] app/api/matches/route.ts refactor
- [ ] app/api/matches/leagues/route.ts refactor
- [ ] app/api/matches/stats/route.ts refactor
- [ ] app/api/cron/sync-matches/route.ts refactor
- [ ] Test endpoints güncelleme

### Phase 5: Testing ✅

- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance tests
- [ ] Load tests
- [ ] Data integrity validation

### Phase 6: Deployment ✅

- [ ] Staging deployment
- [ ] Production migration
- [ ] Monitoring setup
- [ ] Supabase cleanup
- [ ] Documentation

---

## 📈 Performance Expectations

### Current (Supabase)

- Match queries: ~500ms - 2s
- League fetch: ~300ms - 1s
- Complex filters: ~2s - 5s

### Expected (ClickHouse)

- Match queries: ~50ms - 200ms (10x faster)
- League fetch: ~10ms - 50ms (20x faster)
- Complex filters: ~100ms - 500ms (10x faster)
- Aggregations: ~50ms (100x faster)

### Optimization Features

- ✅ Partitioning by month
- ✅ Materialized views for aggregations
- ✅ Bloom filter indexes
- ✅ Compression (LZ4)
- ✅ Connection pooling
- ✅ Query result caching

---

## 🚨 Risk Mitigation

### Risks

1. **Data Loss** → Migration script + validation
2. **Downtime** → Blue-green deployment
3. **Performance Regression** → Load testing before deployment
4. **Breaking Changes** → Backward compatibility layer

### Rollback Plan

1. Keep Supabase active during migration
2. Feature flag for database selection
3. Automated rollback script
4. Data sync mechanism

---

## 💰 Cost Analysis

### Supabase (Current)

- Free tier: 500MB DB, Limited queries
- Pro: $25/mo + egress costs
- **Problem:** Expensive at scale

### ClickHouse Cloud

- Free tier: 50GB storage, 50GB processing/mo
- Production: Pay-as-you-go (~$20-50/mo for 500K rows)
- **Benefit:** Better performance, lower cost at scale

### Cost Saving

- **Estimated:** 40-60% cost reduction
- **Performance:** 10-100x improvement

---

## 📝 Migration Timeline

### Week 1: Preparation

- [ ] ClickHouse setup
- [ ] Generic infrastructure
- [ ] Schema design

### Week 2: Implementation

- [ ] Service layer
- [ ] Repository pattern
- [ ] API refactoring

### Week 3: Testing

- [ ] Unit & integration tests
- [ ] Performance testing
- [ ] Data migration

### Week 4: Deployment

- [ ] Staging deployment
- [ ] Production migration
- [ ] Monitoring & optimization

---

## 🎓 Learning Resources

### ClickHouse Documentation

- [Official Docs](https://clickhouse.com/docs)
- [Best Practices](https://clickhouse.com/docs/en/guides/best-practices)
- [Performance Guide](https://clickhouse.com/docs/en/guides/improving-query-performance)

### Architecture Patterns

- Repository Pattern
- Query Builder Pattern
- Connection Pool Pattern
- Cache-Aside Pattern

---

## ✅ Next Steps

1. **ClickHouse Cloud Sign Up**

   - https://clickhouse.cloud/
   - Create free tier account
   - Get connection credentials

2. **Run Setup Script**

   ```bash
   npm run db:setup:clickhouse
   ```

3. **Test Connection**

   ```bash
   npm run db:test:connection
   ```

4. **Start Migration**
   ```bash
   npm run db:migrate:from-supabase
   ```

---

## 📞 Support

- ClickHouse Community: https://clickhouse.com/slack
- ClickHouse Cloud Support: support@clickhouse.com
- Project Issues: GitHub Issues

---

**Generated by:** GitHub Copilot
**Date:** 12 Aralık 2025
**Version:** 1.0.0
