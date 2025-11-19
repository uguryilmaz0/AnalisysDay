# 🚀 Vercel Deploy Rehberi

Bu rehber, AnalysisDay projesini Vercel'e deploy etmek için gereken tüm adımları içermektedir.

---

## ✅ Ön Hazırlık

Aşağıdakilerin hazır olduğundan emin olun:

- ✅ GitHub repository'niz hazır
- ✅ `.env.local` dosyanız doğru yapılandırılmış
- ✅ Firebase projesi aktif
- ✅ Cloudinary hesabı aktif

---

## 📝 Adım Adım Deploy

### 1. GitHub'a Push Edin

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 2. Vercel'e Giriş Yapın

1. https://vercel.com adresine gidin
2. **Sign Up** veya **Log in** ile GitHub hesabınızla giriş yapın

### 3. Yeni Proje Oluşturun

1. **Add New...** → **Project** butonuna tıklayın
2. **Import Git Repository** bölümünde repo'nuzu bulun
3. **Import** butonuna tıklayın

### 4. Proje Ayarlarını Yapın

**Framework Preset:** Next.js (otomatik seçilir)

**Root Directory:** `./` (default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

### 5. Environment Variables Ekleyin

**ÇOK ÖNEMLİ!** Aşağıdaki **TÜM** değişkenleri ekleyin:

`.env.local` dosyanızdaki değerleri **birebir** kopyalayın:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=analysisday.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=analysisday
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=analysisday.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=analysisday_uploads
NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET=analysisday_receipts

NEXT_PUBLIC_WHATSAPP_NUMBER=905551234567

NEXT_PUBLIC_IBAN=TR00 0000 0000 0000 0000 0000 00
NEXT_PUBLIC_BANK_NAME=Ziraat Bankası
NEXT_PUBLIC_ACCOUNT_HOLDER=Ahmet Yılmaz

NEXT_PUBLIC_SUBSCRIPTION_PRICE=600
```

**Nasıl Eklenir:**

1. **Environment Variables** bölümünü bulun
2. Her bir değişken için:
   - **Name:** Değişken adı (örn: `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value:** Değişken değeri (örn: `AIza...`)
   - **Environment:** Production, Preview, Development (hepsini seçin)
3. **Add** butonuna tıklayın

### 6. Deploy Edin

1. Tüm environment variables'ları ekledikten sonra
2. **Deploy** butonuna tıklayın
3. ⏳ Build süreci başlayacak (2-3 dakika)

### 7. Deploy Tamamlandı! 🎉

Build başarılı olduktan sonra:

- ✅ **Visit** butonuna tıklayarak sitenizi görün
- ✅ Domain adresiniz: `https://your-project.vercel.app`

---

## 🔄 Otomatik Deploy

Artık her `git push` yaptığınızda Vercel **otomatik** olarak deploy edecek!

```bash
# Değişiklik yapın
git add .
git commit -m "Update"
git push origin main

# Vercel otomatik olarak yeni build yapacak! 🚀
```

---

## 🌍 Özel Domain Bağlama (Opsiyonel)

Kendi domain adresinizi bağlamak için:

1. Vercel Dashboard → Projeniz → **Settings** → **Domains**
2. **Add** butonuna tıklayın
3. Domain adresinizi girin (örn: `analysisday.com`)
4. DNS ayarlarınızı Vercel'in verdiği bilgilere göre güncelleyin
5. ⏳ 24-48 saat içinde aktif olur

---

## ⚙️ Vercel Ayarları

### Build & Development Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### Regions

Projeniz varsayılan olarak en yakın bölgede (Europa - Frankfurt) çalışacak.

---

## 🔍 Sorun Giderme

### ❌ Build Failed: Missing Environment Variables

**Sorun:** Environment variables tanımlanmamış

**Çözüm:**
1. Vercel Dashboard → Projeniz → **Settings** → **Environment Variables**
2. Eksik değişkenleri ekleyin
3. **Deployments** sekmesinden **Redeploy** yapın

### ❌ Firebase Error: auth/invalid-api-key

**Sorun:** Firebase API key yanlış veya eksik

**Çözüm:**
1. `.env.local` dosyanızdaki `NEXT_PUBLIC_FIREBASE_API_KEY` değerini kontrol edin
2. Vercel'de aynı değerin ekli olduğundan emin olun
3. Redeploy yapın

### ❌ Cloudinary Upload Failed

**Sorun:** Cloudinary credentials yanlış

**Çözüm:**
1. Cloudinary Dashboard'dan bilgileri kontrol edin
2. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` değerini kontrol edin
3. Upload preset'lerin "Unsigned" olduğundan emin olun

### ❌ 404 - Page Not Found

**Sorun:** Sayfa routing hatası

**Çözüm:**
1. Next.js App Router yapısını kontrol edin
2. `app/` klasöründe dosya yapısını kontrol edin
3. Build loglarını inceleyin

---

## 📊 Production Checklist

Deploy etmeden önce kontrol edin:

- ✅ Firebase Authentication aktif
- ✅ Firestore Database oluşturulmuş
- ✅ Firestore Security Rules eklenmiş
- ✅ Firestore Indexes oluşturulmuş
- ✅ Cloudinary hesabı aktif
- ✅ Cloudinary Upload Presets oluşturulmuş
- ✅ `.env.local` tüm değişkenler dolu
- ✅ Vercel'de tüm environment variables eklendi
- ✅ İlk admin kullanıcısı oluşturuldu

---

## 🎯 Post-Deploy Adımları

Deploy başarılı olduktan sonra:

### 1. İlk Admin Kullanıcısını Oluşturun

```
1. https://your-project.vercel.app/register adresine gidin
2. Admin email ile kayıt olun (örn: admin@analysisday.com)
3. Firebase Console → Firestore → users koleksiyonu
4. Kullanıcınızın role alanını "admin" yapın
```

### 2. Test Edin

- ✅ Kayıt/Giriş işlemi
- ✅ Admin paneline erişim
- ✅ Analiz yükleme
- ✅ Ödeme talebi oluşturma
- ✅ Premium içerik görüntüleme

### 3. Firebase Domain'i Ekleyin (Önemli!)

Firebase Authentication için Vercel domain'inizi whitelist'e ekleyin:

```
1. Firebase Console → Authentication → Settings
2. Authorized domains bölümüne gidin
3. Vercel domain'inizi ekleyin: your-project.vercel.app
4. (Özel domain varsa onu da ekleyin: analysisday.com)
```

---

## 📈 Analytics & Monitoring

Vercel otomatik olarak şunları sağlar:

- 📊 **Analytics:** Ziyaretçi istatistikleri
- ⚡ **Speed Insights:** Performans metrikleri
- 🔍 **Real-time Logs:** Canlı log görüntüleme
- 🐛 **Error Tracking:** Hata takibi

Dashboard'dan erişebilirsiniz.

---

## 💰 Pricing

**Hobby Plan (Ücretsiz):**
- ✅ Sınırsız deploy
- ✅ 100GB bandwidth/ay
- ✅ Otomatik HTTPS
- ✅ Serverless fonksiyonlar

Bu proje için Hobby plan yeterlidir! 🎉

---

## 🔗 Yararlı Linkler

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)

---

## 📞 Destek

Sorun yaşarsanız:

1. Vercel Dashboard → Projeniz → **Logs** bölümünü kontrol edin
2. Build loglarını inceleyin
3. Firebase Console'da error loglarına bakın
4. Browser console'unu kontrol edin (F12)

---

**Başarılı deploy! 🚀**

Site canlıda: `https://your-project.vercel.app`
