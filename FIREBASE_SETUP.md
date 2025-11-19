# 🔥 AnalysisDay - Firebase & Cloudinary Kurulum Rehberi

Bu rehber, Firebase ve Cloudinary'i projenize nasıl entegre edeceğinizi **adım adım** anlatmaktadır.

---

## 📋 İçindekiler

1. [Firebase Projesi Oluşturma](#1-firebase-projesi-oluşturma)
2. [Authentication Kurulumu](#2-authentication-kurulumu)
3. [Firestore Veritabanı Kurulumu](#3-firestore-veritabanı-kurulumu)
4. [Cloudinary Kurulumu](#4-cloudinary-kurulumu)
5. [Ortam Değişkenlerini Ayarlama](#5-ortam-değişkenlerini-ayarlama)
6. [İlk Admin Kullanıcısı Oluşturma](#6-i̇lk-admin-kullanıcısı-oluşturma)
7. [Vercel Deploy](#7-vercel-deploy)

---

## 1. Firebase Projesi Oluşturma

### Adım 1: Firebase Console'a Git

1. https://console.firebase.google.com adresine gidin
2. Google hesabınızla giriş yapın
3. **"Add project"** (Proje Ekle) butonuna tıklayın

### Adım 2: Proje Bilgilerini Girin

1. **Proje Adı:** `AnalysisDay` (veya istediğiniz bir isim)
2. **Google Analytics:** İsteğe bağlı (önerim: Evet, aktif edin)
3. **Create project** butonuna tıklayın

### Adım 3: Web Uygulaması Ekle

1. Firebase Console'da projenize girin
2. Üst kısımda **"</>"** (Web) ikonuna tıklayın
3. **App nickname:** `AnalysisDay Web`
4. **Firebase Hosting:** Şimdilik işaretlemeyin (Vercel kullanacağız)
5. **Register app** butonuna tıklayın

### Adım 4: Firebase Config Bilgilerini Kopyalayın

Ekranda şu şekilde bir kod göreceksiniz:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "analysisday.firebaseapp.com",
  projectId: "analysisday",
  storageBucket: "analysisday.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc...",
};
```

**Bu bilgileri bir kenara not edin!** Sonra `.env.local` dosyasına yazacağız.

---

## 2. Authentication Kurulumu

### Adım 1: Authentication'ı Aktif Et

1. Sol menüden **"Build"** > **"Authentication"** seçin
2. **"Get started"** butonuna tıklayın

### Adım 2: Email/Password Yöntemini Aktif Et

1. **"Sign-in method"** sekmesine gidin
2. **"Email/Password"** satırına tıklayın
3. **Enable** (Etkinleştir) butonunu açın
4. **"Email link (passwordless sign-in)"** kapalı kalabilir
5. **Save** butonuna tıklayın

✅ **Authentication hazır!**

---

## 3. Firestore Veritabanı Kurulumu

### Adım 1: Firestore'u Aktif Et

1. Sol menüden **"Build"** > **"Firestore Database"** seçin
2. **"Create database"** butonuna tıklayın

### Adım 2: Güvenlik Modunu Seç

1. **"Start in production mode"** seçin (Güvenli başlangıç)
2. **Next** butonuna tıklayın

### Adım 3: Lokasyon Seç

1. **Lokasyon:** `eur3 (europe-west)` öneriyorum (Türkiye'ye yakın)
2. **Enable** butonuna tıklayın

### Adım 4: Firestore Güvenlik Kurallarını Ayarla

1. **"Rules"** sekmesine gidin
2. Aşağıdaki kuralları yapıştırın:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users koleksiyonu
    match /users/{userId} {
      // Herkes kendi kaydını okuyabilir
      allow read: if request.auth != null && request.auth.uid == userId;

      // Sadece kayıt sırasında yazılabilir
      allow create: if request.auth != null && request.auth.uid == userId;

      // Sadece adminler güncelleyebilir
      allow update: if request.auth != null &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Daily Analysis koleksiyonu
    match /daily_analysis/{analysisId} {
      // Premium üyeler okuyabilir
      allow read: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isPaid == true;

      // Sadece adminler yazabilir, güncelleyebilir, silebilir
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Payment Requests koleksiyonu
    match /payment_requests/{requestId} {
      // Kullanıcı kendi taleplerini görebilir
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');

      // Kullanıcılar kendi taleplerini oluşturabilir
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;

      // Sadece adminler güncelleyebilir/silebilir
      allow update, delete: if request.auth != null &&
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. **Publish** butonuna tıklayın

### Adım 5: İndeksleri Oluştur (Önemli!)

1. **"Indexes"** sekmesine gidin
2. Şu indeksleri **manuel olarak** ekleyin:

#### İndeks 1: Daily Analysis

- **Collection ID:** `daily_analysis`
- **Fields:**
  - `isVisible` - Ascending
  - `date` - Descending
- **Query scope:** Collection
- **Create index** butonuna tıklayın

#### İndeks 2: Payment Requests

- **Collection ID:** `payment_requests`
- **Fields:**
  - `status` - Ascending
  - `requestedAt` - Descending
- **Query scope:** Collection
- **Create index** butonuna tıklayın

⏳ İndeksler 2-5 dakika içinde hazır olacak.

---

## 4. Cloudinary Kurulumu

Görsel yükleme işlemleri için Cloudinary kullanacağız.

### Adım 1: Cloudinary Hesabı Oluştur

1. https://cloudinary.com adresine gidin
2. **Sign Up for Free** butonuna tıklayın
3. Email ile ücretsiz hesap oluşturun

### Adım 2: API Bilgilerini Al

1. Cloudinary Dashboard'a girin
2. Üst kısımda **Product Environment Credentials** bölümünü göreceksiniz:
   - **Cloud Name**: `dxxxx` (sizin cloud name)
   - **API Key**: `123456789012345` (sizin API key)
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz` (sizin API secret)

**Bu bilgileri bir kenara not edin!** Sonra `.env.local` dosyasına yazacağız.

### Adım 3: Upload Preset Oluştur

1. Sol menüden **Settings** > **Upload** sekmesine gidin
2. Aşağıya kaydırın, **Upload presets** bölümünü bulun
3. **Add upload preset** butonuna tıklayın
4. Ayarları yapın:
   - **Preset name**: `analysisday_uploads`
   - **Signing Mode**: `Unsigned` (client-side upload için)
   - **Folder**: `analysisday` (tüm görseller burada topplanır)
   - **Unique filename**: `true` (aynı isimli dosyalar için)
5. **Save** butonuna tıklayın

### Adım 4: Dekont Upload Preset Oluştur

1. Tekrar **Add upload preset** butonuna tıklayın
2. Ayarları yapın:
   - **Preset name**: `analysisday_receipts`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `analysisday/receipts`
   - **Unique filename**: `true`
3. **Save** butonuna tıklayın

✅ **Cloudinary hazır!**

### Cloudinary Avantajları

- **Otomatik optimizasyon**: Görseller otomatik olarak optimize edilir
- **CDN desteği**: Dünya çapında hızlı erişim
- **Transformasyon**: Boyutlandırma, format değişimi vs. otomatik
- **Ücretsiz plan**: 25GB depolama + 25GB bandwidth

---

## 5. Ortam Değişkenlerini Ayarlama

### Adım 1: .env.local Dosyasını Düzenle

Proje klasöründeki `.env.local` dosyasını açın ve Firebase config bilgilerinizi yazın:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (sizin API Key'iniz)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=analysisday.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=analysisday
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=analysisday.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxx (sizin cloud name)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=analysisday_uploads
NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET=analysisday_receipts

# WhatsApp Numarası (905xxxxxxxxx formatında)
NEXT_PUBLIC_WHATSAPP_NUMBER=905551234567

# IBAN Bilgileri
NEXT_PUBLIC_IBAN=TR00 0000 0000 0000 0000 0000 00
NEXT_PUBLIC_BANK_NAME=Ziraat Bankası
NEXT_PUBLIC_ACCOUNT_HOLDER=Ahmet Yılmaz

# Abonelik Ücreti (TL)
NEXT_PUBLIC_SUBSCRIPTION_PRICE=600
```

### Adım 2: Projeyi Yeniden Başlat

```powershell
# Ctrl+C ile mevcut dev sunucusunu durdurun
# Sonra tekrar başlatın:
npm run dev
```

---

## 6. İlk Admin Kullanıcısı Oluşturma

Firebase'de ilk admin kullanıcınızı oluşturmak için:

### Yöntem 1: Kod ile (Önerilen)

1. Projenizde tarayıcıda `/register` sayfasına gidin
2. Admin olacak email ile kayıt olun (örn: admin@analysisday.com)
3. Firebase Console'a gidin
4. **Firestore Database** > **users** koleksiyonuna gidin
5. Az önce oluşturduğunuz kullanıcıyı bulun
6. **Edit document** (Düzenle) butonuna tıklayın
7. `role` alanını **"user"** yerine **"admin"** yapın
8. **Update** butonuna tıklayın

✅ Artık admin paneline erişebilirsiniz!

### Yöntem 2: Manuel (Firebase Console'dan)

1. **Authentication** > **Users** sekmesine gidin
2. **Add user** butonuna tıklayın
3. Email ve şifre girin
4. Kullanıcıyı oluşturduktan sonra **UID'sini** kopyalayın
5. **Firestore Database** > **users** koleksiyonuna gidin
6. **Add document** butonuna tıklayın
7. **Document ID:** Kopyaladığınız UID
8. Şu alanları ekleyin:
   - `uid`: (UID)
   - `email`: (email adresi)
   - `role`: "admin"
   - `isPaid`: true
   - `subscriptionEndDate`: null
   - `lastPaymentDate`: null
   - `emailNotifications`: true
   - `createdAt`: Timestamp (now)

---

## 7. Vercel Deploy

### Adım 1: GitHub'a Push

```powershell
git add .
git commit -m "Initial commit - AnalysisDay"
git push origin main
```

### Adım 2: Vercel'e Deploy

1. https://vercel.com adresine gidin
2. **Import Project** butonuna tıklayın
3. GitHub reponuzu seçin
4. **Environment Variables** bölümünde `.env.local` içindeki tüm değişkenleri ekleyin:
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
5. **Deploy** butonuna tıklayın

⏳ 2-3 dakika içinde siteniz yayında olacak!

### Adım 3: Domain Bağlama (Opsiyonel)

1. Vercel Dashboard'da projenize gidin
2. **Settings** > **Domains** sekmesine gidin
3. Kendi domain adresinizi ekleyin

---

## 🎉 Tebrikler!

Artık AnalysisDay tamamen çalışır durumda!

### Sırada Ne Var?

1. **Test Edin:**

   - Kayıt olun
   - Login olun
   - Premium kilit ekranını test edin
   - Admin panelinden analiz yükleyin

2. **İlk Analizi Yükleyin:**

   - Admin paneline gidin (/admin)
   - Yeni bir analiz yükleyin
   - Premium kullanıcı olarak görüntüleyin

3. **Ödeme Testleri:**
   - Yeni bir kullanıcı kayıt edin
   - Ödeme talebi gönderin
   - Admin panelinden onaylayın

---

## 🆘 Sorun mu Yaşıyorsunuz?

### Sık Karşılaşılan Hatalar:

**1. "Missing or insufficient permissions"**

- Firestore güvenlik kurallarını kontrol edin
- İndekslerin hazır olduğundan emin olun

**2. "Cloudinary upload failed"**

- Cloudinary cloud name ve preset'leri kontrol edin
- `.env.local` dosyasındaki değişkenleri kontrol edin
- Upload preset'in "Unsigned" olduğundan emin olun

**3. "Auth/invalid-email"**

- Email formatını kontrol edin
- Firebase Authentication'ın aktif olduğundan emin olun

**4. Sayfa yüklenmiyor**

- `.env.local` dosyasındaki değişkenleri kontrol edin
- `npm run dev` komutuyla sunucuyu yeniden başlatın

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:

- Firebase Console'daki error loglarına bakın
- Tarayıcı console'unu kontrol edin (F12)
- GitHub Issues'da sorun açın

**Başarılar! 🚀**
