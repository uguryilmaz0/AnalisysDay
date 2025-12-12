/**
 * Test ClickHouse'daki mevcut matches tablosunu
 */
import { clickHouseClient } from '../lib/database/clickhouse/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testExistingTable() {
  console.log('🔍 Testing existing ClickHouse matches table\n');
  
  try {
    // Connect first
    await clickHouseClient.connect();
    console.log('✅ Connected to ClickHouse\n');
    
    // 1. Toplam kayıt sayısı
    console.log('1️⃣ Toplam kayıt sayısı:');
    const countResult = await clickHouseClient.getClient().query({
      query: 'SELECT count() as total FROM matches',
      format: 'JSONEachRow',
    });
    const countData = await countResult.json() as Array<{ total: number }>;
    console.log(`   ✅ Total records: ${countData[0].total.toLocaleString()}\n`);
    
    // 2. Tablo yapısı
    console.log('2️⃣ Tablo yapısı (ilk 10 sütun):');
    const descResult = await clickHouseClient.getClient().query({
      query: 'DESCRIBE TABLE matches',
      format: 'JSONEachRow',
    });
    const descData = await descResult.json() as Array<{ name: string; type: string }>;
    descData.slice(0, 10).forEach((col, i) => {
      console.log(`   ${i + 1}. ${col.name} (${col.type})`);
    });
    console.log(`   ... toplam ${descData.length} sütun\n`);
    
    // 3. Örnek veri (ilk 3 kayıt)
    console.log('3️⃣ Örnek veriler (ilk 3 kayıt):');
    const sampleResult = await clickHouseClient.getClient().query({
      query: 'SELECT home_team, away_team, league, year, month, day, ft_score, ht_score FROM matches LIMIT 3',
      format: 'JSONEachRow',
    });
    interface SampleRow {
      home_team: string;
      away_team: string;
      league: string;
      year: string;
      month: string;
      day: string;
      ft_score: string;
      ht_score: string;
    }
    const sampleData = await sampleResult.json() as SampleRow[];
    sampleData.forEach((row, i: number) => {
      console.log(`   ${i + 1}. ${row.home_team} vs ${row.away_team}`);
      console.log(`      League: ${row.league}`);
      console.log(`      Date: ${row.year}-${row.month}-${row.day}`);
      console.log(`      Score: HT ${row.ht_score}, FT ${row.ft_score}\n`);
    });
    
    // 4. Ligler
    console.log('4️⃣ Unique ligler (ilk 10):');
    const leagueResult = await clickHouseClient.getClient().query({
      query: 'SELECT league, count() as count FROM matches GROUP BY league ORDER BY count DESC LIMIT 10',
      format: 'JSONEachRow',
    });
    const leagueData = await leagueResult.json() as Array<{ league: string; count: number }>;
    leagueData.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.league} (${row.count.toLocaleString()} maç)`);
    });
    console.log('');
    
    // 5. Tarih aralığı
    console.log('5️⃣ Veri tarih aralığı:');
    const dateResult = await clickHouseClient.getClient().query({
      query: 'SELECT min(year) as min_year, max(year) as max_year, min(month) as min_month, max(month) as max_month FROM matches',
      format: 'JSONEachRow',
    });
    interface DateRange {
      min_year: string;
      max_year: string;
      min_month: string;
      max_month: string;
    }
    const dateData = await dateResult.json() as DateRange[];
    console.log(`   ✅ Yıl aralığı: ${dateData[0].min_year} - ${dateData[0].max_year}`);
    console.log(`   ✅ Ay aralığı: ${dateData[0].min_month} - ${dateData[0].max_month}\n`);
    
    console.log('✅ Mevcut tablo başarıyla test edildi!\n');
    
  } catch (error) {
    console.error('❌ Test başarısız:', error);
    throw error;
  } finally {
    await clickHouseClient.disconnect();
  }
}

testExistingTable();
