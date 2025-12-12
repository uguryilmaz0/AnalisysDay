import 'dotenv/config';

// Interfaces for API responses
interface LeagueAPIResponse {
  count: number;
  source: string;
  leagues?: Array<{ league: string; match_count: number }>;
}

/**
 * Test refactored leagues API endpoint
 */
async function testLeaguesAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing refactored /api/matches/leagues endpoint with ClickHouse');
  
  try {
    // Test 1: Top favorites 
    console.log('\n1️⃣ Test: Top favorite leagues (limit 5)');
    const response1 = await fetch(`${baseURL}/api/matches/leagues?favorites=true&limit=5`);
    
    if (!response1.ok) {
      console.error(`❌ HTTP Error: ${response1.status}`);
      const errorText = await response1.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data1 = await response1.json() as LeagueAPIResponse;
    console.log(`✅ Response:`, {
      count: data1.count,
      source: data1.source,
      topLeagues: data1.leagues?.slice(0, 5).map((l) => `${l.league} (${l.match_count} matches)`)
    });

    // Test 2: Search for Premier League
    console.log('\n2️⃣ Test: Search for "Premier"');
    const response2 = await fetch(`${baseURL}/api/matches/leagues?search=Premier`);
    const data2 = await response2.json() as LeagueAPIResponse;
    
    console.log(`✅ Search response:`, {
      count: data2.count,
      source: data2.source,
      results: data2.leagues?.map((l) => `${l.league} (${l.match_count} matches)`)
    });

    // Test 3: All leagues (limited to first 3)
    console.log('\n3️⃣ Test: All leagues (first 3)');
    const response3 = await fetch(`${baseURL}/api/matches/leagues`);
    const data3 = await response3.json() as LeagueAPIResponse;
    
    console.log(`✅ All leagues response:`, {
      totalCount: data3.count,
      source: data3.source,
      first3: data3.leagues?.slice(0, 3).map((l) => `${l.league} (${l.match_count} matches)`)
    });

    console.log('\n🎉 All Leagues API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Leagues API Test failed:', error);
  }
}

testLeaguesAPI();