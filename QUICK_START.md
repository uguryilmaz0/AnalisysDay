# 🚀 AnalysisDay - Hızlı Başlangıç Rehberi

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Firebase hesabı
- Cloudinary hesabı

---

## ⚡ 5 Dakikada Başlat

### 1️⃣ Projeyi Klonla ve Paketleri Yükle

```bash
git clone https://github.com/uguryilmaz0/AnalisysDay.git
cd AnalisysDay
npm install
```

### 2️⃣ Environment Dosyasını Oluştur

```bash
# .env.local.example dosyasını kopyala
cp .env.local.example .env.local

# Ardından .env.local dosyasını düzenle
```

### 3️⃣ Firebase Kurulumu (5 dakika)

1. https://console.firebase.google.com adresine git
2. "Create a project" > Proje adı gir > Create
3. ⚙️ (Settings) > Project settings > Scroll down
4. "Add app" > Web (</>)
5. Config değerlerini kopyala > `.env.local`'e yapıştır

**Firebase Authentication Aktifleştir:**

1. Build > Authentication > Get started
2. Sign-in method > Email/Password > Enable > Save

**Firestore Database Oluştur:**

1. Build > Firestore Database > Create database
2. Start in **production mode** (rules zaten hazır)
3. Location: europe-west1 (veya size yakın)
4. Enable

**Security Rules Deploy Et:**

```bash
# Terminal'de
firebase login
firebase init firestore
# Var olan firestore.rules dosyasını kullan
firebase deploy --only firestore:rules
```

### 4️⃣ Cloudinary Kurulumu (3 dakika)

1. https://cloudinary.com adresine git
2. Sign up (ücretsiz)
3. Dashboard'da:
   - Cloud name kopyala
   - Settings > Upload > Upload presets
   - "Add upload preset" > Unsigned > Save
   - Preset name kopyala

**.env.local'e ekle:**

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET=your_preset_name
```

### 5️⃣ Diğer Ayarlar (1 dakika)

`.env.local` dosyasında düzenle:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=905551234567  # WhatsApp numaranız
NEXT_PUBLIC_IBAN=TR00 0000 0000 0000 0000 0000 00
NEXT_PUBLIC_BANK_NAME=Banka Adınız
NEXT_PUBLIC_ACCOUNT_HOLDER=Adınız Soyadınız
NEXT_PUBLIC_SUBSCRIPTION_PRICE=500
NEXT_PUBLIC_SUPER_ADMIN_EMAILS=admin@yourcompany.com  # Admin email'iniz
```

### 6️⃣ Uygulamayı Başlat

```bash
npm run dev
```

🎉 Tarayıcıda aç: http://localhost:3000

---

## 👑 İlk Admin Hesabını Oluştur

1. `.env.local`'de `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` alanına email'inizi ekleyin
2. `npm run dev` ile uygulamayı başlatın
3. http://localhost:3000/register adresine gidin
4. **Aynı email ile kayıt olun**
5. ✅ Otomatik olarak Super Admin olacaksınız!
6. http://localhost:3000/admin adresine gidip kontrol edin

---

## 📊 Firebase Güvenlik (Önemli!)

### Firestore Security Rules

`firestore.rules` dosyanızı Firebase'e deploy edin:

```bash
firebase deploy --only firestore:rules
```

### İndexleme (Username Login İçin)

Firebase Console > Firestore > Indexes > Create Index:

- Collection: `users`
- Field: `username` (Ascending)
- Query scope: Collection

---

## 🧪 Test Et

### 1. Kayıt ve Giriş

- ✅ Email ile kayıt ol
- ✅ Email doğrulama al
- ✅ Giriş yap (email veya username)

### 2. Admin Panel

- ✅ `/admin` adresine git
- ✅ Analiz yükle
- ✅ Kullanıcı yönet
- ✅ Ödeme onayı

### 3. Premium İçerik

- ✅ Premium olmadan `/analysis` - Kilitli
- ✅ Admin olarak `/analysis` - Açık
- ✅ Premium kullanıcı - Açık

---

## ⚙️ Opsiyonel Kurulumlar

### Resend (Email Gönderimi)

1. https://resend.com > Sign up
2. API Keys > Create API Key
3. `.env.local`'e ekle:

```env
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 🚀 Production'a Deploy (Vercel)

### 1. GitHub'a Push

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercel'e Deploy

1. https://vercel.com adresine git
2. Import Git Repository
3. GitHub repo'nuzu seç
4. **Environment Variables ekle** (ÇOK ÖNEMLİ!)
   - `.env.local` dosyasındaki TÜM değişkenleri ekle
5. Deploy

### 3. Firebase Authorized Domains

Firebase Console > Authentication > Settings > Authorized domains

- Vercel domain'inizi ekleyin: `your-app.vercel.app`

---

## 🐛 Sorun Giderme

### "Environment validation failed" Hatası

```bash
# .env.local dosyası eksik veya hatalı
cp .env.local.example .env.local
# Dosyayı düzenle ve zorunlu alanları doldur
```

### Firebase Permission Denied

```bash
# Firebase rules deploy edilmemiş
firebase deploy --only firestore:rules
# 1-2 dakika bekle, rules aktif olsun
```

### "Username index" Hatası

```bash
# Firebase Console > Firestore > Indexes
# Collection: users, Field: username (Ascending)
```

### Build Hatası

```bash
# Cache temizle
rm -rf .next
npm run build
```

---

## 📚 Detaylı Dökümantasyon

- **Genel:** `README.md`
- **Firebase:** `FIREBASE_SETUP.md`
- **Admin:** `ADMIN_MANAGEMENT.md`
- **API Stratejisi:** `API_MIGRATION_STRATEGY.md`
- **Yapılacaklar:** `IMPLEMENTATION_CHECKLIST.md`

---

## 💡 İpuçları

### Development

- Hot reload aktif - Kodları değiştir, otomatik yenilenir
- Console'da logları kontrol et
- Firebase Console'dan database'i izle

### Production

- Environment variables'ı kontrol et
- Firebase rules deploy edilmiş mi?
- Sentry kuruldu mu?
- Test senaryolarını çalıştır

---

## 🎯 Sonraki Adımlar

1. ✅ Uygulamayı başlat ve test et
2. ✅ İlk admin hesabını oluştur
3. ✅ Demo analiz yükle
4. ✅ Test kullanıcısı oluştur
5. ✅ Yasal sayfaları gözden geçir
6. ✅ Production'a deploy

---

**Sorular için:**

- GitHub Issues: https://github.com/uguryilmaz0/AnalisysDay/issues
- Email: [Email adresiniz]

**İyi çalışmalar! 🚀**
