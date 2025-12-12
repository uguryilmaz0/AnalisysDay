import 'dotenv/config';

// Interfaces for API responses
interface StatsAPIResponse {
  type: string;
  totalMatches?: number;
  count?: number;
  data?: Array<Record<string, unknown>>;
  source: string;
  btts?: { count: number; percentage: string };
  ftOver25?: { count: number; percentage: string };
  avgOdds?: { home: string; draw: string; away: string };
}

/**
 * Test refactored stats API endpoint
 */
async function testStatsAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing refactored /api/matches/stats endpoint with ClickHouse');
  
  try {
    // Test 1: Aggregated stats (default)
    console.log('\n1️⃣ Test: Aggregated stats (Premier League)');
    const response1 = await fetch(`${baseURL}/api/matches/stats?leagues=England: Premier League&type=aggregated`);
    
    if (!response1.ok) {
      console.error(`❌ HTTP Error: ${response1.status}`);
      const errorText = await response1.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data1 = await response1.json() as StatsAPIResponse;
    console.log(`✅ Aggregated stats:`, {
      totalMatches: data1.totalMatches,
      btts: `${data1.btts?.count} (${data1.btts?.percentage}%)`,
      over25: `${data1.ftOver25?.count} (${data1.ftOver25?.percentage}%)`,
      avgHomeOdds: data1.avgOdds?.home,
      source: data1.source
    });

    // Test 2: Daily stats using materialized view
    console.log('\n2️⃣ Test: Daily stats (mv_daily_stats)');
    const response2 = await fetch(`${baseURL}/api/matches/stats?leagues=England: Premier League&type=daily`);
    const data2 = await response2.json() as StatsAPIResponse;
    
    console.log(`✅ Daily stats:`, {
      count: data2.count,
      source: data2.source,
      sample: data2.data?.slice(0, 2).map((d) => `${(d as Record<string, unknown>).year}-${(d as Record<string, unknown>).month}-${(d as Record<string, unknown>).day}: ${(d as Record<string, unknown>).total_matches} matches`)
    });

    // Test 3: Monthly stats using materialized view
    console.log('\n3️⃣ Test: Monthly stats (mv_monthly_league_stats)');
    const response3 = await fetch(`${baseURL}/api/matches/stats?type=monthly&leagues=England: Premier League`);
    const data3 = await response3.json() as StatsAPIResponse;
    
    console.log(`✅ Monthly stats:`, {
      count: data3.count,
      source: data3.source,
      sample: data3.data?.slice(0, 2).map((d) => `${(d as Record<string, unknown>).year}-${(d as Record<string, unknown>).month}: ${(d as Record<string, unknown>).total_matches} matches in ${(d as Record<string, unknown>).league}`)
    });

    // Test 4: Team stats using materialized view
    console.log('\n4️⃣ Test: Team stats (mv_team_stats)');
    const response4 = await fetch(`${baseURL}/api/matches/stats?type=team&teamSearch=Arsenal`);
    const data4 = await response4.json() as StatsAPIResponse;
    
    console.log(`✅ Team stats:`, {
      count: data4.count,
      source: data4.source,
      sample: data4.data?.slice(0, 3).map((d) => `${(d as Record<string, unknown>).team_name} (${(d as Record<string, unknown>).venue}): ${(d as Record<string, unknown>).total_matches} matches`)
    });

    console.log('\n🎉 All Stats API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Stats API Test failed:', error);
  }
}

testStatsAPI();