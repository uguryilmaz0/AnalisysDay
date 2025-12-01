# 📊 Database Analiz Sistemi - Hızlı Başlangıç

Bu sistem, Supabase'deki maç verilerinizi analiz etmenizi ve gelişmiş filtrelerle sorgulamanızı sağlar.

## ✅ Kurulum Tamamlandı

Aşağıdaki dosyalar oluşturuldu:

### 📁 Dizin Yapısı

```
app/
  database-analysis/
    page.tsx                     # Ana sayfa
    components/
      LeagueSidebar.tsx          # Sol panel - Lig seçimi
      FilterBar.tsx              # Üst filtre çubuğu
      MatchTable.tsx             # Maç verilerini gösteren tablo
      StatisticsCard.tsx         # İstatistik kartları

lib/
  supabase.ts                    # Supabase client
  matchService.ts                # Veritabanı sorguları

types/
  database.ts                    # TypeScript type tanımlamaları

components/
  Header.tsx                     # "📊 Analiz Et" butonu eklendi
```

## 🚀 Kurulum Adımları

### 1. Supabase Paketini Yükleyin

Terminal'de çalıştırın:

```powershell
npm install @supabase/supabase-js
```

### 2. Environment Variables Ayarlayın

`.env.local` dosyanızı oluşturun ve şu bilgileri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Bilgileri nereden alacaksınız?**

1. [Supabase Dashboard](https://app.supabase.com/) → Projenizi seçin
2. Settings → API
3. Project URL ve anon public key'i kopyalayın

### 3. Tablo Adını Güncelleyin

`lib/matchService.ts` dosyasını açın ve 7. satırda:

```typescript
const TABLE_NAME = "matches"; // ⚠️ Kendi tablo adınızı buraya yazın
```

Supabase'deki gerçek tablo adınızı yazın (örn: `football_matches`, `match_data`, vb.)

### 4. Supabase RLS Politikalarını Kontrol Edin

Eğer tablonuzda RLS aktifse, okuma izni verin:

**SQL Editor**'da çalıştırın:

```sql
-- Tablo adınızı değiştirin
ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;

-- Okuma izni (development için)
CREATE POLICY "Enable read access for all users"
ON your_table_name
FOR SELECT
USING (true);
```

### 5. Development Server'ı Başlatın

```powershell
npm run dev
```

### 6. Sayfayı Test Edin

Browser'da açın:

```
http://localhost:3000/database-analysis
```

## 📊 Özellikler

### Sol Panel - Lig Filtreleme

- ✅ Tüm ligleri alfabetik sırayla listeler
- ✅ Arama ile lig bulma
- ✅ Çoklu seçim (checkbox)
- ✅ "Tümünü Seç" / "Temizle" butonları

### Üst Filtre Çubuğu

- ✅ **Takım Arama**: Ev sahibi veya deplasman takımı ara
- ✅ **Gol Üst/Alt**: 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 seçenekleri
- ✅ **Karşılıklı Gol (BTTS)**: Var/Yok
- ✅ **Maç Sonucu**: Ev Sahibi (1), Beraberlik (X), Deplasman (2)
- ✅ **İlk Yarı / Maç Sonu**: 9 farklı kombinasyon
- ✅ **Tarih Aralığı**: Başlangıç - Bitiş tarihi
- ✅ **Oran Aralıkları**: Min/Max oran filtreleri

### Maç Tablosu

- ✅ Tarih ve saat
- ✅ Lig bilgisi
- ✅ Ev sahibi ve deplasman takımları
- ✅ Maç skoru (İlk yarı ve maç sonu)
- ✅ İlk Yarı/Maç Sonu sonucu
- ✅ Gol istatistikleri (Üst/Alt 1.5, 2.5)
- ✅ BTTS bilgisi
- ✅ 1X2 kapanış oranları

### İstatistikler

- ✅ Toplam maç sayısı
- ✅ Üst 1.5 ve 2.5 gol yüzdesi
- ✅ Karşılıklı gol (BTTS) yüzdesi

### Sayfalama

- ✅ Sayfa başına 50 maç
- ✅ Önceki/Sonraki butonları
- ✅ Sayfa numarası gösterimi

## 🎯 Kullanım

1. **Sol panelden** en az bir lig seçin
2. **Üstteki filtrelerden** istediğiniz kriterleri belirleyin
3. **"Filtreleri Uygula"** butonuna tıklayın
4. Sonuçlar tabloda gösterilecek ve istatistikler hesaplanacak

## 🔧 Özelleştirme

### Sayfa Başına Gösterilecek Maç Sayısı

`app/database-analysis/page.tsx` dosyasında:

```typescript
// 86. satır
const matchesData = await getMatches(finalFilters, 1, 50);
// ↑ Bu sayıyı değiştirin
```

### Tablo Kolonlarını Özelleştirme

`app/database-analysis/components/MatchTable.tsx` dosyasında `<thead>` ve `<tbody>` bölümlerini düzenleyin.

### Yeni Filtre Ekleme

1. `types/database.ts` → `MatchFilters` interface'ine yeni alan ekleyin
2. `app/database-analysis/components/FilterBar.tsx` → Yeni input ekleyin
3. `lib/matchService.ts` → `getMatches` fonksiyonuna filtre mantığını ekleyin

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için:

- [SUPABASE_DATABASE_SETUP.md](./SUPABASE_DATABASE_SETUP.md) - Detaylı kurulum rehberi

## ⚠️ Önemli Notlar

1. **Performans**: Büyük veri setlerinde (1M+ kayıt) Supabase'de index oluşturun:

   ```sql
   CREATE INDEX idx_matches_league ON your_table(league);
   CREATE INDEX idx_matches_date ON your_table(match_date);
   ```

2. **RLS Güvenliği**: Production ortamında RLS politikalarınızı düzgün yapılandırın.

3. **Rate Limiting**: Supabase free tier limitleri:
   - 500MB veritabanı
   - 2GB bandwidth/ay
   - 50,000 API istekleri/gün

## 🆘 Sorun mu Yaşıyorsunuz?

### "Failed to fetch" hatası

- `.env.local` dosyasındaki URL ve key'i kontrol edin
- Browser console'da detaylı hata mesajını okuyun

### "Row Level Security" hatası

- RLS politikalarını kontrol edin
- SQL Editor'da `SELECT * FROM your_table LIMIT 1;` test edin

### Veriler görünmüyor

- Tablo adının doğru olduğunu kontrol edin
- Supabase Dashboard'da SQL Editor ile veri olup olmadığını kontrol edin

## 🎉 Başarıyla Tamamlandı!

Header'daki **"📊 Analiz Et"** butonuna tıklayarak sistemi kullanmaya başlayabilirsiniz.

---

**İyi analizler! 🚀**
