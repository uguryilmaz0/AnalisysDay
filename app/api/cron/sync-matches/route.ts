/**
 * ⚠️ GELECEKTEKİ API ENTEGRASYONU İÇİN TEMPLATE
 * 
 * Günlük maç verilerini external API'den çekip Supabase'e aktarır
 * 
 * Kullanım:
 * 1. Vercel Cron Job olarak ayarla (her gün 02:00)
 * 2. Veya manuel tetikle: https://yourapp.com/api/cron/sync-matches
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // 1. Cron Secret ile koruma (production için)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Maç verileri senkronizasyonu başlıyor...');

    // 2. External API'den yeni maçları çek
    // ⚠️ Kendi API'nize göre düzenleyin
    const externalMatches = await fetchMatchesFromExternalAPI();

    if (!externalMatches || externalMatches.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Yeni maç bulunamadı',
        count: 0 
      });
    }

    // 3. Supabase'e upsert (INSERT or UPDATE)
    const { error } = await supabase
      .from('matches')
      .upsert(externalMatches, { 
        onConflict: 'match_id', // Unique constraint olmalı
        ignoreDuplicates: false 
      });

    if (error) throw error;

    console.log(`✅ ${externalMatches.length} maç başarıyla senkronize edildi`);

    // 4. Log kaydı (opsiyonel)
    await logSync(externalMatches.length);

    return NextResponse.json({
      success: true,
      message: 'Senkronizasyon tamamlandı',
      count: externalMatches.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error);
    
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * External API'den maçları çek
 * ⚠️ Kendi API'nize göre düzenleyin
 */
async function fetchMatchesFromExternalAPI() {
  try {
    // Örnek: Football-Data.org, API-Football, vb.
    const apiKey = process.env.EXTERNAL_API_KEY;
    const apiUrl = process.env.EXTERNAL_API_URL;

    if (!apiKey || !apiUrl) {
      throw new Error('API credentials eksik');
    }

    const response = await fetch(`${apiUrl}/matches?date=${getTodayDate()}`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // API response'u Supabase formatına dönüştür
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.matches.map((match: any) => ({
      match_id: match.id.toString(), // Unique ID
      match_date: match.utcDate.split('T')[0],
      league: match.competition.name,
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
      ft_score: `${match.score.fullTime.home}-${match.score.fullTime.away}`,
      ht_score: `${match.score.halfTime.home}-${match.score.halfTime.away}`,
      // Diğer alanlar...
      last_updated: new Date().toISOString(),
      source: 'api',
    }));

  } catch (error) {
    console.error('External API hatası:', error);
    return [];
  }
}

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndür
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Senkronizasyon logunu kaydet
 */
async function logSync(count: number) {
  try {
    await supabase.from('sync_logs').insert({
      type: 'match_sync',
      count,
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  } catch (error) {
    console.error('Log kaydedilemedi:', error);
  }
}
