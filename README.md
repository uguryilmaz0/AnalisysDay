# AnalysisDay - Sports Statistics Analysis & Data Reading Education Platform

**AnalysisDay**, kullanıcılara spor istatistik analizi ve veri okuma eğitimi sunan profesyonel bir Next.js eğitim platformudur.

## 🚀 Özellikler

### Frontend & UI

- ✅ **Next.js 15** - App Router, Server Components, React 19
- 🎨 **Tailwind CSS v4** - Modern dark mode tasarım
- 📱 **Responsive Design** - Mobil uyumlu
- 🔒 **Premium İçerik Sistemi** - Kilit ekranı ile içerik koruması

### Backend & Database

- 🔥 **Firebase Authentication** - Google'ın güvenlik standardı
- 📊 **Firestore** - Real-time NoSQL database
- ☁️ **Cloudinary** - Görsel CDN ve yönetimi
- 🛡️ **Security Rules** - Server-side güvenlik

### Güvenlik & Compliance

- 🔐 **Enhanced Rate Limiting** - Multi-action brute force koruması
- 📝 **Error Tracking (Sentry)** - Production monitoring
- ⚖️ **18+ Age Verification** - Yaş onay sistemi
- 📋 **KVKK Uyumlu** - Türk veri koruma yasalarına uygun
- 🔍 **Environment Validation** - Otomatik config kontrolü

### Kullanıcı Özellikleri

- 👤 **Username Sistemi** - Email veya kullanıcı adı ile giriş
- 📧 **Email Doğrulama** - Kayıt sonrası verification
- 💳 **Manuel Ödeme** - IBAN ile ödeme + dekont yükleme
- 📱 **WhatsApp Entegrasyonu** - Yüzen destek butonu
- 👥 **Kullanıcı Profili** - GDPR uyumlu hesap yönetimi
- ⏰ **30 Günlük Abonelik** - Otomatik süre takibi

### Admin Paneli

- 📊 **Analiz Yönetimi** - Çoklu görsel yükleme (Cloudinary)
- 👥 **Kullanıcı Yönetimi** - Premium verme, abonelik iptal
- 💰 **Ödeme Onayı** - Dekont kontrolü ve onaylama
- 📈 **Dashboard** - Tablo bazlı veri görüntüleme

## 📋 Kurulum

**Hızlı Başlangıç:** [QUICK_START.md](./QUICK_START.md) dosyasına bakın (5 dakika)

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Variables

`.env.local` dosyası oluşturun (`.env.local.example` şablonunu kullanın):

```env
# Firebase (zorunlu)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... diğer Firebase değişkenleri

# Super Admin (zorunlu - ilk admin kullanıcısı)
NEXT_PUBLIC_SUPER_ADMIN_EMAILS=admin@yourcompany.com

# Cloudinary (zorunlu)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=analysis_preset
NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET=receipt_preset

# App Config (zorunlu)
NEXT_PUBLIC_WHATSAPP_NUMBER=905551234567
NEXT_PUBLIC_IBAN=TR00 0000 0000 0000 0000 0000 00
NEXT_PUBLIC_BANK_NAME=Banka Adı
NEXT_PUBLIC_ACCOUNT_HOLDER=Hesap Sahibi
NEXT_PUBLIC_SUBSCRIPTION_PRICE=500

# Email (opsiyonel - destek formu için)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=support@yourdomain.com

# Sentry (opsiyonel - error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

**⚠️ Önemli Notlar:**

- `NEXT_PUBLIC_SUPER_ADMIN_EMAILS`: Bu email ile kayıt olunca otomatik admin olursunuz
- Development'ta eksik opsiyonel değişkenler için sadece uyarı gösterilir
- Production'da tüm zorunlu değişkenler olmalı, yoksa uygulama başlamaz

### 3. Firebase Kurulumu

Detaylı kurulum için: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**Kısaca:**

1. [Firebase Console](https://console.firebase.google.com)'da proje oluştur
2. Authentication, Firestore, Storage aktif et
3. Config değerlerini `.env.local`'e ekle
4. Security Rules'ları deploy et

### 4. Cloudinary Kurulumu

1. [Cloudinary Console](https://cloudinary.com/console)'da hesap oluştur
2. Settings > Upload > Upload Presets:
   - `analysis_preset` (analiz görselleri için)
   - `receipt_preset` (dekont görselleri için)
3. Cloud Name ve Preset isimlerini `.env.local`'e ekle

### 5. Geliştirme Sunucusu

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacak.

## 📁 Proje Yapısı

```
AnalysisDay/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin paneli (protected)
│   ├── analysis/            # Günlük analiz (premium)
│   ├── login/               # Giriş sayfası
│   ├── register/            # Kayıt sayfası
│   ├── profile/             # Kullanıcı profili
│   ├── pricing/             # Ücretler ve ödeme
│   ├── api/                 # API routes
│   │   └── support/         # Destek formu endpoint
│   ├── layout.tsx           # Root layout + ErrorBoundary
│   └── page.tsx             # Ana sayfa
│
├── components/              # Shared components
│   ├── Header.tsx          # Navigation header
│   ├── Footer.tsx          # Site footer
│   └── WhatsAppWidget.tsx  # Floating WhatsApp button
│
├── contexts/
│   └── AuthContext.tsx     # Firebase Auth context
│
├── features/               # Feature-based modules
│   └── admin/
│       ├── components/     # Admin panel components
│       ├── services/       # Admin business logic
│       ├── hooks/          # Admin custom hooks
│       └── stores/         # Zustand state management
│
├── lib/                    # Core utilities
│   ├── firebase.ts         # Firebase client SDK
│   ├── db.ts              # Database helpers
│   ├── cloudinary.ts      # Cloudinary upload
│   ├── validateEnv.ts     # Environment validation
│   ├── logger.ts          # Centralized logging
│   └── rateLimitEnhanced.ts # Rate limiting
│
├── shared/                 # Shared utilities
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   └── ErrorBoundary.tsx
│   ├── hooks/             # Custom React hooks
│   └── services/          # Base service classes
│
└── types/                 # TypeScript types
    └── index.ts           # Global type definitions
```

### Mimari Kararlar

**Current (Phase 1):** Firebase Backend

- ✅ Client-side Firebase SDK
- ✅ Firestore Security Rules (server-side güvenlik)
- ✅ Real-time updates
- ✅ $0/month maliyet

**Planned (Phase 2):** Hybrid - Firebase + Next.js API Routes

- 🔄 Admin işlemleri → API Routes
- 🔄 Payment işlemleri → API Routes
- 🔄 Upstash Redis rate limiting
- 🔄 Server-side validation
- 🔄 Still $0/month

## 🗄️ Veritabanı Yapısı

### users Koleksiyonu

```typescript
{
  uid: string;
  email: string;
  username: string;
  role: "user" | "admin";
  isPaid: boolean;
  subscriptionEndDate: Timestamp | null;
  lastPaymentDate: Timestamp | null;
  emailNotifications: boolean;
  emailVerified: boolean;
  createdAt: Timestamp;
}
```

### daily_analysis Koleksiyonu

```typescript
{
  id: string;
  imageUrls: string[];
  title: string;
  description?: string;
  date: Timestamp;
  isVisible: boolean;
  createdBy: string;
}
```

### payment_requests Koleksiyonu

```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Timestamp;
  processedAt?: Timestamp;
  processedBy?: string;
}
```

## 👤 İlk Admin Kullanıcısı

**Otomatik Admin Sistemi:**

1. `.env.local` dosyasına email adresinizi ekleyin:

   ```env
   NEXT_PUBLIC_SUPER_ADMIN_EMAILS=your@email.com
   ```

2. Bu email ile `/register` sayfasından kayıt olun

3. **Otomatik olarak Super Admin olursunuz!** 🎉

4. `/admin` paneline erişerek:
   - Analiz yükleyebilirsiniz
   - Kullanıcıları yönetebilirsiniz
   - Ödemeleri onaylayabilirsiniz
   - Diğer adminleri atayabilirsiniz

**Admin Rolleri:**

- 👑 **Super Admin:** Gizli admin (listede görünmez), diğer adminleri yönetebilir
- 🛡️ **Normal Admin:** Analiz ve kullanıcı yönetimi yapabilir
- 💎 Tüm adminler otomatik premium erişime sahiptir

**Admin Yönetimi:** [ADMIN_MANAGEMENT.md](./ADMIN_MANAGEMENT.md)

## 🎯 Kullanım Senaryoları

### Kullanıcı Akışı

1. Ana sayfayı ziyaret et
2. Kayıt ol (email + kullanıcı adı + şifre)
3. Email doğrulama linkine tıkla
4. Kullanıcı adı veya email ile giriş yap
5. Pricing sayfasından ödeme yap
6. Dekont yükle veya WhatsApp ile gönder
7. Admin onayını bekle (15 dk)
8. Premium içeriğe erişim

### Admin Akışı

1. Admin paneline giriş yap (`/admin`)
2. **Analiz Yükle** sekmesinden yeni analiz ekle (Cloudinary'e otomatik yüklenir)
3. **Tüm Analizler** sekmesinden son 7 analizi tablo formatında görüntüle
   - Her görseli tek tek indirebilirsiniz
   - Analizleri silebilirsiniz
4. **Kullanıcılar** sekmesinden kullanıcı yönetimi:
   - Kullanıcıları premium yap (30 gün)
   - Abonelik iptal et
   - Kullanıcı sil

## 🚀 Deploy (Vercel)

### 1. Vercel'e Deploy

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. **New Project** > GitHub repo'nuzu seçin
3. **Environment Variables** ekleyin (`.env.local` içeriği)
4. **Deploy**

### 2. Environment Variables (Vercel)

⚠️ **Tüm değişkenleri eklemeyi unutmayın:**

- Firebase config (6 değişken)
- Cloudinary config (3 değişken)
- App config (6 değişken)
- Super Admin email
- Resend API key (destek formu için)
- Sentry DSN (error tracking için)

### 3. Firebase Rules Deploy

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 4. Post-Deploy Checklist

- [ ] Environment variables kontrolü
- [ ] Firebase Rules deployed
- [ ] Admin kullanıcısı oluşturuldu
- [ ] Cloudinary presets hazır
- [ ] WhatsApp numarası aktif
- [ ] IBAN bilgileri doğru
- [ ] Email servisi çalışıyor
- [ ] Error tracking (Sentry) aktif

**Detaylı Vercel kurulumu:** README.md'nin alt kısmındaki "Deploy" bölümü

## 🔧 Geliştirme

### Komutlar

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint check
```

### Tech Stack

- **Framework:** Next.js 15.0.3 (App Router)
- **React:** 19.2.0 (Latest)
- **TypeScript:** 5.x (Strict mode)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand 5.0.8 (Admin panel)
- **Backend:** Firebase 12.6.0
  - Authentication
  - Firestore (Database)
  - Storage (File uploads)
- **CDN:** Cloudinary (Images)
- **Email:** Resend 6.5.2
- **Error Tracking:** Sentry
- **Deployment:** Vercel

### Yol Haritası

**✅ Phase 1: Firebase Backend (CURRENT)**

- Client-side Firebase SDK
- Firestore Security Rules
- Real-time updates
- $0/month cost

**🔄 Phase 2: Hybrid Architecture (2-4 weeks)**

- Firebase (user auth, read operations)
- Next.js API Routes (admin ops, payments)
- Upstash Redis (server-side rate limiting)
- Still $0/month

**🔜 Phase 3: Future (if needed)**

- Advanced analytics
- Mobile app
- Multiple payment gateways
- More automation

### Dokümantasyon

- **[README.md](./README.md)** - Bu dosya (genel bakış)
- **[QUICK_START.md](./QUICK_START.md)** - 5 dakikada kurulum
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase detaylı kurulum
- **[ADMIN_MANAGEMENT.md](./ADMIN_MANAGEMENT.md)** - Admin kullanıcı yönetimi
- **[.env.local.example](./.env.local.example)** - Environment variables şablonu

## 🛡️ Güvenlik

### Mevcut Güvenlik Katmanları

- ✅ **Firebase Authentication** - Google'ın enterprise-grade güvenlik
- ✅ **Firestore Security Rules** - Server-side veri koruması (hacklenemez)
- ✅ **Storage Security Rules** - Dosya erişim kontrolü
- ✅ **Multi-Action Rate Limiting** - Brute force koruması
  - Login: 5 attempt / 15 min
  - Register: 3 attempt / 1 hour
  - Payment: 5 attempt / 1 hour
  - Support: 3 attempt / 30 min
  - Password Reset: 3 attempt / 1 hour
- ✅ **Environment Validation** - Startup'ta config kontrolü
- ✅ **Error Boundary** - React error handling
- ✅ **Sentry Integration** - Production error tracking
- ✅ **Email Verification** - Fake account koruması
- ✅ **18+ Age Verification** - Yaş onay sistemi
- ✅ **KVKK Compliance** - Veri koruma uyumluluğu
- ✅ **HTTPS Only** - Tüm iletişim şifreli

### Firebase Public API Keys Güvenli Mi?

**EVET!** Firebase API key'leri public olabilir:

- Sadece hangi Firebase projesine bağlanılacağını belirler
- Domain restriction ile korunur (Firebase Console)
- Gerçek güvenlik Firestore Security Rules'da (server-side)
- Milyonlarca uygulama bu şekilde çalışır

```javascript
// ✅ Bu key'ler public olabilir
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...

// ✅ Gerçek güvenlik burada (server-side)
firestore.rules:
  allow read: if request.auth != null && isPremiumOrAdmin();
  allow write: if request.auth != null && isAdmin();
```

### Planned Security (Phase 2)

- 🔄 Server-side rate limiting (Upstash Redis)
- 🔄 API authentication middleware
- 🔄 Input validation (Zod)
- 🔄 CSRF protection

## 📞 Destek

### Hızlı Bağlantılar

- **Firebase Console:** https://console.firebase.google.com
- **Cloudinary Dashboard:** https://cloudinary.com/console
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Dashboard:** https://sentry.io

### Sorun Giderme

**Build hatası alıyorsanız:**

1. `.env.local` dosyasının var olduğundan emin olun
2. Tüm zorunlu environment variables'ların dolu olduğunu kontrol edin
3. `npm run build` çalıştırarak hataları görün

**Dev server başlamıyorsa:**

1. `lib/validateEnv.ts` environment validation kontrolü yapıyor
2. Development'ta eksik opsiyonel değişkenler sadece uyarı verir
3. Zorunlu değişkenler eksikse hata alırsınız

**Daha fazla yardım:** [QUICK_START.md](./QUICK_START.md) - Troubleshooting bölümü

---

## 📝 Lisans

Bu proje özel mülkiyettir.

---

**Geliştirici:** AnalysisDay Team  
**Versiyonlama:** Semantic Versioning (v1.0.0)  
**Son Güncelleme:** Kasım 2025  
**Status:** Production Ready ✅
