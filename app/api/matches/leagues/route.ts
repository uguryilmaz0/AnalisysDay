import { NextResponse } from 'next/server';
import { MatchRepository } from '@/lib/database/clickhouse/repositories/MatchRepository';

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
 * Uses: mv_unique_leagues materialized view for 100x performance
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const favoritesOnly = searchParams.get('favorites') === 'true';
  
  try {
    console.log(`🚀 ClickHouse Leagues endpoint çağrıldı (favorites: ${favoritesOnly}, search: "${search || 'yok'}")`);
    
    const matchRepo = new MatchRepository();
    
    // ÖNEMLİ: Sadece favoriler isteniyorsa ve arama yoksa, en popüler ligleri getir
    if (favoritesOnly && !search) {
      console.log(`⚡ Top ${TOP_LEAGUES_COUNT} popüler lig getiriliyor (mv_unique_leagues)...`);
      
      const topLeagues = await matchRepo.getTopLeagues(TOP_LEAGUES_COUNT);
      
      console.log(`✅ ${topLeagues.length} popüler lig getirildi (ClickHouse materialized view)`);
      
      return NextResponse.json({
        leagues: topLeagues,
        count: topLeagues.length,
        source: 'clickhouse_mv_unique_leagues'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600' // 1 saat cache
        }
      });
    }
    
    // Arama varsa search methodu kullan (materialized view ile hızlı)
    if (search && search.trim()) {
      console.log(`🔍 ClickHouse'da lig aranıyor: "${search}"...`);
      
      const searchResults = await matchRepo.searchLeagues(search.trim());
      
      console.log(`✅ ${searchResults.length} lig bulundu (ClickHouse search)`);
      
      return NextResponse.json({
        leagues: searchResults,
        count: searchResults.length,
        source: 'clickhouse_search'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300' // 5 dakika cache
        }
      });
    }
    
    // Varsayılan: Tüm ligleri getir (materialized view)
    console.log('📋 Tüm ligler getiriliyor (ClickHouse mv_unique_leagues)...');
    
    const allLeagues = await matchRepo.getUniqueLeagues();
    
    console.log(`✅ ${allLeagues.length} toplam lig getirildi`);
    
    return NextResponse.json({
      leagues: allLeagues,
      count: allLeagues.length,
      source: 'clickhouse_all_leagues'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600' // 1 saat cache
      }
    });
  } catch (error) {
    console.error('❌ ClickHouse Leagues endpoint hatası:', error);
    return NextResponse.json(
      { 
        error: 'Ligler yüklenemedi', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}