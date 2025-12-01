# Supabase Database Kurulum ve Yapılandırma Rehberi

## 📋 İçindekiler

1. [Supabase Paket Kurulumu](#1-supabase-paket-kurulumu)
2. [Environment Variables Yapılandırması](#2-environment-variables-yapılandırması)
3. [Supabase Tablo Yapısı Kontrolü](#3-supabase-tablo-yapısı-kontrolü)
4. [TypeScript Type Tanımlamaları](#4-typescript-type-tanımlamaları)
5. [Test ve Doğrulama](#5-test-ve-doğrulama)

---

## 1. Supabase Paket Kurulumu

### Adım 1.1: Terminal'de Supabase paketini kurun

```powershell
npm install @supabase/supabase-js
```

Bu paket, Supabase veritabanınıza bağlanmak için gerekli client'ı sağlar.

---

## 2. Environment Variables Yapılandırması

### Adım 2.1: Supabase Dashboard'dan bilgileri alın

1. [Supabase Dashboard](https://app.supabase.com/) adresine gidin
2. Projenizi seçin
3. **Settings** > **API** bölümüne gidin
4. Aşağıdaki bilgileri not edin:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** key

### Adım 2.2: .env.local dosyasına ekleyin

Projenizin kök dizininde `.env.local` dosyanızı açın ve şu satırları ekleyin:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**ÖNEMLİ:** `your_supabase_project_url` ve `your_supabase_anon_key` kısımlarını kendi değerlerinizle değiştirin.

### Adım 2.3: .env.example dosyasını güncelleyin (opsiyonel)

Eğer `.env.example` dosyanız varsa, diğer geliştiriciler için örnek olarak ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 3. Supabase Tablo Yapısı Kontrolü

### Adım 3.1: Tablo adınızı belirleyin

Supabase Dashboard'da:

1. **Table Editor** bölümüne gidin
2. Maç verilerinizin olduğu tablonun adını kontrol edin
3. Tablo adını not edin (örn: `matches`, `football_matches`, vb.)

### Adım 3.2: Tablo izinlerini kontrol edin

**SQL Editor** bölümünde şu sorguyu çalıştırın:

```sql
-- Tablonuzun adını 'matches' yerine yazın
SELECT * FROM matches LIMIT 1;
```

Eğer hata alırsanız, **RLS (Row Level Security)** politikalarını ayarlamanız gerekebilir.

### Adım 3.3: RLS Politikası Oluşturma (Gerekirse)

Eğer tablonuz RLS ile korunuyorsa, okuma izni için politika ekleyin:

```sql
-- 'matches' yerine kendi tablo adınızı yazın
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni veren politika (sadece development için)
CREATE POLICY "Enable read access for all users"
ON matches
FOR SELECT
USING (true);
```

**UYARI:** Production ortamında daha güvenli politikalar kullanmalısınız!

---

## 4. TypeScript Type Tanımlamaları

✅ **Type'lar zaten oluşturuldu!** `types/database.ts` dosyasında tüm tablo kolonları için TypeScript type tanımlamaları mevcut.

### Adım 4.1: Type dosyasını kontrol edin (opsiyonel)

`types/database.ts` dosyasını açarak veritabanı yapınıza uygun olup olmadığını kontrol edebilirsiniz.

**Not:** Eğer ileride veritabanı yapınız değişirse, bu dosyayı manuel olarak güncellemeniz gerekir.

---

## 5. Test ve Doğrulama

### Adım 5.1: Bağlantıyı test edin

Development server'ı başlatın:

```powershell
npm run dev
```

### Adım 5.2: Console'da hata kontrolü

Browser console'da (F12) Supabase bağlantı hatası olup olmadığını kontrol edin.

### Adım 5.3: Verileri test edin

Oluşturduğumuz analiz sayfasına gidin:

```
http://localhost:3000/database-analysis
```

Eğer veriler yükleniyorsa, kurulum başarılı! ✅

---

## 📊 Tablo Yapınız Hakkında

Veritabanınız **çok zengin** bir maç verileri yapısına sahip:

### Temel Bilgiler

- ✅ **169 kolon** mevcut
- ✅ Ev sahibi/Deplasman takım bilgileri
- ✅ Lig bilgisi
- ✅ Maç tarihi ve saati
- ✅ İlk yarı/Maç sonu skorları

### Bahis Oranları (Açılış ve Kapanış)

- **Maç Sonucu** (1X2): İlk yarı, maç sonu, 2. yarı
- **Gol Üst/Alt**: 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 (FT, HT, SH)
- **Karşılıklı Gol (BTTS)**: İlk yarı, maç sonu, 2. yarı
- **Çifte Şans**: 1X, 12, X2 (FT, HT)
- **Handikap**: Asian Handicap (-0.5, 0, +0.5)
- **Korner**: Korner sayısı tahminleri
- **İlk Yarı/Maç Sonu**: 9 farklı kombinasyon
- **Doğru Skor**: İlk yarı ve maç sonu

### İstatistiksel Veriler

- ✅ Gün, ay, yıl ayrımı
- ✅ Bahis şirketi bilgisi
- ✅ Oluşturulma/Güncellenme zamanları

---

## 🎯 Önerilen Filtreler

Veritabanı yapınıza göre şu filtreleri ekleyeceğiz:

### 1. Ana Filtreler (Sol Panel - Lig Seçimi)

- ✅ Lig bazlı filtreleme

### 2. Üst Filtre Çubuğu

- ✅ **Gol Üst/Alt**: 0.5, 1.5, 2.5, 3.5 üst/alt
- ✅ **BTTS**: Var/Yok
- ✅ **Tarih Aralığı**: Başlangıç - Bitiş
- ✅ **Maç Sonucu**: Ev sahibi galibiyeti, beraberlik, deplasman galibiyeti
- ✅ **İlk Yarı/Maç Sonu**: 1/1, 1/X, 1/2, X/1, X/X, X/2, 2/1, 2/X, 2/2
- ✅ **Oran Aralığı**: Min-Max oran filtreleri
- ✅ **Takım Arama**: Takım adına göre

### 3. Gelişmiş Filtreler (Genişletilebilir)

- ✅ **Ay/Yıl bazlı**
- ✅ **Gün bazlı** (Hafta içi/sonu)
- ✅ **Bahis şirketi bazlı**
- ✅ **Doğru skor** filtreleri

---

## ⚠️ Önemli Notlar

1. **Environment Variables**: Server restart gerektirir! `.env.local` değiştirdikten sonra:

   ```powershell
   npm run dev
   ```

2. **RLS (Row Level Security)**: Production'da mutlaka aktif olmalı, ancak uygun politikalarla yapılandırılmalı.

3. **Rate Limiting**: Çok fazla veri varsa sayfalama (pagination) kullanmalısınız.

4. **Index'ler**: Büyük veri setlerinde `league`, `match_date` gibi sık filtrelenen kolonlarda index oluşturun:

   ```sql
   CREATE INDEX idx_matches_league ON matches(league);
   CREATE INDEX idx_matches_date ON matches(match_date);
   ```

5. **Performans**: Milyonlarca kayıt varsa, materialized view veya aggregation tablolar kullanmayı düşünün.

---

## 🚀 Sonraki Adımlar

1. ✅ Supabase paketini yükleyin
2. ✅ Environment variables ekleyin
3. ✅ Tablo adını ve RLS politikalarını kontrol edin
4. ✅ Development server'ı başlatın
5. ✅ `/database-analysis` sayfasını test edin

---

## 🆘 Sorun Giderme

### "Failed to fetch" hatası

- ✅ Supabase URL ve key'i kontrol edin
- ✅ Browser console'da detaylı hata mesajını okuyun
- ✅ Supabase Dashboard'da **API Settings** > **CORS** ayarlarını kontrol edin

### "Row Level Security" hatası

- ✅ RLS politikalarını kontrol edin veya tabloda RLS'yi geçici olarak kapatın (sadece development için)

### Veriler görünmüyor

- ✅ Tablo adının doğru olduğunu kontrol edin
- ✅ SQL Editor'da `SELECT * FROM your_table LIMIT 10;` sorgusunu test edin

---

**Not:** Bu kurulum tamamlandıktan sonra sistem otomatik olarak çalışacak. Herhangi bir sorun yaşarsanız, bu dokümandaki adımları tekrar kontrol edin veya sorunuzu detaylı açıklayın.
