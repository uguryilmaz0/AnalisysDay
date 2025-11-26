# 🔍 Tracking Sorunları - Detaylı Analiz ve Çözüm

## ❌ Tespit Edilen Sorunlar

### 1. **Sadece "Görüntüleme" Logları Var** ✅ NORMAL

**Sebep:** Modal açıldığında `onImageClick` çağrılıyor ve `trackImageView("view", ...)` tetikleniyor.

**Neden Çalışıyor:**

```typescript
onImageClick={(url, title, imageIndex) => {
  trackImageView("view", analysis, url, imageIndex); // ✅ Modal açılınca çalışıyor
  setSelectedImage({ url, title });
  modal.open();
}}
```

---

### 2. **Sağ Tık (Right-Click) Logları Yok** ⚠️ SORUN

**Analiz:**

```typescript
// WatermarkImage.tsx
const handleContextMenu = (e: React.MouseEvent) => {
  if (disableRightClick) {
    e.preventDefault(); // ✅ Menü engelleniyor
  }
  onRightClick?.(); // ⚠️ Callback çağrılıyor AMA...
};
```

**Sorun:** `<div>` üzerinde sağ tık çalışıyor AMA:

1. ❌ Overlay div `pointer-events: none` olabilir
2. ❌ Image component'in üzerinde sağ tık event'i bubble etmiyor olabilir

**Çözüm Uygulandı:**

- ✅ Console log eklendi: `🖱️ Right-click detected!`
- ✅ Callback her durumda çağrılıyor

**Test:**

1. Görsele sağ tıklayın
2. Console'da `🖱️ Right-click detected!` görmeli
3. Sonra `📊 Tracking image interaction: { type: 'right_click', ... }`
4. Eğer 1. mesaj varsa ama 2. yoksa → `onRightClick` callback'i tanımlı değil
5. Eğer 1. mesaj yoksa → Event yakalanmıyor

---

### 3. **Screenshot Logları Yok** ⚠️ CİDDİ SORUN

**Analiz:**

```typescript
// WatermarkImage.tsx - useEffect
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isPrintScreen = e.key === "PrintScreen";
    // ...
    if (isPrintScreen || isWindowsSnip || isMacScreenshot) {
      console.log("📸 Screenshot detected!", { src, imageIndex });
      onScreenshotDetected?.();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [onScreenshotDetected, imageIndex, src]);
```

**Sorunlar:**

1. ❌ **Event Listener Sadece Component Mount'tayken Aktif**: Component unmount olursa listener silinir
2. ❌ **Modal Dışında Screenshot**: Kullanıcı modal açmadan (sayfa scroll ederken) PrtScn basarsa yakalanmaz
3. ❌ **PrintScreen Key Browser'da Engellenebilir**: Bazı browser'lar `e.key === "PrintScreen"` algılamaz

**Neden Çalışmıyor:**

- WatermarkImage her görsel için mount ediliyor
- Her görsel kendi keyboard listener'ını ekliyor
- Ama PrtScn tuşu **global** bir event - hangi WatermarkImage instance'ı yakalayacak?

**Çözüm Seçenekleri:**

#### A) Global Keyboard Listener (Önerilen)

```typescript
// app/analysis/page.tsx içinde
useEffect(() => {
  const handleGlobalScreenshot = (e: KeyboardEvent) => {
    const isPrintScreen = e.key === "PrintScreen";
    const isWindowsSnip =
      e.shiftKey && e.key === "S" && (e.metaKey || e.ctrlKey);

    if (isPrintScreen || isWindowsSnip) {
      console.log("🚨 GLOBAL Screenshot detected!");

      // Track for all visible images in current view
      if (userData && filteredAnalyses.length > 0) {
        const firstAnalysis = filteredAnalyses[0];
        const firstImageUrl = firstAnalysis.imageUrls[0];
        trackImageView("screenshot", firstAnalysis, firstImageUrl, 0);
      }
    }
  };

  window.addEventListener("keydown", handleGlobalScreenshot);
  return () => window.removeEventListener("keydown", handleGlobalScreenshot);
}, [userData, filteredAnalyses, trackImageView]);
```

#### B) Focus-Based Detection (Mevcut)

- Sadece modal açıkken (WatermarkImage focus'tayken) çalışır
- Problem: Modal dışında screenshot tespit edilmez

---

### 4. **IP Adresi "::1" (Unknown)** ✅ ÇÖZÜLDÜ

**Sebep:** Localhost'ta IPv6 kullanılıyor.

**Önce:**

```typescript
getClientIP() → "::1" (IPv6 localhost)
getVPNStatus("::1") → { country: "Local" }
// Admin panel'de → "Unknown"
```

**Sonra (Düzeltildi):**

```typescript
getClientIP() → "127.0.0.1" (IPv6 normalize edildi)
getVPNStatus("127.0.0.1") → { country: "Localhost", isp: "Local Network", asn: "N/A" }
// Admin panel'de → "Localhost / Local Network"
```

**Değişiklikler:**

1. ✅ `getClientIP()` IPv6 localhost'u IPv4'e normalize ediyor
2. ✅ `getVPNStatus()` daha detaylı localhost bilgisi veriyor
3. ✅ IPv6 link-local (`fe80:`) ve IPv6-mapped IPv4 (`::ffff:127.0.0.1`) destekleniyor

---

## 🧪 Test Prosedürü

### Test 1: Görüntüleme (View) - ✅ ÇALIŞIYOR

1. Analiz sayfasında bir görsele tıklayın
2. Modal açılacak
3. **Beklenen:**
   - Console: `👆 Image clicked! { src: '...', imageIndex: 0 }`
   - Console: `📊 Tracking image interaction: { type: 'view', imageIndex: 0 }`
   - Console: `✅ Tracking successful`
   - Admin panel: "Görüntüleme" logu eklenmiş

### Test 2: Sağ Tık (Right-Click) - 🧪 TEST EDİN

1. Modal içinde görsele sağ tıklayın
2. **Beklenen:**

   - Sağ tık menüsü AÇILMAMALI
   - Console: `🖱️ Right-click detected! { src: '...', imageIndex: 0 }`
   - Console: `📊 Tracking image interaction: { type: 'right_click', imageIndex: 0 }`
   - Console: `✅ Tracking successful`
   - Admin panel: "Sağ Tık" logu eklenmiş

3. **Eğer Çalışmazsa:**
   - Console'da sadece `🖱️ Right-click detected!` varsa → `onRightClick` callback'i çalışmıyor
   - Hiçbir log yoksa → Event bubble etmiyor (Image component üzerinde)

### Test 3: Screenshot (Modal İçinde) - 🧪 TEST EDİN

1. Modal açıkken **PrtScn** tuşuna basın
2. **Beklenen:**

   - Kırmızı uyarı ekranı flash yapmalı (2 saniye)
   - Console: `📸 Screenshot detected! { src: '...', imageIndex: 0 }`
   - Console: `📊 Tracking image interaction: { type: 'screenshot', imageIndex: 0 }`
   - Console: `✅ Tracking successful`
   - Admin panel: "Screenshot" logu eklenmiş

3. **Eğer Çalışmazsa:**
   - Hiçbir log yoksa → `e.key === "PrintScreen"` algılanmıyor
   - Browser security policy PrtScn'i engelliyor olabilir
   - **Alternatif:** **Win + Shift + S** tuşlarını deneyin (Windows Snipping Tool)

### Test 4: Screenshot (Modal Dışında) - ❌ ÇALIŞMAYACAK (NORMAL)

1. Analiz sayfasında (modal KAPALIYKEN) **PrtScn** basın
2. **Beklenen:**
   - ❌ Hiçbir log olmamalı
   - ❌ Tracking kaydedilmemeli
3. **Sebep:** WatermarkImage modal içinde, modal kapalıyken event listener yok

---

## 🛠️ Uygulanacak Çözümler

### Çözüm A: Global Screenshot Detection (Önerilen)

**Problem:** Modal dışında screenshot alınırsa tespit edilmiyor

**Çözüm:** `app/analysis/page.tsx` içinde global keyboard listener ekle

```typescript
// app/analysis/page.tsx - useEffect hook ekle
useEffect(() => {
  if (!userData) return;

  const handleGlobalScreenshot = (e: KeyboardEvent) => {
    const isPrintScreen = e.key === "PrintScreen";
    const isWindowsSnip =
      e.shiftKey && e.key === "S" && (e.metaKey || e.ctrlKey);
    const isMacScreenshot =
      e.metaKey &&
      e.shiftKey &&
      (e.key === "3" || e.key === "4" || e.key === "5");

    if (isPrintScreen || isWindowsSnip || isMacScreenshot) {
      console.log("🚨 GLOBAL Screenshot attempt detected on analysis page!");

      // Track for first visible analysis
      if (filteredAnalyses.length > 0) {
        const analysis = filteredAnalyses[0];
        const imageUrl = analysis.imageUrls[0] || "";

        trackImageView("screenshot", analysis, imageUrl, 0);

        // Optional: Show toast notification
        alert("⚠️ Ekran görüntüsü tespit edildi! Bu işlem kaydedilmiştir.");
      }
    }
  };

  window.addEventListener("keydown", handleGlobalScreenshot);
  return () => window.removeEventListener("keydown", handleGlobalScreenshot);
}, [userData, filteredAnalyses, trackImageView]);
```

**Artıları:**
✅ Modal dışında da screenshot tespit edilir
✅ Tüm sayfa için global koruma
✅ Toast notification ile kullanıcıya uyarı

**Eksileri:**
⚠️ Hangi görselin screenshot'u alındığı bilinmez (hepsini track eder)
⚠️ Multiple tracking olabilir (hem global hem WatermarkImage'dan)

---

### Çözüm B: Right-Click Event Propagation Fix

**Problem:** Image component sağ tık event'i yakalıyor ama bubble etmiyor

**Test:** Next.js Image component'inin `onContextMenu` prop'u var mı?

```typescript
<Image
  src={src}
  alt={alt}
  onContextMenu={(e) => {
    e.preventDefault();
    console.log("🖱️ Image RIGHT-CLICK");
    onRightClick?.();
  }}
  // ... other props
/>
```

**Eğer çalışmazsa:** Container div'e event ekle (şu anda var)

---

## 📊 Debugging Console Commands

### Test API Endpoint Directly:

```javascript
fetch("/api/track/image-view", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "screenshot",
    userId: "test-user",
    userEmail: "test@example.com",
    userName: "Test User",
    analysisId: "test-analysis",
    analysisTitle: "Test Analysis",
    imageUrl: "https://example.com/test.jpg",
    imageIndex: 0,
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

### Check Event Listeners:

```javascript
// Browser console'da
getEventListeners(window).keydown; // Kaç tane keydown listener var?
```

### Test Screenshot Detection:

```javascript
// Simüle et
const event = new KeyboardEvent("keydown", { key: "PrintScreen" });
window.dispatchEvent(event);
```

---

## 🎯 Sonuç ve Öneri

### Durum:

1. ✅ **Görüntüleme:** Çalışıyor
2. 🟡 **Sağ Tık:** Test edilmeli (console log eklendi)
3. 🟡 **Screenshot (Modal):** Test edilmeli (console log eklendi)
4. ❌ **Screenshot (Global):** Çalışmıyor (normal, şu an tasarımda yok)
5. ✅ **IP Adresi:** Düzeltildi (IPv6 → IPv4 normalize)

### Önerilen Aksiyonlar:

1. **Dev server'ı restart edin** (değişiklikler için)
2. **Sağ tık testi yapın** → Console'da `🖱️ Right-click detected!` görün
3. **Screenshot testi yapın** → Console'da `📸 Screenshot detected!` görün
4. **Eğer çalışmazsa:** Screenshot için detayları bana gönderin:

   - Hangi browser? (Chrome, Firefox, Edge)
   - Console'da ne var?
   - Modal açık mıydı?
   - Hangi tuşa bastınız? (PrtScn, Win+Shift+S, diğer)

5. **Global screenshot koruması istiyorsanız:** Çözüm A'yı uygulayalım

---

## 🔧 Uygulanan Değişiklikler

### 1. components/WatermarkImage.tsx

- ✅ `handleContextMenu`: Console log eklendi
- ✅ `handleClick`: Console log eklendi

### 2. lib/ipUtils.ts

- ✅ `getClientIP`: IPv6 localhost normalize
- ✅ `getVPNStatus`: Localhost için detaylı info (isp, asn)
- ✅ IPv6 link-local ve mapped IPv4 desteği

---

Lütfen testleri yapın ve sonuçları paylaşın! 🚀
