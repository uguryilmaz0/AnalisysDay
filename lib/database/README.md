# 🎯 ClickHouse Database Architecture - AnalysisDay

> **Generic, Scalable, Enterprise-grade Database Layer**

---

## 📁 Folder Structure

```
lib/database/
├── clickhouse/
│   ├── client.ts                    # ✅ Singleton connection manager
│   ├── queryBuilder.ts              # ✅ Generic query builder
│   └── migrations/
│       ├── 001_create_matches_table.sql      # ✅ Schema migration
│       └── 002_create_materialized_views.sql # ✅ Performance views
│
├── services/
│   ├── BaseRepository.ts            # ✅ Generic CRUD operations
│   ├── MatchRepository.ts           # ✅ Match-specific queries
│   └── LeagueRepository.ts          # ✅ League-specific queries
│
├── types/
│   ├── database.types.ts            # ✅ Generic database types
│   └── match.types.ts               # ✅ Match-specific types
│
└── index.ts                         # ✅ Central exports
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @clickhouse/client
```

### 2. Environment Setup

Add to `.env.local`:

```env
# ClickHouse Server (Admin/Write Access)
CLICKHOUSE_HOST=https://your-instance.clickhouse.cloud:8443
CLICKHOUSE_DATABASE=analysisday
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=your_password
CLICKHOUSE_MAX_OPEN_CONNECTIONS=10
CLICKHOUSE_REQUEST_TIMEOUT=30000
CLICKHOUSE_COMPRESSION=true
CLICKHOUSE_MAX_EXECUTION_TIME=60

# ClickHouse Client (Read-Only - Optional)
NEXT_PUBLIC_CLICKHOUSE_HOST=https://your-instance.clickhouse.cloud:8443
NEXT_PUBLIC_CLICKHOUSE_DATABASE=analysisday
NEXT_PUBLIC_CLICKHOUSE_USER=readonly_user
NEXT_PUBLIC_CLICKHOUSE_PASSWORD=readonly_password
```

### 3. Run Migrations

```bash
# Method 1: Using ClickHouse CLI
clickhouse-client --host your-host --query < lib/database/clickhouse/migrations/001_create_matches_table.sql
clickhouse-client --host your-host --query < lib/database/clickhouse/migrations/002_create_materialized_views.sql

# Method 2: Copy-paste to ClickHouse Cloud SQL Console
# https://clickhouse.cloud/ → SQL Console → Paste & Run
```

### 4. Import Data (from Supabase)

See: [Data Migration Script](#data-migration) below

---

## 💻 Usage Examples

### Initialize Connection

```typescript
import { initializeDatabase } from "@/lib/database";

// In your app initialization
await initializeDatabase();
```

### Using Repositories (Recommended)

```typescript
import { matchRepository, leagueRepository } from "@/lib/database";

// Get filtered matches
const result = await matchRepository.getFilteredMatches(
  {
    league: ["Premier League", "La Liga"],
    dateFrom: "2024-01-01",
    dateTo: "2024-12-31",
    ft_home_odds: ">2.0",
  },
  1,
  100
);

// Get leagues
const leagues = await leagueRepository.getAllLeagues("Premier");

// Get statistics
const stats = await matchRepository.getMatchStatistics({
  leagues: ["Premier League"],
  dateFrom: "2024-01-01",
  groupBy: "league",
});
```

### Using Query Builder (Advanced)

```typescript
import { ClickHouseQueryBuilder } from "@/lib/database";

const builder = new ClickHouseQueryBuilder<MatchData>("matches");

const query = builder
  .select("home_team", "away_team", "ft_score")
  .where("league", "eq", "Premier League")
  .andWhere("ft_over_25", "eq", 1)
  .orderBy("match_date", "desc")
  .limit(50)
  .toSQL();

console.log(query);
// SELECT home_team, away_team, ft_score FROM matches
// WHERE league = 'Premier League' AND ft_over_25 = 1
// ORDER BY match_date DESC LIMIT 50
```

### Direct Client Access (Low-level)

```typescript
import { clickHouseClient } from "@/lib/database";

const results = await clickHouseClient.query(
  `SELECT * FROM matches WHERE league = {league: String} LIMIT {limit: Int64}`,
  { league: "Premier League", limit: 100 }
);
```

---

## 🏗️ Architecture Patterns

### 1. Repository Pattern

- `BaseRepository<T>`: Generic CRUD operations
- `MatchRepository`: Specialized match queries
- `LeagueRepository`: Specialized league queries

### 2. Query Builder Pattern

- Type-safe query construction
- Database-agnostic interface
- Automatic parameter binding

### 3. Singleton Pattern

- Single connection instance
- Connection pooling
- Automatic reconnection

### 4. Type Safety

- Full TypeScript support
- Generic types for flexibility
- Compile-time validation

---

## 📊 Performance Features

### Optimizations

✅ **Partitioning by month** - Fast date range queries
✅ **Materialized views** - Pre-calculated aggregations (10-100x faster)
✅ **Bloom filter indexes** - Ultra-fast text searches
✅ **MinMax indexes** - Fast range queries
✅ **LZ4 compression** - Reduced storage & network
✅ **Connection pooling** - Efficient resource usage
✅ **Query metrics** - Performance monitoring

### Materialized Views

```sql
-- mv_unique_leagues: 10-100x faster league listing
SELECT * FROM analysisday.mv_unique_leagues;

-- mv_daily_stats: Pre-calculated daily statistics
SELECT * FROM analysisday.mv_daily_stats WHERE league = 'Premier League';

-- mv_team_stats: Quick team lookups
SELECT * FROM analysisday.mv_team_stats WHERE team = 'Arsenal';
```

---

## 🔄 Data Migration

### From Supabase to ClickHouse

Create a migration script (`scripts/migrate-supabase-to-clickhouse.ts`):

```typescript
import { createClient } from "@supabase/supabase-js";
import { clickHouseClient } from "@/lib/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function migrateData() {
  console.log("🚀 Starting migration...");

  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    // Insert to ClickHouse
    await clickHouseClient.insert("analysisday.matches", data);

    console.log(`✅ Migrated ${data.length} records (page ${page + 1})`);

    hasMore = data.length === pageSize;
    page++;
  }

  console.log("✅ Migration completed!");
}

migrateData().catch(console.error);
```

Run:

```bash
npx tsx scripts/migrate-supabase-to-clickhouse.ts
```

---

## 🧪 Testing

### Health Check

```typescript
import { getDatabaseHealth } from "@/lib/database";

const health = await getDatabaseHealth();
console.log(health);
// {
//   status: 'healthy',
//   stats: {
//     isConnected: true,
//     totalQueries: 42,
//     avgQueryTime: 85,
//     ...
//   }
// }
```

### Performance Test

```typescript
import { matchRepository } from "@/lib/database";

const start = Date.now();
const result = await matchRepository.getFilteredMatches(
  {
    league: ["Premier League"],
  },
  1,
  1000
);
const duration = Date.now() - start;

console.log(`✅ Query executed in ${duration}ms`);
console.log(`📊 Found ${result.total} matches`);
```

---

## 🔐 Security Best Practices

### Environment Variables

- ✅ Never commit credentials to git
- ✅ Use different users for read/write
- ✅ Enable HTTPS for ClickHouse connections
- ✅ Set appropriate query timeouts

### Access Control

```sql
-- Create read-only user for client-side
CREATE USER readonly_user IDENTIFIED BY 'strong_password';
GRANT SELECT ON analysisday.* TO readonly_user;

-- Create admin user for server-side
CREATE USER admin_user IDENTIFIED BY 'another_strong_password';
GRANT ALL PRIVILEGES ON analysisday.* TO admin_user;
```

---

## 📈 Monitoring

### Query Statistics

```typescript
import { getClickHouseStats } from "@/lib/database";

const stats = getClickHouseStats();
console.log(stats);
// {
//   isConnected: true,
//   totalQueries: 1234,
//   totalErrors: 5,
//   avgQueryTime: 95,
//   errorRate: '0.41%',
//   lastError: null,
//   config: { ... }
// }
```

---

## 🚨 Troubleshooting

### Connection Issues

```typescript
// Test connection
import { clickHouseClient } from "@/lib/database";

const isHealthy = await clickHouseClient.ping();
console.log("Healthy:", isHealthy);
```

### Query Errors

Check logs for detailed error messages:

```typescript
// All queries are automatically logged with execution time
// ✅ Query executed in 85ms
// ❌ Query failed after 2034ms: ...
```

---

## 📚 API Reference

### BaseRepository<T>

```typescript
interface IRepository<T> {
  findById(id: string | number): Promise<T | null>;
  findOne(options: QueryOptions<T>): Promise<T | null>;
  findMany(options: QueryOptions<T>): Promise<PaginatedResponse<T>>;
  findAll(): Promise<T[]>;
  count(options?: QueryOptions<T>): Promise<number>;
  aggregate(...): Promise<AggregationResult>;
  exists(options: QueryOptions<T>): Promise<boolean>;
  getDistinct(field: keyof T): Promise<any[]>;
}
```

### MatchRepository

```typescript
class MatchRepository extends BaseRepository<MatchData> {
  getFilteredMatches(
    filters: MatchFilters,
    page,
    limit
  ): Promise<MatchesResponse>;
  getMatchStatistics(filters: StatsFilters): Promise<MatchStatistics[]>;
  getMatchesByTeam(team: string, limit): Promise<MatchData[]>;
  getRecentMatches(limit): Promise<MatchData[]>;
}
```

### LeagueRepository

```typescript
class LeagueRepository extends BaseRepository<League> {
  getAllLeagues(search?: string): Promise<LeaguesResponse>;
  getFavoriteLeagues(limit): Promise<LeaguesResponse>;
  searchLeagues(search, limit): Promise<LeaguesResponse>;
  getLeagueDetails(leagueName): Promise<League | null>;
  getActiveLeagues(daysBack, limit): Promise<LeaguesResponse>;
}
```

---

## 🎓 Learning Resources

- [ClickHouse Documentation](https://clickhouse.com/docs)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Query Builder Pattern](https://en.wikipedia.org/wiki/Query_builder)

---

## 📞 Support

For issues or questions:

1. Check the main [Migration Plan](../CLICKHOUSE_MIGRATION_PLAN.md)
2. Review ClickHouse logs
3. Test connection with `ping()`

---

**Built with ❤️ using Next.js, TypeScript, and ClickHouse**
