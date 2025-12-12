import 'dotenv/config';

// Interfaces for API responses
interface MatchAPIResponse {
  totalMatches: number;
  count: number;
  hasData: boolean;
  data?: Array<{
    home_team: string;
    away_team: string;
    league: string;
    year: string;
  }>;
}

/**
 * Test refactored matches API endpoint
 */
async function testMatchesAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing refactored /api/matches endpoint with ClickHouse');
  
  try {
    // Test 1: Basic query with league filter
    console.log('\n1️⃣ Test: Premier League matches (limit 2)');
    const response1 = await fetch(`${baseURL}/api/matches?leagues=England: Premier League&limit=2`);
    
    if (!response1.ok) {
      console.error(`❌ HTTP Error: ${response1.status}`);
      const errorText = await response1.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data1 = await response1.json() as MatchAPIResponse;
    console.log(`✅ Response:`, {
      totalMatches: data1.totalMatches,
      returnedCount: data1.count,
      hasData: data1.data && data1.data.length > 0,
      firstMatch: data1.data && data1.data[0] ? {
        homeTeam: data1.data[0].home_team,
        awayTeam: data1.data[0].away_team,
        league: data1.data[0].league,
        year: data1.data[0].year
      } : null
    });

    // Test 2: Multiple leagues
    console.log('\n2️⃣ Test: Multiple leagues (limit 3)');
    const response2 = await fetch(`${baseURL}/api/matches?leagues=England: Premier League,Spain: La Liga&limit=3`);
    const data2 = await response2.json() as MatchAPIResponse;
    
    console.log(`✅ Multi-league response:`, {
      totalMatches: data2.totalMatches,
      returnedCount: data2.count,
      uniqueLeagues: [...new Set(data2.data?.map((m) => m.league) || [])]
    });

    // Test 3: Team search
    console.log('\n3️⃣ Test: Team search (Arsenal)');
    const response3 = await fetch(`${baseURL}/api/matches?teamSearch=Arsenal&limit=2`);
    const data3 = await response3.json() as MatchAPIResponse;
    
    console.log(`✅ Team search response:`, {
      totalMatches: data3.totalMatches,
      returnedCount: data3.count,
      teams: data3.data?.map((m) => `${m.home_team} vs ${m.away_team}`) || []
    });

    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

testMatchesAPI();