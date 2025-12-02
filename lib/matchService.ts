import { supabase } from '@/lib/supabase';
import { MatchData, MatchFilters, MatchesResponse, LeaguesResponse } from '@/types/database';

// Not: Tablo adını Supabase'deki gerçek tablo adınızla değiştirin
const TABLE_NAME = 'matches'; // ⚠️ Kendi tablo adınızı buraya yazın

// =============================================
// LocalStorage Cache (Browser-side - Persistent)
// =============================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 60 dakika (1 saat) - uzun süreli cache
const CACHE_PREFIX = 'analysis_cache_';

// localStorage kullanılabilir mi kontrol et
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function getCached<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const cacheKey = CACHE_PREFIX + key;
    const item = localStorage.getItem(cacheKey);
    if (!item) return null;
    
    const entry: CacheEntry<T> = JSON.parse(item);
    
    // Cache expire kontrolü
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      console.log(`🗑️ Cache expired: ${key}`);
      return null;
    }
    
    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const cacheKey = CACHE_PREFIX + key;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log(`💾 Cache saved: ${key}`);
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

function clearCache(): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ Tüm cache temizlendi');
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

// Cache temizleme fonksiyonunu export et
export { clearCache };

/**
 * Tüm ligleri getir (Batch processing ile - TÜM ligleri alır)
 */
export async function getLeagues(): Promise<LeaguesResponse> {
  try {
    // Cache kontrolü
    const cacheKey = 'all_leagues';
    const cached = getCached<string[]>(cacheKey);
    if (cached) {
      console.log('✅ Ligler cache\'den geldi');
      return { leagues: cached, count: cached.length };
    }

    const leagues = new Set<string>();
    const batchSize = 2000; // 2x daha hızlı
    let page = 0;
    let hasMore = true;

    console.log('🔄 Ligler yükleniyor (2x hızlı batch processing)...');

    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('league')
        .range(from, to)
        .limit(batchSize);

      if (error) throw error;

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      // Ligleri set'e ekle (otomatik unique)
      data.forEach((item: { league: string }) => {
        leagues.add(item.league);
      });

      console.log(`✓ Batch ${page + 1}: ${data.length} maç işlendi, toplam ${leagues.size} unique lig`);

      if (data.length < batchSize) {
        hasMore = false;
      }

      page++;

      // Güvenlik: Maksimum 500 batch (730k+ veri için yeterli)
      if (page >= 500) {
        console.warn('⚠️ Maksimum batch limitine ulaşıldı');
        break;
      }
    }

    const result = Array.from(leagues).sort();
    console.log(`✅ Toplam ${leagues.size} unique lig bulundu (${page} batch)`);
    
    // Cache'e kaydet
    setCache('all_leagues', result);

    return {
      leagues: result,
      count: result.length,
    };
  } catch (error) {
    console.error('Ligler alınamadı:', error);
    return { leagues: [], count: 0 };
  }
}

/**
 * Filtrelenmiş maçları getir
 */
export async function getMatches(
  filters: MatchFilters = {},
  page: number = 1,
  pageSize: number = 50
): Promise<MatchesResponse> {
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

    // Ev sahibi takım filtresi
    if (filters.homeTeam) {
      query = query.ilike('home_team', `%${filters.homeTeam}%`);
    }

    // Deplasman takım filtresi
    if (filters.awayTeam) {
      query = query.ilike('away_team', `%${filters.awayTeam}%`);
    }

    // Takım arama (eski - backward compatibility)
    if (filters.teamSearch) {
      query = query.or(
        `home_team.ilike.%${filters.teamSearch}%,away_team.ilike.%${filters.teamSearch}%`
      );
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Sıralama
    query = query.order('match_date', { ascending: false });

    const { data, error, count } = await query;

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

    console.log(`✅ ${count || 0} maç bulundu (${page}/${Math.ceil((count || 0) / pageSize)} sayfa)`);

    return {
      data: (data || []) as MatchData[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (error) {
    console.error('❌ Maçlar alınamadı:', error);
    
    // Error'u yukarı fırlat ki kullanıcı görebilsin
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Maçlar yüklenirken bilinmeyen bir hata oluştu');
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
 * Tüm unique takımları getir (Batch processing ile)
 * 713k veriyi 1000'er parça halinde işler
 */
export async function getAllTeams(): Promise<string[]> {
  try {
    // Cache kontrolü
    const cacheKey = 'all_teams';
    const cached = getCached<string[]>(cacheKey);
    if (cached) {
      console.log('✅ Takımlar cache\'den geldi');
      return cached;
    }

    const teams = new Set<string>();
    const batchSize = 2000; // 2x daha hızlı
    let page = 0;
    let hasMore = true;

    console.log('🔄 Takımlar yükleniyor (2x hızlı batch processing)...');

    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('home_team, away_team')
        .range(from, to)
        .limit(batchSize);

      if (error) throw error;

      // Veri yoksa veya batch size'dan azsa son batch
      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      // Takımları set'e ekle
      data.forEach((match: { home_team: string; away_team: string }) => {
        teams.add(match.home_team);
        teams.add(match.away_team);
      });

      console.log(`✓ Batch ${page + 1}: ${data.length} maç işlendi, toplam ${teams.size} unique takım`);

      // Son batch'e ulaştıysak dur
      if (data.length < batchSize) {
        hasMore = false;
      }

      page++;

      // Güvenlik: Maksimum 500 batch (730k+ veri için yeterli)
      if (page >= 500) {
        console.warn('⚠️ Maksimum batch limitine ulaşıldı');
        break;
      }
    }

    const result = Array.from(teams).sort();
    console.log(`✅ Toplam ${teams.size} unique takım bulundu (${page} batch)`);
    
    // Cache'e kaydet
    setCache('all_teams', result);
    
    return result;
  } catch (error) {
    console.error('Takımlar alınamadı:', error);
    return [];
  }
}

// getTeamsByLeagues fonksiyonu kaldırıldı - artık tüm takımlar direkt kullanılıyor (performans optimizasyonu)

/**
 * Lig başına maç sayılarını getir (Batch processing ile)
 * 713k veriyi 1000'er parça halinde işler
 */
export async function getLeagueMatchCounts(): Promise<Record<string, number>> {
  try {
    // Cache kontrolü
    const cacheKey = 'league_match_counts';
    const cached = getCached<Record<string, number>>(cacheKey);
    if (cached) {
      console.log('✅ Lig sayıları cache\'den geldi');
      return cached;
    }

    const counts: Record<string, number> = {};
    const batchSize = 2000; // 2x daha hızlı
    let page = 0;
    let hasMore = true;
    let totalProcessed = 0;

    console.log('🔄 Lig sayıları hesaplanıyor (2x hızlı batch processing)...');

    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('league')
        .range(from, to)
        .limit(batchSize);

      if (error) throw error;

      // Veri yoksa veya batch size'dan azsa son batch
      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      // Sayımları güncelle
      data.forEach((item: { league: string }) => {
        counts[item.league] = (counts[item.league] || 0) + 1;
      });

      totalProcessed += data.length;
      console.log(`✓ Batch ${page + 1}: ${data.length} maç işlendi, toplam ${totalProcessed} maç`);

      // Son batch'e ulaştıysak dur
      if (data.length < batchSize) {
        hasMore = false;
      }

      page++;

      // Güvenlik: Maksimum 500 batch (730k+ veri için yeterli)
      if (page >= 500) {
        console.warn('⚠️ Maksimum batch limitine ulaşıldı');
        break;
      }
    }

    console.log(`✅ Toplam ${Object.keys(counts).length} lig bulundu, ${totalProcessed} maç işlendi (${page} batch)`);
    
    // Cache'e kaydet
    setCache('league_match_counts', counts);
    
    return counts;
  } catch (error) {
    console.error('Lig sayıları alınamadı:', error);
    return {};
  }
}

/**
 * İstatistikler getir (Optimize edilmiş - TEK query ile hesapla)
 * 4 ayrı COUNT query yerine sadece gerekli alanları çekip client-side hesapla
 */
export async function getMatchStatistics(filters: MatchFilters = {}) {
  try {
    // Cache key oluştur
    const cacheKey = `stats_${JSON.stringify(filters)}`;
    const cached = getCached<{
      totalMatches: number;
      over15: { count: number; percentage: string };
      over25: { count: number; percentage: string };
      btts: { count: number; percentage: string };
    }>(cacheKey);
    if (cached) {
      console.log('✅ İstatistikler cache\'den geldi');
      return cached;
    }

    console.log('🔄 İstatistikler hesaplanıyor...');

    // TEK query ile sadece gerekli alanları çek
    let query = supabase
      .from(TABLE_NAME)
      .select('ft_over_15, ft_over_25, btts', { count: 'exact' });

    // Filtreler
    if (filters.league && filters.league.length > 0) {
      // Tek lig ise eq, birden fazla lig ise in kullan
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
    if (filters.teamSearch) {
      query = query.or(
        `home_team.ilike.%${filters.teamSearch}%,away_team.ilike.%${filters.teamSearch}%`
      );
    }

    // Limit ekle - maksimum 10000 satır (timeout önleme)
    query = query.limit(10000);

    const { data, count, error } = await query;
    
    if (error) {
      console.error('❌ İstatistik Supabase Hatası:', {
        message: error.message,
        details: error.details,
        filters: filters,
      });
      throw error;
    }

    // Client-side hesaplama (çok hızlı)
    const totalMatches = count || 0;
    let over15Count = 0;
    let over25Count = 0;
    let bttsCount = 0;

    if (data && data.length > 0) {
      data.forEach((match: { ft_over_15: number; ft_over_25: number; btts: number }) => {
        if (match.ft_over_15 === 1) over15Count++;
        if (match.ft_over_25 === 1) over25Count++;
        if (match.btts === 1) bttsCount++;
      });
    }

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

    // Cache'e kaydet (1 dakika - daha kısa süre)
    setCache(cacheKey, result);
    
    console.log(`✅ İstatistikler hesaplandı: ${totalMatches} maç`);
    return result;
  } catch (error) {
    console.error('İstatistikler alınamadı:', error);
    return null;
  }
}
