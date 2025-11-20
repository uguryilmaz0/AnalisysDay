# AnalysisDay - Daily Match Analysis & Betting Predictions

**AnalysisDay**, premium kullanıcılara günlük profesyonel maç analizleri ve iddaa tahminleri sunan bir Next.js 15 uygulamasıdır.

## 🚀 Özellikler

- ✅ **Next.js 15** - En yeni App Router ve Server Components
- 🔥 **Firebase** - Authentication, Firestore, Storage
- ☁️ **Cloudinary** - Görsel yükleme ve yönetimi
- 🎨 **Tailwind CSS v4** - Modern ve responsive dark mode tasarım
- 🔒 **Premium İçerik Sistemi** - Kilit ekranı ile içerik koruması
- 💳 **Manuel Ödeme Sistemi** - IBAN ile ödeme ve WhatsApp desteği
- 📊 **Admin Paneli** - Analiz yükleme ve kullanıcı yönetimi
- 📱 **WhatsApp Entegrasyonu** - Yüzen WhatsApp butonu
- 📧 **Email Doğrulama** - Kayıt sonrası otomatik email verification
- 👤 **Kullanıcı Adı Sistemi** - Email veya username ile giriş
- 🛡️ **Rate Limiting** - Brute force koruması
- 👤 **Kullanıcı Profili** - GDPR uyumlu hesap yönetimi
- ⏰ **30 Günlük Abonelik** - Otomatik süre takibi

## 📋 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Firebase Kurulumu

Kısaca:

1. Firebase Console'da yeni proje oluşturun
2. Authentication, Firestore ve Storage'ı aktif edin
3. `.env.local` dosyasını doldurun

### 3. Ortam Değişkenlerini Ayarla

`.env.local` dosyasını oluşturun (`.env.local.example` dosyasını kopyalayın):

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=905551234567

# IBAN
NEXT_PUBLIC_IBAN=TR00 0000 0000 0000 0000 0000 00
NEXT_PUBLIC_BANK_NAME=Banka Adı
NEXT_PUBLIC_ACCOUNT_HOLDER=Hesap Sahibi

# Fiyat
NEXT_PUBLIC_SUBSCRIPTION_PRICE=500

# Super Admin (ÖNEMLİ!)
# İlk admin kullanıcınızın email adresini buraya ekleyin
NEXT_PUBLIC_SUPER_ADMIN_EMAILS=admin@yourcompany.com
```

**⚠️ Önemli:** `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` alanına kendi email adresinizi ekleyin. Bu email ile kayıt olduğunuzda otomatik olarak Super Admin olacaksınız!

### 4. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
d:\analiz\
├── app/
│   ├── admin/          # Admin paneli
│   ├── analysis/       # Günün analizi (Premium)
│   ├── login/          # Giriş sayfası
│   ├── pricing/        # Ücretler ve ödeme
│   ├── register/       # Kayıt sayfası
│   ├── layout.tsx      # Ana layout
│   └── page.tsx        # Ana sayfa
├── components/
│   ├── Header.tsx      # Header bileşeni
│   └── WhatsAppWidget.tsx
├── contexts/
│   └── AuthContext.tsx # Auth yönetimi
├── lib/
│   ├── firebase.ts     # Firebase config
│   └── db.ts           # Database fonksiyonları
├── types/
│   └── index.ts        # TypeScript tipleri
└── .env.local          # Ortam değişkenleri
```

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

## 👤 İlk Admin Kullanıcısı (Otomatik!)

1. `.env.local` dosyasında `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` alanına email adresinizi ekleyin
2. `/register` sayfasından bu email ile kayıt olun
3. **Otomatik olarak Super Admin olacaksınız!** 🎉
4. `/admin` sayfasına erişerek diğer adminleri yönetebilirsiniz

**Admin Özellikleri:**

- 👑 **Super Admin:** Diğer adminleri atayabilir/kaldırabilir, gizli yönetici (listede görünmez)
- 🛡️ **Normal Admin:** Analiz yükleyebilir, kullanıcıları yönetebilir
- 💎 Admin rolü otomatik premium erişim sağlar (ayrıca ödeme gereksiz)

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

### 1. GitHub'a Push

```bash
git add .
git commit -m "Update"
git push origin main
```

### 2. Vercel'e Deploy

1. https://vercel.com adresine gidin
2. **New Project** > GitHub repo'nuzu seçin
3. **Environment Variables** bölümüne `.env.local` içeriğindeki **TÜM** değişkenleri ekleyin:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - `NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_IBAN`
   - `NEXT_PUBLIC_BANK_NAME`
   - `NEXT_PUBLIC_ACCOUNT_HOLDER`
   - `NEXT_PUBLIC_SUBSCRIPTION_PRICE`
4. **Deploy** butonuna tıklayın

⚠️ **Önemli:** Environment variables olmadan build başarısız olur!

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucu
npm start

# Lint kontrolü
npm run lint
```

## 🛡️ Güvenlik

- Firebase Authentication ile güvenli giriş
- Firestore Security Rules ile veri koruması
- Storage Security Rules ile dosya koruması
- Server-side abonelik kontrolü
- Admin yetkisi kontrolü

## 📝 Lisans

Bu proje özel mülkiyettir.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için WhatsApp: [+90 555 123 4567]

---

**Geliştirici:** AnalizGunu Team  
**Versiyon:** 1.0.0  
**Son Güncelleme:** Kasım 2025
