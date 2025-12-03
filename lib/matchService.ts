import { supabase } from '@/lib/supabase';
import { MatchData, MatchFilters, MatchesResponse, LeaguesResponse } from '@/types/database';

// Not: Tablo adını Supabase'deki gerçek tablo adınızla değiştirin
const TABLE_NAME = 'matches'; // ⚠️ Kendi tablo adınızı buraya yazın

// =============================================
// LocalStorage Cache (Browser-side - Persistent)
// =============================================

// 🔄 CACHE VERSION: Tablo yapısı değişince bu sayıyı artırın!
// Değiştiğinde eski cache otomatik temizlenir
const CACHE_VERSION = 4; // Production ready - 727K kayıt optimizasyonu (03.12.2025)
const CACHE_VERSION_KEY = 'analysis_cache_version';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 60 dakika (1 saat) - uzun süreli cache
const CACHE_PREFIX = 'analysis_cache_';

// SessionStorage for matches (tab kapanana kadar kalacak, sayfa yenilenince kalmaya devam edecek)
const SESSION_CACHE_PREFIX = 'session_match_';
const SESSION_CACHE_DURATION = 30 * 60 * 1000; // 30 dakika

function getSessionCached<T>(key: string): T | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  
  try {
    const cacheKey = SESSION_CACHE_PREFIX + key;
    const item = sessionStorage.getItem(cacheKey);
    if (!item) return null;
    
    const entry: CacheEntry<T> = JSON.parse(item);
    
    // Version kontrolü
    if (entry.version !== CACHE_VERSION) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    
    // Expire kontrolü
    if (Date.now() - entry.timestamp > SESSION_CACHE_DURATION) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

function setSessionCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  
  try {
    const cacheKey = SESSION_CACHE_PREFIX + key;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    // SessionStorage dolu olabilir, eski cache'leri temizle
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(SESSION_CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }
}

// Cache version kontrolü - sayfa yüklendiğinde
function checkCacheVersion(): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    const currentVersion = CACHE_VERSION.toString();
    
    console.log(`🔍 Cache Version Check: stored=${storedVersion}, current=${currentVersion}`);
    
    if (storedVersion !== currentVersion) {
      console.warn(`⚠️ Cache version mismatch! Clearing all cache...`);
      clearCache();
      localStorage.setItem(CACHE_VERSION_KEY, currentVersion);
      console.log(`✅ Cache cleared, new version set: ${currentVersion}`);
    } else {
      console.log(`✅ Cache version OK: ${currentVersion}`);
    }
  } catch (error: unknown) {
    console.error('❌ Cache version check failed:', error);
  }
}

// Sayfa yüklendiğinde cache version kontrolü
if (typeof window !== 'undefined') {
  checkCacheVersion();
}

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
    
    // Version kontrolü - eski cache'i otomatik sil
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    // Cache expire kontrolü
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    // Data validation - array mi ve boş değil mi?
    if (Array.isArray(entry.data) && entry.data.length === 0) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return entry.data;
  } catch {
    // Bozuk cache'i temizle
    try {
      const cacheKey = CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
    } catch {}
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    // Boş data'yı cache'leme
    if (Array.isArray(data) && data.length === 0) {
      return;
    }
    
    const cacheKey = CACHE_PREFIX + key;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION, // Version bilgisi ekle
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    // localStorage dolu olabilir, eski cache'leri temizle
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      clearCache();
    }
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
  } catch {
    // Silent fail
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
      console.log(`✅ Ligler cache'den geldi (${cached.length} lig)`);
      return { leagues: cached, count: cached.length };
    }

    // Direkt batch processing kullan (RPC yerine)
    return await getLeaguesFallback();
  } catch (error) {
    console.error('Ligler alınamadı:', error);
    return { leagues: [], count: 0 };
  }
}

// Fallback: RPC yoksa batch processing
async function getLeaguesFallback(): Promise<LeaguesResponse> {
  try {
    const leagues = new Set<string>();
    const batchSize = 1000;
    let page = 0;
    let hasMore = true;
    
    console.log('🔄 Fallback: Batch processing başlatıldı...');

    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;

      // Retry mekanizması (3 deneme)
      let retryCount = 0;
      let success = false;
      let data = null;

      while (retryCount < 3 && !success) {
        const result = await supabase
          .from(TABLE_NAME)
          .select('league')
          .range(from, to);

        if (result.error) {
          retryCount++;
          console.warn(`⚠️ Batch ${page + 1} hata aldı (deneme ${retryCount}/3):`, result.error.message);
          if (retryCount < 3) {
            // Kısa bekleme sonrası tekrar dene
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            // 3 denemede başarısız - şimdiye kadar toplananları kaydet
            console.error(`❌ Batch ${page + 1} 3 denemede başarısız, toplanan veriler kaydediliyor...`);
            hasMore = false;
            break;
          }
        } else {
          data = result.data;
          success = true;
        }
      }

      if (!success || !data || data.length === 0) {
        hasMore = false;
        break;
      }

      // Ligleri set'e ekle (otomatik unique)
      data.forEach((item: { league: string }) => {
        leagues.add(item.league);
      });

      // Progress log (her 10 batch'te bir)
      if (page % 10 === 0) {
        console.log(`  📦 Batch ${page + 1}: ${leagues.size} lig bulundu (${page * batchSize} kayıt işlendi)`);
      }

      if (data.length < batchSize) {
        console.log(`✅ Son batch'e ulaşıldı: ${data.length} kayıt`);
        hasMore = false;
      }

      page++;

      // Güvenlik: Maksimum 1000 batch (1M+ veri için yeterli)
      if (page >= 1000) {
        console.warn('⚠️ Maksimum batch limitine ulaşıldı (1000 batch)');
        break;
      }
    }

    const result = Array.from(leagues).sort();
    const totalRecords = page * batchSize;
    console.log(`✅ Toplam ${leagues.size} lig bulundu, ${page} batch işlendi (~${totalRecords.toLocaleString()} kayıt tarandı)`);
    
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
    // SessionStorage cache kontrolü (sayfa yenilenince tekrar çekmesin)
    const cacheKey = `${JSON.stringify(filters)}_p${page}_s${pageSize}`;
    const cached = getSessionCached<MatchesResponse>(cacheKey);
    if (cached) {
      console.log('✅ Maçlar sessionStorage\'dan geldi (sayfa', page, ')');
      return cached;
    }

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

    // Direkt batch processing kullan
    return await getAllTeamsFallback();
  } catch (error) {
    console.error('Takımlar alınamadı:', error);
    return [];
  }
}

async function getAllTeamsFallback(): Promise<string[]> {
  try {
    const teams = new Set<string>();
    const batchSize = 1000;
    let page = 0;
    let hasMore = true;
    
    console.log('🔄 Fallback: Batch processing başlatıldı...');

    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;

      // Retry mekanizması
      let retryCount = 0;
      let success = false;
      let data = null;

      while (retryCount < 3 && !success) {
        const result = await supabase
          .from(TABLE_NAME)
          .select('home_team, away_team')
          .range(from, to);

        if (result.error) {
          retryCount++;
          console.warn(`⚠️ Batch ${page + 1} hata (takımlar, deneme ${retryCount}/3)`);
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            console.error(`❌ Batch ${page + 1} başarısız (takımlar)`);
            hasMore = false;
            break;
          }
        } else {
          data = result.data;
          success = true;
        }
      }

      if (!success || !data || data.length === 0) {
        hasMore = false;
        break;
      }

      // Takımları set'e ekle
      data.forEach((match: { home_team: string; away_team: string }) => {
        teams.add(match.home_team);
        teams.add(match.away_team);
      });

      // Progress log (her 10 batch'te bir)
      if (page % 10 === 0) {
        console.log(`  📦 Batch ${page + 1}: ${teams.size} takım bulundu`);
      }

      if (data.length < batchSize) {
        console.log(`✅ Son batch (takımlar): ${data.length} kayıt`);
        hasMore = false;
      }

      page++;

      if (page >= 1000) {
        console.warn('⚠️ Maksimum batch limitine ulaşıldı (takımlar)');
        break;
      }
    }

    const result = Array.from(teams).sort();
    console.log(`✅ Toplam ${teams.size} takım bulundu (${page} batch)`);
    
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

    // Direkt batch processing kullan
    return await getLeagueMatchCountsFallback();
  } catch (error) {
    console.error('Lig sayıları alınamadı:', error);
    return {};
  }
}

async function getLeagueMatchCountsFallback(): Promise<Record<string, number>> {
  try {
    const counts: Record<string, number> = {};
    const batchSize = 1000;
    let page = 0;
    let hasMore = true;
    let totalProcessed = 0;
    
    console.log('🔄 Fallback: Batch processing başlatıldı...');

    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;

      // Retry mekanizması
      let retryCount = 0;
      let success = false;
      let data = null;

      while (retryCount < 3 && !success) {
        const result = await supabase
          .from(TABLE_NAME)
          .select('league')
          .range(from, to);

        if (result.error) {
          retryCount++;
          console.warn(`⚠️ Batch ${page + 1} hata (lig sayıları, deneme ${retryCount}/3)`);
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            console.error(`❌ Batch ${page + 1} başarısız (lig sayıları)`);
            hasMore = false;
            break;
          }
        } else {
          data = result.data;
          success = true;
        }
      }

      if (!success || !data || data.length === 0) {
        hasMore = false;
        break;
      }

      // Sayımları güncelle
      data.forEach((item: { league: string }) => {
        counts[item.league] = (counts[item.league] || 0) + 1;
      });

      totalProcessed += data.length;

      // Progress log (her 10 batch'te bir)
      if (page % 10 === 0) {
        const leagueCount = Object.keys(counts).length;
        console.log(`  📦 Batch ${page + 1}: ${totalProcessed.toLocaleString()} maç, ${leagueCount} lig`);
      }

      if (data.length < batchSize) {
        console.log(`✅ Son batch (lig sayıları): ${data.length} kayıt`);
        hasMore = false;
      }

      page++;

      if (page >= 1000) {
        console.warn('⚠️ Maksimum batch limitine ulaşıldı (lig sayıları)');
        break;
      }
    }

    console.log(`✅ Toplam ${Object.keys(counts).length} lig bulundu, ${totalProcessed} maç işlendi (${page} batch)`);
    
    const leagueCount = Object.keys(counts).length;
    console.log(`✅ Toplam ${leagueCount} lig, ${totalProcessed} maç (${page} batch)`);
    
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

    console.log('🔄 İstatistikler hesaplanıyor (batch processing)...');

    // Batch processing ile tüm maçları çek (COUNT timeout verdiği için)
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

    // Cache'e kaydet (1 dakika - daha kısa süre)
    setCache(cacheKey, result);
    
    console.log(`✅ İstatistikler hesaplandı: ${totalMatches} maç`);
    return result;
  } catch (error) {
    console.error('İstatistikler alınamadı:', error);
    return null;
  }
}

/**
 * Cache'i preload et (Login sonrası çağrılır)
 * Tüm ligleri, takımları ve lig sayılarını arka planda yükler
 */
/**
 * Cache'i preload et - SESSIZ mod (background)
 * Kullanıcı siteyi kullanırken arka planda yükler
 */
export async function preloadAnalysisCache(): Promise<void> {
  try {
    // Zaten cache varsa tekrar yükleme
    const leaguesCache = getCached<string[]>('all_leagues');
    const teamsCache = getCached<string[]>('all_teams');
    const countsCache = getCached<Record<string, number>>('league_match_counts');
    
    if (leaguesCache && teamsCache && countsCache) {
      return; // Sessiz çıkış
    }

    console.log('🔇 Cache arka planda yüklenmeye başladı (~5 dakika sürebilir)...');
    
    // Sıralı yükleme (paralelden daha stabil)
    if (!leaguesCache) {
      await getLeagues().catch(() => {}); // Hata olsa bile devam
    }
    
    if (!countsCache) {
      await getLeagueMatchCounts().catch(() => {});
    }
    
    if (!teamsCache) {
      await getAllTeams().catch(() => {});
    }
    
    console.log('✅ Cache yüklendi!');
  } catch (error) {
    // Sessiz hata - kullanıcıyı etkilemesin
    console.error('❌ Cache yükleme hatası:', error);
  }
}
