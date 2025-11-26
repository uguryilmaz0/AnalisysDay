# 📱 Mobil & IP Tespiti - Teknik Detaylar

## 1. ✅ API Hatası Düzeltildi

**Sorun:** Boş Firestore koleksiyonunda `orderBy()` query'si hata veriyordu.

**Çözüm:**

- orderBy kaldırıldı
- Memory'de sorting yapılıyor (timestamp descending)
- İlk veri eklendikten sonra sorunsuz çalışacak

**Test için:** Bir görsele tıklayın, tracking başlasın.

---

## 2. 📱 Mobil Uyumluluk

### Screenshot Detection (Mobil)

#### ✅ **Android:**

- **Hardware Tuşları:** Çalışmaz (OS seviyesinde handle ediliyor)
- **Swipe Gesture:** Çalışmaz (OS native feature)
- **App Screenshot:** JavaScript event yakalayamaz

#### ✅ **iOS (iPhone/iPad):**

- **Yan Tuş + Volume Up:** Çalışmaz (OS native)
- **AssistiveTouch Screenshot:** Çalışmaz
- **Control Center Screenshot:** Çalışmaz

#### 🔧 **Mobil için Çözüm:**

**A) Watermark (Zaten Aktif)** ✅

- Mobilde de görünür
- Screenshot alınsa bile watermark kalıyor
- En etkili yöntem

**B) Screenshot Detection API (Sınırlı)**

```javascript
// Safari 16+ (iOS 16+)
if ("onvisibilitychange" in document) {
  // Visibility değişimi = screenshot olabilir
  // Ama kesin değil (tab switch de trigger eder)
}
```

**C) Vibration + Uyarı (Opsiyonel)**

```javascript
// Watermark'a ilave olarak
if (navigator.vibrate) {
  navigator.vibrate(200); // Telefonun titreşmesi
}
```

### 🎯 Önerilen Mobil Strateji:

1. **Watermark** - En güçlü koruma (aktif ✅)
2. **Sağ Tık Engelleme** - Desktop için (aktif ✅)
3. **Long-Press Engelleme** - Mobil için (ekleyelim mi?)

---

## 3. 🌐 IP Adresi Tespiti

### Mevcut Sistem (lib/ipUtils.ts)

```typescript
export function getClientIP(req: NextRequest): string {
  // 1. x-forwarded-for (Vercel, Nginx proxy)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // 2. x-real-ip (Alternative proxy header)
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP.trim();

  // 3. Vercel specific
  const vercelIP = req.headers.get("x-vercel-forwarded-for");
  if (vercelIP) return vercelIP.split(",")[0].trim();

  return "unknown";
}
```

### ✅ IP Tespiti Çalışma Senaryoları:

#### **Localhost (Development):**

- IP: `127.0.0.1` veya `::1`
- Geolocation: "Local"
- VPN Tespiti: Çalışmaz (localhost)

#### **Vercel Production:**

- IP: Gerçek kullanıcı IP'si
- Header: `x-forwarded-for` otomatik doluyor
- Geolocation: ✅ Çalışır (IPHub API)
- VPN: ✅ Tespit edilir

#### **Vercel Preview:**

- IP: ✅ Çalışır
- Aynı production mantığı

### 🧪 Test Etme:

**1. Localhost'ta IP görme:**

```typescript
// app/api/track/image-view/route.ts içinde
console.log("IP Info:", {
  ip: ipInfo.ip,
  headers: {
    "x-forwarded-for": req.headers.get("x-forwarded-for"),
    "x-real-ip": req.headers.get("x-real-ip"),
  },
});
```

**2. Production'da Test:**

- Vercel'e deploy edin
- Admin panel → Görsel Takip sekmesi
- Bir görsele tıklayın
- IP adresi kolonda görünecek

**3. VPN ile Test:**

- VPN açın
- Görsele tıklayın
- "🛡️ VPN" badge'i görünmeli

### 📊 IP Info Yapısı:

```typescript
{
  ip: "185.123.45.67",           // Gerçek IP
  userAgent: "Mozilla/5.0...",   // Tarayıcı
  country: "Turkey",              // IPHub'dan
  isp: "Turk Telekom",           // IPHub'dan
  asn: "AS9121",                 // IPHub'dan
  isVPN: false,                   // IPHub'dan
  isProxy: false,                 // IPHub'dan
  isTor: false,                   // IPHub'dan
  deviceType: "mobile"            // User-agent'tan
}
```

---

## 4. 🔐 Güvenlik Seviyeleri (Şu An vs Gelecek)

### ✅ Şu An Aktif:

1. **Watermark** - Görsel üzerinde kullanıcı bilgisi
2. **Sağ Tık Engelleme** - Desktop
3. **Screenshot Uyarı** - Desktop (PrtScn, Win+Shift+S, Cmd+Shift+3/4/5)
4. **IP Tracking** - Her işlem loglanıyor
5. **VPN Tespiti** - IPHub API (warning only)
6. **Bot Engelleme** - User-agent filtering

### 🚀 Eklenebilecekler:

#### **A) Mobil Long-Press Engelleme**

```javascript
// components/WatermarkImage.tsx'e ekle
onContextMenu={(e) => {
  e.preventDefault(); // Desktop
}}
onTouchStart={(e) => {
  // Mobil long-press başlangıcı
  touchTimer = setTimeout(() => {
    // Long-press tespit edildi
    onRightClick?.();
  }, 500);
}}
onTouchEnd={() => {
  clearTimeout(touchTimer);
}}
```

#### **B) DevTools Detection**

```javascript
// Tarayıcı DevTools açıksa tespit et
setInterval(() => {
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;

  if (widthThreshold || heightThreshold) {
    console.log("DevTools detected!");
    // Log it
  }
}, 1000);
```

#### **C) Canvas Fingerprinting**

```javascript
// Kullanıcıyı benzersiz şekilde tanımla
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
ctx.textBaseline = "top";
ctx.font = "14px Arial";
ctx.fillText("Browser fingerprint", 2, 2);
const fingerprint = canvas.toDataURL();
```

#### **D) VPN Engelleme (Aktif Et)**

```typescript
// app/api/track/image-view/route.ts
if (ipInfo.isVPN) {
  return NextResponse.json(
    { error: "VPN detected", blocked: true },
    { status: 403 }
  );
}
```

---

## 5. 📈 Tracking İstatistikleri

### Admin Panelde Görülen Metrikler:

- **Toplam İşlem:** View + Right-click + Screenshot
- **VPN/Proxy Sayısı:** Riskli kullanıcılar
- **Aktif Kullanıcı:** Kaç farklı kullanıcı
- **Farklı Ülke:** Geolocation dağılımı

### Gelecek Özellikler:

- 📊 **Grafik Dashboard:** Zaman bazlı analiz grafiği
- 🗺️ **Harita:** Ülke bazlı kullanım haritası
- 📧 **Email Uyarı:** Şüpheli aktivite bildirimi
- 📥 **CSV Export:** Log verilerini indir

---

## 6. ❓ Sık Sorulan Sorular

### Q: Localhost'ta IP tespiti çalışıyor mu?

**A:** Hayır. Localhost IP'si `127.0.0.1` döner. Production'da gerçek IP alınır.

### Q: VPN tespit oranı nedir?

**A:** IPHub API ~95% doğruluk. Ücretli VPN'ler tespit edilir. Bazı kurumsal VPN'ler atlanabilir.

### Q: Mobilde screenshot önlenebilir mi?

**A:** Hayır. OS seviyesinde. Ama watermark sayesinde screenshot'ta kullanıcı bilgisi kalır.

### Q: Admin kendisini görebilir mi?

**A:** Evet. Admin de tracking'e tabi. Tüm kullanıcılar eşit.

### Q: GDPR uyumlu mu?

**A:** IP adresi kişisel veridir. Privacy policy'de belirtilmeli.

---

## 7. 🎯 Test Checklist

```bash
# 1. Localhost Test
✅ Görsele tıkla → Console'da "view" tracking logu
✅ Sağ tık → Engellenmiş + console log
✅ PrtScn bas → Uyarı ekranı + console log

# 2. Admin Panel Test
✅ Admin panel → Görsel Takip sekmesi
✅ Filtreler çalışıyor
✅ Tablo görünüyor (boş olabilir ilk başta)

# 3. Production Test (Vercel'e deploy sonrası)
✅ IP adresi gerçek (127.0.0.1 değil)
✅ VPN ile giriş → Badge görünüyor
✅ Geolocation bilgisi doluyor

# 4. Mobil Test
✅ Watermark görünüyor
✅ Görsele tıklama → tracking kayıtlı
✅ Long-press → (henüz engellenmiyor)
```

---

## 8. 🚀 Hemen Yapılacaklar

1. **Localhost'ta test edin** - Console logları kontrol edin
2. **Vercel'e deploy edin** - Production IP tespiti için
3. **IPHUB_API_KEY ekleyin** - VPN tespiti için (opsiyonel)
4. **İlk tracking'i oluşturun** - Görsele tıklayın

---

## 9. 💡 İpuçları

- **Development:** Console loglarına bakın
- **Production:** Admin panel → Görsel Takip
- **VPN Test:** ProtonVPN veya Windscribe (ücretsiz) kullanın
- **Mobil Test:** Chrome DevTools → Device Emulation

---

Başka soru varsa yazın! 🚀
