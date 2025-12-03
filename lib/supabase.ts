import { createClient } from '@supabase/supabase-js';

// =====================================================
// CLIENT-SIDE SUPABASE (Public Access)
// =====================================================
// Bu client browser'da çalışır ve NEXT_PUBLIC_ prefix'li
// environment variable'lar kullanır. RLS politikaları
// sayesinde güvenli erişim sağlar.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key tanımlanmamış! .env.local dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
  },
});

// =====================================================
// SERVER-SIDE SUPABASE (Admin Access - Optional)
// =====================================================
// Bu client sadece server-side API route'larında kullanılır
// ve RLS politikalarını bypass eder. SADECE GÜVENLİ
// server-side işlemler için kullanılmalıdır!

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  // Eğer zaten oluşturulmuşsa, mevcut instance'ı döndür
  if (supabaseAdmin) return supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Service role key yoksa, admin client oluşturma
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Supabase Service Role Key bulunamadı. Admin client kullanılamaz.');
    console.warn('ℹ️ RLS politikaları sayesinde anon key ile güvenli erişim sağlanıyor.');
    return null;
  }

  // Admin client oluştur (RLS bypass)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

// =====================================================
// KULLANIM KILAVUZU
// =====================================================
// 
// CLIENT-SIDE (Browser):
// ----------------------
// import { supabase } from '@/lib/supabase';
// const { data, error } = await supabase.from('matches').select('*');
// 
// RLS politikaları otomatik olarak uygulanır:
// - SELECT: Herkese açık (anonim dahil)
// - INSERT/UPDATE/DELETE: Reddedilir
//
// SERVER-SIDE API (Admin - Optional):
// -----------------------------------
// import { getSupabaseAdmin } from '@/lib/supabase';
// const admin = getSupabaseAdmin();
// if (admin) {
//   const { data, error } = await admin.from('matches').select('*');
//   // RLS bypass edilir - SADECE GÜVENLİ İŞLEMLER İÇİN!
// }
//
// ÖNEMLİ: Server-side'da da normal supabase client'ı
// kullanabilirsiniz. RLS politikaları yine uygulanır.
// Admin client'a sadece RLS bypass gerekiyorsa ihtiyacınız var.
//
// =====================================================
