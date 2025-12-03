import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Favori lig sayısı - İlk yüklemede kaç lig gösterilecek
 */
const TOP_LEAGUES_COUNT = 20;

/**
 * GET /api/matches/leagues
 * Query params:
 * - search: string (lig adında arama yapar)
 * - favorites: 'true' (sadece favori ligleri döndürür)
 * Cache: 1 saat (çok nadiren değişir)
 * NOT: Bu endpoint herkes için açık (sadece lig isimleri)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const favoritesOnly = searchParams.get('favorites') === 'true';
  try {
    console.log(`🚀 Leagues endpoint çağrıldı (favorites: ${favoritesOnly}, search: "${search || 'yok'}")`);
    
    // ÖNEMLİ: Sadece favoriler isteniyorsa ve arama yoksa, en popüler ligleri getir
    if (favoritesOnly && !search) {
      console.log(`⚡ Top ${TOP_LEAGUES_COUNT} popüler lig getiriliyor...`);
      
      // Önce yeni RPC'yi dene
      const { data: topLeagues, error: topError } = await supabase.rpc('get_top_leagues', {
        limit_count: TOP_LEAGUES_COUNT
      });
      
      // Eğer RPC yoksa, eski yöntemle çek (tüm ligler + sırala + limit)
      if (topError) {
        console.warn('⚠️ get_top_leagues RPC bulunamadı, fallback yöntemi kullanılıyor...');
        const { data: allLeagues, error: allError } = await supabase.rpc('get_unique_leagues');
        
        if (allError) {
          throw allError;
        }
        
        // En çok maçı olan ligleri seç
        type LeagueCount = { league: string; match_count: number };
        const sortedLeagues = (allLeagues || [] as LeagueCount[])
          .sort((a: LeagueCount, b: LeagueCount) => b.match_count - a.match_count)
          .slice(0, TOP_LEAGUES_COUNT);
        
        console.log(`✅ ${sortedLeagues.length} popüler lig getirildi (fallback)`);
        
        return NextResponse.json({
          leagues: sortedLeagues,
          count: sortedLeagues.length,
          source: 'fallback_sorted'
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600' // 1 saat cache
          }
        });
      }
      
      console.log(`✅ ${topLeagues?.length || 0} popüler lig getirildi (RPC)`);
      
      return NextResponse.json({
        leagues: topLeagues || [],
        count: topLeagues?.length || 0,
        source: 'top_leagues_rpc'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600' // 1 saat cache
        }
      });
    }
    
    // Arama varsa özel search RPC'yi kullan (çok daha hızlı)
    if (search && search.trim()) {
      console.log(`🔍 Lig aranıyor: "${search}"...`);
      const { data: searchResults, error: searchError } = await supabase.rpc('search_leagues', {
        search_term: search.trim(),
        limit_count: 100 // Maksimum 100 sonuç
      });
      
      if (searchError) {
        console.warn('⚠️ search_leagues RPC bulunamadı, fallback kullanılıyor...');
        // Fallback: Tüm ligleri çek ve filtrele
        const { data: allLeagues, error: allError } = await supabase.rpc('get_unique_leagues');
        if (allError) throw allError;
        
        const filtered = (allLeagues || []).filter((l: { league: string }) =>
          l.league.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 100);
        
        return NextResponse.json({
          leagues: filtered,
          count: filtered.length,
          source: 'search_fallback'
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=300' // 5 dakika cache
          }
        });
      }
      
      console.log(`✅ ${searchResults?.length || 0} lig bulundu`);
      
      return NextResponse.json({
        leagues: searchResults || [],
        count: searchResults?.length || 0,
        source: 'search_rpc'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300' // 5 dakika cache
        }
      });
    }
    
    // Tüm ligler isteniyorsa (search yok, favorites yok)
    const rpcResult = await supabase.rpc('get_unique_leagues');
    const data = rpcResult.data;
    const error = rpcResult.error;
    
    // ÖNEMLI: Eğer tam 1000 kayıt dönerse, Supabase JS client limit uygulamış demektir
    // Bu durumda fallback stratejisine geç
    const hasLimitIssue = !error && data && data.length === 1000;
    
    if (hasLimitIssue) {
      console.warn('⚠️ RPC tam 1000 kayıt döndü - muhtemelen limit var, fallback\'e geçiliyor');
    }

    if (error || hasLimitIssue) {
      if (error) {
        console.error('❌ RPC get_unique_leagues hatası:', error);
      }
      
      // Fallback: RPC yoksa direkt query (daha yavaş ama çalışır)
      // Tüm sonuçları almak için batch processing
      let allLeagues: string[] = [];
      let page = 0;
      let hasMore = true;
      const batchSize = 1000;
      
      while (hasMore) {
        const { data: batchData, error: batchError } = await supabase
          .from('matches')
          .select('league')
          .range(page * batchSize, (page + 1) * batchSize - 1)
          .order('league', { ascending: true });
          
        if (batchError) {
          throw batchError;
        }
        
        if (!batchData || batchData.length === 0) {
          hasMore = false;
        } else {
          allLeagues = allLeagues.concat(batchData.map(d => d.league));
          if (batchData.length < batchSize) {
            hasMore = false;
          }
          page++;
        }
      }
      
      const fallbackData = allLeagues.map(league => ({ league }));

      // Unique yap ve match count hesapla
      const uniqueLeagues = [...new Set(fallbackData?.map(d => d.league) || [])];
      const leaguesWithCount = uniqueLeagues.map(league => ({
        league,
        match_count: fallbackData?.filter(d => d.league === league).length || 0
      }));

      return NextResponse.json({
        leagues: leaguesWithCount,
        count: uniqueLeagues.length,
        source: 'fallback'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
        }
      });
    }

    // Filtreleme yap
    let filteredLeagues = data || [];
    
    // Search parametresi varsa (favoritesOnly zaten yukarıda handle edildi)
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredLeagues = filteredLeagues.filter((l: { league: string; match_count: number }) => 
        l.league.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json({
      leagues: filteredLeagues,
      count: filteredLeagues.length,
      source: search ? 'search' : 'all_leagues'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });
  } catch (error) {
    console.error('❌ Leagues endpoint hatası:', error);
    return NextResponse.json(
      { error: 'Ligler yüklenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
