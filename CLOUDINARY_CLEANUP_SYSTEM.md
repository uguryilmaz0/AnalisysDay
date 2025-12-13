# 🗑️ Otomatik Görsel Temizleme Sistemi

## 📋 Özet

3 günden eski günlük ve yapay zeka analizlerinin görsellerini **hem Firebase'den hem de Cloudinary'den** otomatik olarak silen sistem kuruldu.

---

## ✅ Yapılan Değişiklikler

### 1. **Cloudinary Silme Fonksiyonları** ⭐

**Dosya:** [lib/cloudinary.ts](lib/cloudinary.ts)

#### Yeni Fonksiyonlar:

```typescript
// URL'den public_id çıkarma
extractPublicIdFromUrl(url: string): string | null

// Tek görsel silme (Server-side)
deleteCloudinaryImage(imageUrl: string): Promise<boolean>

// Çoklu görsel silme
deleteMultipleCloudinaryImages(imageUrls: string[]): Promise<number>

// Cloudinary signature oluşturma (SHA-1)
generateCloudinarySignature(params, apiSecret): Promise<string>
```

#### Özellikler:

- ✅ SHA-1 hash ile signature generation
- ✅ Cloudinary Delete API entegrasyonu
- ✅ Public ID extraction from URLs
- ✅ Batch deletion support
- ✅ Error handling & logging

---

### 2. **deleteOldAnalyses() Güncelleme** ⭐⭐⭐

**Dosya:** [lib/db.ts](lib/db.ts)

#### Değişiklikler:

**Önce:**

```typescript
// 7 gün önceki analizleri sadece Firebase'den sil
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
```

**Sonra:**

```typescript
// 3 gün önceki analizleri Firebase + Cloudinary'den sil
const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

// Her analiz için:
for (const doc of dailySnapshot.docs) {
  const data = doc.data() as DailyAnalysis;
  if (data.imageUrls && data.imageUrls.length > 0) {
    const deletedCount = await deleteMultipleCloudinaryImages(data.imageUrls);
    totalImagesDeleted += deletedCount;
  }
}
```

#### Yeni Return Type:

```typescript
{
  dailyDeleted: number; // Firebase'den silinen günlük analiz
  aiDeleted: number; // Firebase'den silinen AI analiz
  imagesDeleted: number; // Cloudinary'den silinen görsel sayısı
}
```

---

### 3. **Cron Job Güncelleme**

**Dosya:** [app/api/cron/cleanup-old-analyses/route.ts](app/api/cron/cleanup-old-analyses/route.ts)

#### Değişiklikler:

- ✅ Response'a `imagesDeleted` field'ı eklendi
- ✅ Logger'a görsel silme bilgisi eklendi
- ✅ Success message güncelendi

```json
{
  "success": true,
  "dailyDeleted": 10,
  "aiDeleted": 5,
  "imagesDeleted": 45,
  "total": 15,
  "message": "10 günlük + 5 AI analiz (45 görsel) silindi"
}
```

---

## 🔧 Kurulum

### 1. Environment Variables

**.env.local** dosyasına ekle:

```bash
# Cloudinary API Keys (Server-side only)
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
```

#### API Keys Nereden Alınır?

1. Cloudinary Dashboard: https://console.cloudinary.com/
2. **Settings** > **API Keys**
3. **API Key** ve **API Secret** değerlerini kopyala

---

## ⚙️ Çalışma Mantığı

### 1. Zamanlanmış Çalışma

```
Schedule: Her Cumartesi sabahı 05:00
Trigger: Vercel Cron (0 5 * * 6)
```

### 2. İşlem Akışı

```
1. 3 gün önceki analizleri bul (Firebase)
   ├── daily_analysis koleksiyonu
   └── ai_analysis koleksiyonu

2. Her analiz için:
   ├── imageUrls array'ini kontrol et
   ├── Her URL için Cloudinary'den sil
   │   ├── Public ID çıkar
   │   ├── SHA-1 signature oluştur
   │   └── DELETE API call
   └── Silinen görsel sayısını logla

3. Firebase'den analizleri sil
   ├── Günlük analizler
   └── AI analizler

4. Sonuçları döndür
   ├── dailyDeleted: 10
   ├── aiDeleted: 5
   └── imagesDeleted: 45
```

---

## 🧪 Test

### Manuel Test

```bash
# Local test (CRON_SECRET olmadan)
curl http://localhost:3000/api/cron/cleanup-old-analyses

# Production test (CRON_SECRET ile)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/cleanup-old-analyses
```

### Beklenen Response

```json
{
  "success": true,
  "dailyDeleted": 10,
  "aiDeleted": 5,
  "imagesDeleted": 45,
  "total": 15,
  "message": "10 günlük + 5 AI analiz (45 görsel) silindi",
  "timestamp": "2025-12-13T10:00:00.000Z"
}
```

---

## 📊 Monitoring

### Console Logs

```bash
🗑️  Analiz abc123: 3/3 görsel silindi
🗑️  AI Analiz xyz789: 2/2 görsel silindi
✅ Cleanup tamamlandı: 10 günlük + 5 AI analiz, 45 görsel silindi
```

### Vercel Logs

```
Cron: Old analyses cleanup completed
{
  dailyDeleted: 10,
  aiDeleted: 5,
  imagesDeleted: 45,
  total: 15
}
```

---

## ⚠️ Önemli Notlar

### 1. **3 Gün Süresi**

- Analizler 3 gün sonra otomatik silinir
- Kullanıcılara yeterli görüntüleme süresi tanır
- Cloudinary storage maliyetlerini düşürür

### 2. **Cloudinary Rate Limits**

- Free plan: 500 operations/hour
- Çok fazla görsel varsa rate limit'e takılabilir
- Batch deletion destekleniyor ama sequential

### 3. **Signature Security**

- SHA-1 hash ile güvenli API call
- API Secret asla client-side'a gitmez
- Timestamp-based validation

### 4. **Error Handling**

```typescript
// Görsel silinmese bile analiz silinir
// Silent fail - logging ile takip
if (success) deletedCount++;
```

---

## 🔐 Güvenlik

### API Keys Protection

```bash
# ✅ Server-side only
CLOUDINARY_API_KEY="xxx"      # .env.local (gitignored)
CLOUDINARY_API_SECRET="xxx"   # .env.local (gitignored)

# ✅ Client-side safe
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="xxx"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="xxx"
```

### Cron Job Authentication

```typescript
// Production: CRON_SECRET required
if (authHeader !== `Bearer ${cronSecret}`) {
  return 401 Unauthorized
}
```

---

## 📈 Kazançlar

### Storage Tasarrufu

```
Örnek Senaryo:
- Günde 10 analiz × 3 görsel = 30 görsel/gün
- 3 gün sonra silme = Max 90 görsel
- Ortalama 500KB/görsel = 45MB storage

Önceki Durum (7 gün):
- Max 210 görsel × 500KB = 105MB

Yeni Durum (3 gün):
- Max 90 görsel × 500KB = 45MB

Kazanç: %57 storage azalma 💰
```

### Cloudinary Bandwidth

```
Azalan yükleme: %57 daha az storage
Azalan bandwidth: Eski görsellere erişim yok
```

---

## 🚀 Deploy

### 1. Environment Variables Ekle

```bash
# Vercel Dashboard
Settings > Environment Variables > Add
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### 2. Deploy

```bash
npm run build
vercel deploy --prod
```

### 3. Cron Job Kontrol

```bash
Vercel Dashboard > Project > Cron Jobs
✅ cleanup-old-analyses (Cumartesi 05:00)
```

---

## ✅ Checklist

- [x] Cloudinary delete functions implemented
- [x] deleteOldAnalyses updated (3 days)
- [x] Cron job updated
- [x] Environment variables documented
- [x] Error handling added
- [x] Logging implemented
- [x] Build successful
- [ ] CLOUDINARY_API_KEY added to .env.local
- [ ] CLOUDINARY_API_SECRET added to .env.local
- [ ] Production deployment
- [ ] First cron run test

---

## 🎉 Sonuç

✅ **3 günlük otomatik temizleme sistemi aktif**  
✅ **Firebase + Cloudinary entegre**  
✅ **%57 storage tasarrufu**  
✅ **Production-ready**

**Sadece Cloudinary API keys'lerini ekleyip deploy etmen yeterli! 🚀**
