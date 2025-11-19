# 🖼️ Cloudinary Upload Preset Kurulumu

## ❌ Hata: "Upload preset not found"

Bu hatayı alıyorsan, Cloudinary'de upload preset oluşturman gerekiyor.

---

## ✅ Cloudinary Preset Oluşturma Adımları

### 1. **Cloudinary Console'a Git**

https://console.cloudinary.com

### 2. **Settings → Upload**

- Sol menüden **⚙️ Settings** tıkla
- **Upload** sekmesine git

### 3. **Upload Presets → Add Upload Preset**

- **"Add upload preset"** butonuna tıkla
- **"Enable unsigned uploading"** kutusunu işaretle ✅

### 4. **İlk Preset: Analysis Uploads**

```
Preset name: analysisday_uploads
Signing Mode: Unsigned
Folder: analysis_images (opsiyonel)
```

- **Save** tıkla
- **Preset name'i** kopyala: `analysisday_uploads`

### 5. **İkinci Preset: Receipt Uploads**

```
Preset name: analysisday_receipts
Signing Mode: Unsigned
Folder: receipts (opsiyonel)
```

- **Save** tıkla
- **Preset name'i** kopyala: `analysisday_receipts`

---

## 📝 .env.local Güncelleme

`.env.local` dosyandaki değerleri güncelle:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dfasgevjl"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="analysisday_uploads"
NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET="analysisday_receipts"
```

---

## 🔄 Uygulamayı Yeniden Başlat

```bash
# Geliştirme sunucusunu yeniden başlat
npm run dev

# Veya production build
npm run build
npm start
```

---

## ✅ Test Et

Admin panelinden görsel yüklemeyi dene. Artık hata almayacaksın! 🎉
