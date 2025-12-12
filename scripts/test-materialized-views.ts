/**
 * Test Materialized Views
 */
import { clickHouseClient } from '../lib/database/clickhouse/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testMaterializedViews() {
  console.log('🔍 Testing Materialized Views\n');
  
  try {
    await clickHouseClient.connect();
    console.log('✅ Connected to ClickHouse\n');
    
    // 1. Test mv_unique_leagues
    console.log('1️⃣ Testing mv_unique_leagues:');
    const leaguesResult = await clickHouseClient.getClient().query({
      query: 'SELECT league, match_count FROM mv_unique_leagues ORDER BY match_count DESC LIMIT 5',
      format: 'JSONEachRow',
    });
    const leaguesData = await leaguesResult.json() as Array<{ league: string; match_count: number }>;
    leaguesData.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.league} - ${row.match_count.toLocaleString()} maç`);
    });
    console.log('');
    
    // 2. Test mv_daily_stats
    console.log('2️⃣ Testing mv_daily_stats:');
    const statsResult = await clickHouseClient.getClient().query({
      query: `SELECT year, month, day, league, total_matches 
              FROM mv_daily_stats 
              WHERE year = '2024' 
              ORDER BY total_matches DESC 
              LIMIT 5`,
      format: 'JSONEachRow',
    });
    const statsData = await statsResult.json() as Array<{ year: string; month: string; day: string; league: string; total_matches: number }>;
    if (statsData.length > 0) {
      statsData.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.year}-${row.month}-${row.day} | ${row.league} - ${row.total_matches} maç`);
      });
    } else {
      console.log('   ⚠️  No data for 2024, checking all years...');
      const allStatsResult = await clickHouseClient.getClient().query({
        query: 'SELECT year, month, day, league, total_matches FROM mv_daily_stats ORDER BY total_matches DESC LIMIT 3',
        format: 'JSONEachRow',
      });
      const allStatsData = await allStatsResult.json() as Array<{ year: string; month: string; day: string; league: string; total_matches: number }>;
      allStatsData.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.year}-${row.month}-${row.day} | ${row.league} - ${row.total_matches} maç`);
      });
    }
    console.log('');
    
    // 3. Test mv_team_stats
    console.log('3️⃣ Testing mv_team_stats:');
    const teamResult = await clickHouseClient.getClient().query({
      query: 'SELECT team_name, venue, matches_played FROM mv_team_stats ORDER BY matches_played DESC LIMIT 5',
      format: 'JSONEachRow',
    });
    const teamData = await teamResult.json() as Array<{ team_name: string; venue: string; matches_played: number }>;
    teamData.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.team_name} (${row.venue}) - ${row.matches_played} maç`);
    });
    console.log('');
    
    console.log('✅ All materialized views are working!\n');
    
  } catch (error) {
    console.error('❌ Test başarısız:', error);
    throw error;
  } finally {
    await clickHouseClient.disconnect();
  }
}

testMaterializedViews();
