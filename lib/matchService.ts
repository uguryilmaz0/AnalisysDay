import { supabase } from '@/lib/supabase';
import { MatchData, MatchFilters, MatchesResponse, LeaguesResponse } from '@/types/database';

// Not: Tablo adını Supabase'deki gerçek tablo adınızla değiştirin
const TABLE_NAME = 'matches'; // ⚠️ Kendi tablo adınızı buraya yazın

// =============================================
// CACHE KALDIRILDI - Direkt API Çağrıları
// =============================================
// Artık localStorage/sessionStorage kullanılmıyor
// HTTP cache headers (API level) ile caching yapılıyor
// =============================================

/**
 * @deprecated Cache functions - artık kullanılmıyor
 */
function setCache<T>(key: string, data: T): void {
  // Cache kullanımı kaldırıldı
}

/**
 * @deprecated Cache functions - artık kullanılmıyor
 */
function getCached<T>(key: string): T | null {
  return null;
}

/**
 * @deprecated Cache functions - artık kullanılmıyor
 */
function getSessionCached<T>(key: string): T | null {
  return null;
}

/**
 * @deprecated Cache functions - artık kullanılmıyor
 */
function setSessionCache<T>(key: string, data: T): void {
  // Cache kullanımı kaldırıldı
}

/**
 * @deprecated Cache kullanımı kaldırıldı - artık gerekli değil
 * Geriye uyumluluk için bırakıldı
 */
export function clearCache(): void {
  console.warn('⚠️ clearCache() deprecated - cache kullanımı kaldırıldı');
}

/**
 * Tüm ligleri getir (API endpoint kullanarak - HIZLI)
 * @param options.search - Lig adında arama yapar
 * @param options.favoritesOnly - Sadece favori ligleri getirir (default: true)
 */
export async function getLeagues(options?: { 
  search?: string; 
  favoritesOnly?: boolean 
}): Promise<LeaguesResponse> {
  try {
    const { search, favoritesOnly = true } = options || {};
    
    // Query params oluştur
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (favoritesOnly) params.append('favorites', 'true');
    
    // API endpoint'ten çek (RPC function kullanıyor - çok hızlı)
    console.log(`🚀 API'den ligler çekiliyor... (favorites: ${favoritesOnly}, search: "${search || 'yok'}")`);
    
    // Client-side: relative URL, Server-side: absolute URL
    const apiUrl = typeof window === 'undefined' 
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/matches/leagues?${params}`
      : `/api/matches/leagues?${params}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch leagues');
    }
    
    const data = await response.json();
    
    console.log(`✅ ${data.count} lig API'den geldi (${data.source})`);
    console.log(`📊 İlk 5 lig:`, data.leagues.slice(0, 5).map((l: { league: string }) => l.league));
    console.log(`📊 Son 5 lig:`, data.leagues.slice(-5).map((l: { league: string }) => l.league));
    
    return { 
      leagues: data.leagues.map((l: { league: string }) => l.league),
      count: data.count 
    };
  } catch (error) {
    console.error('❌ Ligler API\'den alınamadı, fallback\'e geçiliyor:', error);
    
    // Fallback: Direkt Supabase (RPC)
    try {
      const { data, error } = await supabase.rpc('get_unique_leagues');
      if (error) throw error;
      
      const leagues = data?.map((d: { league: string }) => d.league) || [];
      
      return { leagues, count: leagues.length };
    } catch (fallbackError) {
      console.error('❌ Fallback da başarısız:', fallbackError);
      return { leagues: [], count: 0 };
    }
  }
}

// Batch processing fonksiyonları kaldırıldı - artık API endpoint kullanılıyor
// getLeaguesFallback() - REMOVED (artık gerekli değil)

/**
 * Filtrelenmiş maçları getir (API endpoint kullanarak)
 */
export async function getMatches(
  filters: MatchFilters = {},
  page: number = 1,
  pageSize: number = 50
): Promise<MatchesResponse> {
  try {
    // API endpoint kullan (optimize edilmiş)
    console.log('🚀 API\'den maçlar çekiliyor...', { filters, page, pageSize });
    
    const params = new URLSearchParams();
    if (filters.league && filters.league.length > 0) {
      params.append('leagues', filters.league.join(','));
    }
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.homeTeam) params.append('homeTeam', filters.homeTeam);
    if (filters.awayTeam) params.append('awayTeam', filters.awayTeam);
    params.append('page', page.toString());
    params.append('limit', pageSize.toString());

    // Client-side: relative URL, Server-side: absolute URL
    const apiUrl = typeof window === 'undefined'
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/matches`
      : '/api/matches';

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }
    
    const data = await response.json();
    
    const result: MatchesResponse = {
      data: data.data || [],
      count: data.count || 0,
      page: data.page || page,
      pageSize: data.limit || pageSize,
      totalPages: data.totalPages || 1,
      hasMore: data.hasMore || false
    };
    
    console.log('✅ API\'den', result.count, 'maç geldi');
    
    return result;
  } catch (error) {
    console.error('❌ Maçlar API\'den alınamadı, fallback\'e geçiliyor:', error);
    
    // Fallback: Direkt Supabase sorgusu
    try {
      let query = supabase.from(TABLE_NAME).select('*', { count: 'exact' });

    // Lig filtresi - Özel karakterleri handle et
    if (filters.league && filters.league.length > 0) {
      console.log('🔍 Lig filtresi uygulanıyor:', filters.league);
      
      // Tek lig ise eq, birden fazla lig ise in kullan
      if (filters.league.length === 1) {
        query = query.eq('league', filters.league[0]);
      } else {
        // Supabase'in in() metodu array içindeki her elementi doğru escape eder
        query = query.in('league', filters.league);
      }
      
      console.log('✅ Lig filtresi uygulandı');
    }

    // Tarih filtresi
    if (filters.dateFrom) {
      query = query.gte('match_date', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('match_date', filters.dateTo);
    }

    // Saat filtresi
    if (filters.timeFrom) {
      query = query.gte('time', filters.timeFrom);
    }
    if (filters.timeTo) {
      query = query.lte('time', filters.timeTo);
    }

    // Takım filtreleri
    // ÖZEL DURUM: Hem homeTeam HEM awayTeam varsa, sadece bu iki takım arasındaki maçlar
    const homeTeamTrim = filters.homeTeam?.trim();
    const awayTeamTrim = filters.awayTeam?.trim();
    
    if (homeTeamTrim && awayTeamTrim && homeTeamTrim.length > 0 && awayTeamTrim.length > 0) {
      // İKİ TAKIMIN BİRBİRİNE KARŞI OYNADIĞI MAÇLAR
      console.log(`🎯 İki takım filtresi: "${homeTeamTrim}" vs "${awayTeamTrim}"`);
      // (Team A ev sahibi ve Team B deplasman) VEYA (Team B ev sahibi ve Team A deplasman)
      query = query.or(
        `and(home_team.eq.${homeTeamTrim},away_team.eq.${awayTeamTrim}),and(home_team.eq.${awayTeamTrim},away_team.eq.${homeTeamTrim})`
      );
    } else {
      // NORMAL DURUM: Tek takım veya genel arama
      const teamConditions: string[] = [];
      
      if (homeTeamTrim && homeTeamTrim.length > 0) {
        // Ev sahibi takım filtresi
        teamConditions.push(`home_team.eq.${homeTeamTrim}`);
        teamConditions.push(`home_team.ilike.${homeTeamTrim}%`);
      }

      if (awayTeamTrim && awayTeamTrim.length > 0) {
        // Deplasman takım filtresi
        teamConditions.push(`away_team.eq.${awayTeamTrim}`);
        teamConditions.push(`away_team.ilike.${awayTeamTrim}%`);
      }

      if (filters.teamSearch) {
        const searchTerm = filters.teamSearch.trim();
        if (searchTerm.length > 0) {
          // Her iki takımda da ara
          teamConditions.push(`home_team.ilike.${searchTerm}%`);
          teamConditions.push(`away_team.ilike.${searchTerm}%`);
        }
      }
      
      // Tek bir or() ile tüm koşulları uygula
      if (teamConditions.length > 0) {
        query = query.or(teamConditions.join(','));
      }
    }

    // Sıralama (Index kullanımı: idx_matches_match_date)
    query = query.order('match_date', { ascending: false });
    
    // Pagination - Supabase default limit 1000, ama biz 5000 istiyoruz
    // ÇÖZÜM: Offset + limit kullan (range yerine)
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    // COUNT query'yi kaldır - timeout oluyor (730K kayıt için)
    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase Query Hatası:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        filters: filters,
      });
      throw new Error(`Veritabanı hatası: ${error.message}`);
    }

    const actualCount = data?.length || 0;
    const hasMore = actualCount === pageSize; // Eğer tam pageSize dönüyorsa daha fazla var
    
    console.log('📊 getMatches Sonuç:', {
      page,
      pageSize,
      actualCount,
      hasMore,
      offset,
      rangeEnd: offset + pageSize - 1,
      comparison: `${actualCount} === ${pageSize} = ${hasMore}`,
    });

    const response: MatchesResponse = {
      data: (data || []) as MatchData[],
      count: actualCount,
      page,
      pageSize,
      totalPages: hasMore ? page + 1 : page,
      hasMore,
    };

      // SessionStorage'a kaydet (sayfa yenilenince tekrar çekmesin)
      setSessionCache(cacheKey, response);

      return response;
    } catch (fallbackError) {
      console.error('❌ Fallback da başarısız:', fallbackError);
      throw new Error('Maçlar yüklenemedi');
    }
  }
}

/**
 * Tek bir maç getir
 */
export async function getMatchById(id: number): Promise<MatchData | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data as MatchData;
  } catch (error) {
    console.error('Maç bulunamadı:', error);
    return null;
  }
}

/**
 * @deprecated ARTIK KULLANILMIYOR - Lazy loading ile değiştirildi
 * Tüm unique takımları getir
 * Not: Bu fonksiyon performans sorunları nedeniyle kaldırılmıştır.
 * Takımlar artık filtrelenmiş maçlardan otomatik çıkarılır.
 */
export async function getAllTeams(): Promise<string[]> {
  console.warn('⚠️ getAllTeams() deprecated - artık kullanılmamalı');
  return [];
}

// getAllTeamsFallback() - REMOVED (deprecated)
// getTeamsByLeagues() - REMOVED (deprecated)

/**
 * @deprecated ARTIK KULLANILMIYOR - Lazy loading ile değiştirildi
 * Lig başına maç sayılarını getir
 * Not: Bu bilgi artık getLeagues() içinde gelir (RPC function)
 */
export async function getLeagueMatchCounts(): Promise<Record<string, number>> {
  console.warn('⚠️ getLeagueMatchCounts() deprecated - getLeagues() kullanın');
  return {};
}

// getLeagueMatchCountsFallback() - REMOVED (deprecated)

/**
 * İstatistikler getir (API endpoint kullanarak - RPC function ile hızlı)
 */
export async function getMatchStatistics(filters: MatchFilters = {}) {
  try {
    // API endpoint kullan (RPC function ile optimize edilmiş)
    console.log('🚀 API\'den istatistikler çekiliyor...');
    
    const params = new URLSearchParams();
    if (filters.league && filters.league.length > 0) {
      params.append('leagues', filters.league.join(','));
    }
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    // Client-side: relative URL, Server-side: absolute URL
    const apiUrl = typeof window === 'undefined'
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/matches/stats`
      : '/api/matches/stats';

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    const data = await response.json();
    
    const result = {
      totalMatches: data.totalMatches,
      over15: data.over15,
      over25: data.over25,
      btts: data.btts
    };
    
    console.log(`✅ İstatistikler API'den geldi (${data.source}):`, result.totalMatches, 'maç');
    
    return result;
  } catch (error) {
    console.error('❌ İstatistikler API\'den alınamadı, fallback\'e geçiliyor:', error);
    
    // Fallback: Batch processing
    try {
      console.log('🔄 Fallback: Batch processing başlatıldı...');
      let allMatches: Array<{ ft_over_15: number; ft_over_25: number; btts: number }> = [];
      let page = 0;
      const batchSize = 1000;
      let hasMoreData = true;

    while (hasMoreData) {
      let query = supabase
        .from(TABLE_NAME)
        .select('ft_over_15, ft_over_25, btts');

      // Filtreler
      if (filters.league && filters.league.length > 0) {
        if (filters.league.length === 1) {
          query = query.eq('league', filters.league[0]);
        } else {
          query = query.in('league', filters.league);
        }
      }
      if (filters.dateFrom) {
        query = query.gte('match_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('match_date', filters.dateTo);
      }
      
      // Takım filtreleri
      const homeTeamTrim = filters.homeTeam?.trim();
      const awayTeamTrim = filters.awayTeam?.trim();
      
      if (homeTeamTrim && awayTeamTrim && homeTeamTrim.length > 0 && awayTeamTrim.length > 0) {
        query = query.or(
          `and(home_team.eq.${homeTeamTrim},away_team.eq.${awayTeamTrim}),and(home_team.eq.${awayTeamTrim},away_team.eq.${homeTeamTrim})`
        );
      } else {
        const teamConditions: string[] = [];
        
        if (homeTeamTrim && homeTeamTrim.length > 0) {
          teamConditions.push(`home_team.eq.${homeTeamTrim}`);
          teamConditions.push(`home_team.ilike.${homeTeamTrim}%`);
        }
        
        if (awayTeamTrim && awayTeamTrim.length > 0) {
          teamConditions.push(`away_team.eq.${awayTeamTrim}`);
          teamConditions.push(`away_team.ilike.${awayTeamTrim}%`);
        }
        
        if (filters.teamSearch) {
          const searchTerm = filters.teamSearch.trim();
          if (searchTerm.length > 0) {
            teamConditions.push(`home_team.ilike.${searchTerm}%`);
            teamConditions.push(`away_team.ilike.${searchTerm}%`);
          }
        }
        
        if (teamConditions.length > 0) {
          query = query.or(teamConditions.join(','));
        }
      }

      // Sıralama ekle (Index kullanımı için)
      query = query.order('match_date', { ascending: false });

      // Pagination - FİLTRELER UYGULANDIKTAN SONRA
      const from = page * batchSize;
      const to = from + batchSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ İstatistik Batch Hatası:', error.message);
        break;
      }

      if (!data || data.length === 0) {
        hasMoreData = false;
        break;
      }

      allMatches = allMatches.concat(data);
      
      // Son batch ise dur
      if (data.length < batchSize) {
        hasMoreData = false;
      }

      page++;

      // Güvenlik: Max 1000 batch
      if (page >= 1000) {
        console.warn('⚠️ Maksimum batch limitine ulaşıldı (istatistikler)');
        break;
      }
    }

    // Client-side hesaplama
    const totalMatches = allMatches.length;
    let over15Count = 0;
    let over25Count = 0;
    let bttsCount = 0;

    allMatches.forEach((match) => {
      // Supabase'den gelen veri string, number veya boolean olabilir
      // Number() dönüşümü: "1" -> 1, 1 -> 1, true -> 1, "0" -> 0, false -> 0, null -> 0
      const over15 = Number(match.ft_over_15);
      const over25 = Number(match.ft_over_25);
      const btts = Number(match.btts);
      
      if (over15 === 1) over15Count++;
      if (over25 === 1) over25Count++;
      if (btts === 1) bttsCount++;
    });

    console.log('📊 İstatistik hesaplama:', {
      totalMatches,
      over15Count,
      over25Count,
      bttsCount,
      örnekVeri: allMatches[0] ? {
        ft_over_15: allMatches[0].ft_over_15,
        ft_over_15_type: typeof allMatches[0].ft_over_15,
        ft_over_25: allMatches[0].ft_over_25,
        btts: allMatches[0].btts,
      } : 'Veri yok'
    });

    const result = {
      totalMatches,
      over15: {
        count: over15Count,
        percentage: totalMatches > 0 ? ((over15Count / totalMatches) * 100).toFixed(2) : '0',
      },
      over25: {
        count: over25Count,
        percentage: totalMatches > 0 ? ((over25Count / totalMatches) * 100).toFixed(2) : '0',
      },
      btts: {
        count: bttsCount,
        percentage: totalMatches > 0 ? ((bttsCount / totalMatches) * 100).toFixed(2) : '0',
      },
    };

      // Cache'e kaydet
      setCache(cacheKey, result);
      
      console.log(`✅ İstatistikler hesaplandı: ${totalMatches} maç`);
      return result;
    } catch (fallbackError) {
      console.error('❌ Fallback da başarısız:', fallbackError);
      return null;
    }
  }
}

/**
 * @deprecated Cache kullanımı kaldırıldı - artık direkt API çağrısı yapılıyor
 * Eski preload fonksiyonu - geriye uyumluluk için bırakıldı
 */
export async function preloadAnalysisCache(): Promise<void> {
  console.log('ℹ️ preloadAnalysisCache() deprecated - cache kullanımı kaldırıldı');
  // Artık hiçbir şey yapmıyor - direkt API çağrıları kullanılıyor
}
