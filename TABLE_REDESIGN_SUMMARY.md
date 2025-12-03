# Tablo Tasarım Değişiklikleri - 2025

## 🎯 Özet

Database Analysis sayfasındaki maç tablosu tamamen yeniden tasarlandı. Artık 30+ sütun ile kapsamlı oran analizi ve inline filtreleme özelliği mevcut.

## ✨ Yeni Özellikler

### 1. Genişletilmiş Oran Sütunları (30+ Sütun)

Eski tablo sadece 10 sütun içeriyordu. Yeni tasarım şunları içeriyor:

**Sabit Sol Kolonlar (5 Sütun)**

- Tarih (Date + Time)
- Lig (League)
- Ev Sahibi (Home Team)
- Skor (FT Score + HT Score)
- Deplasman (Away Team)

**Kaydırılabilir Oran Kolonları (25+ Sütun)**

1. **MS - Maç Sonucu (3 sütun)**: FT 1/X/2
2. **İY - İlk Yarı (3 sütun)**: HT 1/X/2
3. **ÇŞ - Çifte Şans (3 sütun)**: FT 1X/12/X2
4. **İYÇŞ - İlk Yarı Çifte Şans (3 sütun)**: HT 1X/12/X2
5. **AH - Asian Handicap (3 sütun)**: -0.5 / 0 / +0.5
6. **EH - European Handicap (1 sütun)**: -1
7. **İY/MS Kombinasyonları (9 sütun)**: 1/1, 1/X, 1/2, X/1, X/X, X/2, 2/1, 2/X, 2/2

### 2. Inline Filtreleme Sistemi

Her oran sütununun altında filtre input'u bulunuyor.

**Kullanım Örnekleri:**

- `>2.5` → 2.5'ten büyük oranları göster
- `<1.8` → 1.8'den küçük oranları göster
- `1.75` → Tam 1.75 oranına eşit olanları göster
- `=2.00` → Tam 2.00 oranına eşit olanları göster

**Teknik Detaylar:**

- Real-time filtering (client-side)
- Birden fazla sütun aynı anda filtrelenebilir
- Filtre sonuç sayısı otomatik gösterilir

### 3. Renk Kodlaması

Oranlar değerlerine göre otomatik renk alıyor:

| Oran Aralığı | Renk          | Anlamı                       |
| ------------ | ------------- | ---------------------------- |
| 1.0 - 1.5    | 🟢 Yeşil      | Çok düşük oran (favoriler)   |
| 1.51 - 2.0   | 🟢 Açık Yeşil | Düşük oran                   |
| 2.01 - 3.0   | 🔵 Mavi       | Orta oran                    |
| 3.01 - 5.0   | 🟡 Sarı       | Yüksek oran                  |
| 5.01+        | 🔴 Kırmızı    | Çok yüksek oran (iddialılar) |

### 4. Sticky Kolonlar (Sabit Sol Sütunlar)

İlk 5 sütun (Tarih, Lig, Ev Sahibi, Skor, Deplasman) yatay kaydırma sırasında sabit kalıyor.

**Teknik Özellikler:**

- `position: sticky` ile CSS uygulaması
- Z-index layering ile doğru üst üste binme
- Sağ kenarda gölge efekti

### 5. Gelişmiş Görünüm

- **Header Renklendirmesi**: Her oran grubu farklı renk ile vurgulanıyor (MS=Sarı, İY=Mavi, ÇŞ=Yeşil, vb.)
- **Alternatif Arka Planlar**: Bazı kolonlar yarı-saydam arka plana sahip
- **Grup Ayırıcıları**: Sağda border ile oran grupları ayrılıyor
- **Hover Efektleri**: Satırlar üzerine gelindiğinde arka plan değişiyor

## 🔧 Teknik Değişiklikler

### Dosya: `app/database-analysis/components/MatchTable.tsx`

**Yeni Bağımlılıklar:**

```typescript
import { useState, useMemo } from "react";
```

**Yeni Yardımcı Fonksiyonlar:**

```typescript
// Oran değerine göre renk sınıfı döndürür
function getOddsColor(odds: number | null | undefined): string

// Filtre değişimlerini yönetir
const handleFilterChange = (key: string, value: string) => void
```

**Yeni State Management:**

```typescript
const [filters, setFilters] = useState({
  msHome, msDraw, msAway,      // MS filtreleri
  htHome, htDraw, htAway,      // İY filtreleri
  dc1X, dc12, dcX2,            // ÇŞ filtreleri
  htdc1X, htdc12, htdcX2,      // İYÇŞ filtreleri
  ahMinus, ahZero, ahPlus,     // AH filtreleri
  ehMinus1,                     // EH filtresi
  htMs1, htMs1X, htMs12, ...   // İY/MS filtreleri (9 adet)
});
```

**Performans Optimizasyonu:**

- `useMemo` hook ile filtreleme optimize edildi
- Sadece `filters` veya `matches` değiştiğinde yeniden hesaplama
- Client-side filtering ile server yükü yok

### Database Field Mapping

```typescript
// Çifte Şans
ft_dc_1x_odds_close, ft_dc_12_odds_close, ft_dc_x2_odds_close;
ht_dc_1x_odds_close, ht_dc_12_odds_close, ht_dc_x2_odds_close;

// Asian Handicap
ah_minus_05_home_odds_close, ah_0_home_odds_close, ah_plus_05_home_odds_close;

// European Handicap
eh_minus_1_home_odds_close;

// İY/MS Kombinasyonları
ht_ft_11_odds_close; // 1/1 (İY:1, MS:1)
ht_ft_1x_odds_close; // 1/X (İY:1, MS:X)
ht_ft_12_odds_close; // 1/2 (İY:1, MS:2)
ht_ft_x1_odds_close; // X/1 (İY:X, MS:1)
ht_ft_xx_odds_close; // X/X (İY:X, MS:X)
ht_ft_x2_odds_close; // X/2 (İY:X, MS:2)
ht_ft_21_odds_close; // 2/1 (İY:2, MS:1)
ht_ft_2x_odds_close; // 2/X (İY:2, MS:X)
ht_ft_22_odds_close; // 2/2 (İY:2, MS:2)
```

## 📱 Responsive Tasarım

Tablo tüm ekran boyutlarında çalışıyor:

- **Desktop (>1024px)**: Tüm sütunlar görünür, yatay scroll
- **Tablet (768-1024px)**: Sticky kolonlar + scroll
- **Mobile (<768px)**: Minimal görünüm, horizontal scroll

## 🎨 CSS Özellikleri

### Sticky Column Positioning

```css
.sticky {
  position: sticky;
  z-index: 10 | 20; /* header için 20, tbody için 10 */
}

/* Sol sütun pozisyonları */
left-0        /* Tarih */
left-[80px]   /* Lig */
left-[200px]  /* Ev Sahibi */
left-[350px]  /* Skor */
left-[430px]  /* Deplasman */
```

### Renk Paleti

```css
/* Header Renkleri */
text-yellow-400  /* MS */
text-blue-400    /* İY */
text-green-400   /* ÇŞ */
text-cyan-400    /* İYÇŞ */
text-purple-400  /* AH */
text-orange-400  /* EH */
text-pink-400    /* İY/MS */

/* Oran Renkleri */
bg-green-900/70     /* Çok düşük */
bg-emerald-800/70   /* Düşük */
bg-blue-800/70      /* Orta */
bg-yellow-800/70    /* Yüksek */
bg-red-800/70       /* Çok yüksek */
```

## 🚀 Kullanıcı Deneyimi İyileştirmeleri

1. **Daha Fazla Veri**: 10 sütundan 30+ sütuna çıkış
2. **Hızlı Filtreleme**: Her sütun için ayrı filtre
3. **Görsel İpuçları**: Renk kodlaması ile hızlı analiz
4. **Kolay Gezinme**: Sticky kolonlar ile takım bilgileri her zaman görünür
5. **Performans**: Client-side filtering ile anında sonuç
6. **Bilgilendirme**: Filtre kullanım rehberi ve sonuç sayısı gösterimi

## 📊 Kullanım Senaryoları

### Senaryo 1: Yüksek Oranlı Maçlar

```
MS 1 > 3
MS X > 3
MS 2 > 3
```

→ Üçlü bahiste tüm oranların 3'ten yüksek olduğu maçları bulur

### Senaryo 2: Dengeli Maçlar

```
MS 1 > 2.5
MS 1 < 3.5
MS 2 > 2.5
MS 2 < 3.5
```

→ Her iki takımın da benzer oranlara sahip olduğu maçlar

### Senaryo 3: Çifte Şans Fırsatları

```
ÇŞ 1X < 1.5
MS 1 < 2
```

→ Ev sahibi favori ama çifte şans oranı düşük

## 🔄 Gelecek Geliştirmeler (Öneriler)

- [ ] Filtre preset'leri (kaydedilebilir filtre kombinasyonları)
- [ ] Excel/CSV export özelliği
- [ ] Kolonları göster/gizle seçeneği
- [ ] Kolon sıralaması (drag & drop)
- [ ] Gelişmiş istatistikler (oran trendleri, ortalamalar)
- [ ] Favori maçlar işaretleme
- [ ] Karşılaştırma modu (iki maçı yan yana göster)

## 📝 Notlar

- Tüm oranlar "close" (kapanış) oranlarıdır
- Null değerler "-" olarak gösterilir
- Filtreleme sadece mevcut sayfa için geçerlidir (pagination korunur)
- Inline filtreler localStorage'a kaydedilmez (sayfa yenilendiğinde sıfırlanır)

---

**Geliştirme Tarihi**: Ocak 2025  
**Geliştirici**: @github-copilot  
**Dosya**: `app/database-analysis/components/MatchTable.tsx`
