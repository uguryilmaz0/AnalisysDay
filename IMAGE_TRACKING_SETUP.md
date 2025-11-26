# 📷 Görsel Takip Sistemi - Kurulum

## Genel Bakış

Sistem, kullanıcıların analiz görsellerini nasıl kullandığını takip eder:

- ✅ Görüntüleme tracking
- ✅ Sağ tık engelleme + tracking
- ✅ Screenshot detection + tracking
- ✅ VPN/Proxy tespiti
- ✅ IP adresi ve geolocation
- ✅ Watermark (kullanıcı bilgisi overlay)

## Özellikler

### 1. Görsel Koruma

- **Watermark**: Her görselde kullanıcı email + isim + tarih
- **Sağ Tık Engelleme**: Context menu tamamen disabled
- **Screenshot Uyarısı**: PrtScn, Win+Shift+S, Cmd+Shift+3/4/5 tuşları yakalanır
- **Flash Uyarı**: Screenshot tespit edildiğinde kırmızı uyarı ekranı

### 2. Tracking

Tüm aktiviteler `image_tracking` Firestore koleksiyonuna kaydedilir:

- `view` - Modal açıldığında
- `right_click` - Sağ tık yapıldığında
- `screenshot` - Screenshot tuşları basıldığında
- `download` - (gelecekte) indirme işlemi

### 3. VPN/Proxy Tespiti

- IPHub.info API kullanılır (1000 istek/gün ücretsiz)
- VPN/Proxy/Tor kullanıcıları tespit edilir
- Şu anda: Loglanır + uyarılır (erişim engellenmez)
- Gelecek: Erişim engelleme özelliği eklenebilir

### 4. Admin Panel

Yeni tab: **"📷 Görsel Takip"**

- İstatistikler: Toplam işlem, VPN sayısı, ülkeler
- Filtreler: Tip, kullanıcı, analiz, VPN
- Detaylı log tablosu
- Export özelliği (gelecekte)

## Kurulum

### 1. Environment Variables

`.env.local` dosyasına ekleyin:

```env
# IPHub API Key (VPN Detection)
# Sign up: https://iphub.info/pricing
# Free tier: 1000 requests/day
IPHUB_API_KEY=your_api_key_here
```

**NOT**: API key olmadan sistem çalışır ama VPN tespiti devre dışı olur.

### 2. Firestore Rules

`firestore.rules` dosyasına koleksiyon ekleyin:

```javascript
// Image tracking logs (admin only read/write)
match /image_tracking/{trackingId} {
  allow read, write: if isAdmin();
}
```

### 3. Firestore Index

Console'dan oluşturulacak index'ler (ilk sorguda otomatik link verilir):

- `image_tracking` collection:
  - `timestamp` (DESC) + `type` (ASC)
  - `timestamp` (DESC) + `userId` (ASC)
  - `timestamp` (DESC) + `isVPN` (ASC)

## Kullanım

### Client-Side (Otomatik)

`app/analysis/page.tsx` içinde `WatermarkImage` component'i kullanılıyor:

```tsx
<WatermarkImage
  src={imageUrl}
  alt={title}
  userEmail={user.email}
  userName={user.username}
  onImageClick={() => trackImageView("view", analysis, url, index)}
  onRightClick={() => trackImageView("right_click", analysis, url, index)}
  onScreenshotDetected={() =>
    trackImageView("screenshot", analysis, url, index)
  }
  disableRightClick={true}
/>
```

### Admin Panel

1. Admin paneline giriş yap
2. **"📷 Görsel Takip"** sekmesine git
3. Filtreleri kullan:
   - Tür: Görüntüleme, Sağ Tık, Screenshot
   - VPN: Sadece VPN/Proxy kullanıcıları
   - Zaman aralığı

## API Endpoints

### POST /api/track/image-view

Görsel aktivitesini kaydet.

**Request:**

```json
{
  "type": "view" | "right_click" | "screenshot",
  "userId": "string",
  "userEmail": "string",
  "userName": "string",
  "analysisId": "string",
  "analysisTitle": "string",
  "imageUrl": "string",
  "imageIndex": 0
}
```

**Response:**

```json
{
  "success": true,
  "trackingId": "doc_id",
  "vpnDetected": false
}
```

### GET /api/admin/image-logs

Admin için log listesi.

**Query Params:**

- `type` - all | view | right_click | screenshot
- `userId` - Belirli kullanıcı
- `analysisId` - Belirli analiz
- `vpnOnly` - true/false
- `limit` - Sayı (default: 100)

**Response:**

```json
{
  "logs": [...],
  "stats": {
    "total": 150,
    "byType": { "view": 100, "right_click": 30, "screenshot": 20 },
    "vpnCount": 5,
    "topUsers": [...]
  }
}
```

## VPN Engelleme (Gelecek)

Şu anda VPN kullanıcıları uyarılıyor ama erişim engellemiyor.

**Aktif etmek için:**

`app/api/track/image-view/route.ts` içinde:

```typescript
// VPN Warning -> VPN Blocking
if (ipInfo.isVPN || ipInfo.isProxy || ipInfo.isTor) {
  return NextResponse.json(
    {
      error: "VPN/Proxy detected",
      blocked: true,
      message:
        "VPN kullanımı tespit edildi. Lütfen VPN'i kapatıp tekrar deneyin.",
    },
    { status: 403 }
  );
}
```

Client tarafında da kontrol ekle:

```typescript
const response = await trackImageView(...);
if (response.vpnDetected) {
  alert("⚠️ VPN tespit edildi! Görselleri görüntülemek için VPN'i kapatın.");
  return; // Modal açma
}
```

## Güvenlik Notları

1. **Watermark**: Görseli kaydeden kişi tespit edilir
2. **Screenshot**: Keyboard shortcut'ları yakalanır (browser sınırlaması var)
3. **Sağ Tık**: Tamamen engellenmiş (F12 Developer Tools hariç)
4. **Bot Engelleme**: User-Agent'tan bot/crawler tespit edilir
5. **VPN**: IPHub API ile tespit (şu an sadece log)

## Limitler

- **IPHub Free**: 1000 istek/gün
- **Firestore**: Unlimit okuma/yazma (Blaze plan)
- **Screenshot Detection**: Browser-dependent (Safari sınırlı destek)

## Troubleshooting

### VPN detection çalışmıyor

- `IPHUB_API_KEY` environment variable kontrol et
- API quota dolmuş olabilir (1000/gün)
- IPHub dashboard'dan kullanım kontrol et

### Screenshot uyarısı çıkmıyor

- Bazı tarayıcılarda (Safari) keyboard event yakalanmaz
- Browser extension'ları (Screenshot tools) yakalayamayabilir
- DevTools screenshot'u yakalanmaz

### Tracking kayıtları gözükmüyor

- Firestore rules kontrol et (`isAdmin()` fonksiyonu)
- Network tab'da API error kontrol et
- Console'da error logları kontrol et

## Gelecek Özellikler

- [ ] Geolocation harita görselleştirmesi
- [ ] Export to CSV/Excel
- [ ] Email notification (şüpheli aktivite)
- [ ] AI-powered anomaly detection
- [ ] Real-time tracking dashboard
- [ ] Screenshot watermark güçlendirme (canvas overlay)
