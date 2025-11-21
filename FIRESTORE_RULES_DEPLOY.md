# Firestore Security Rules Manuel Deploy

Firebase CLI kurulu olmadığında Firestore rules'u manuel olarak Firebase Console'dan deploy edebilirsiniz.

## 📋 Adımlar

### 1. Firebase Console'a Giriş Yapın

- [https://console.firebase.google.com](https://console.firebase.google.com)
- Projenize giriş yapın: **analiysday-2b9f7**

### 2. Firestore Rules Sayfasına Gidin

- Sol menüden **"Build"** → **"Firestore Database"**
- Üst menüden **"Rules"** sekmesine tıklayın

### 3. Rules'u Güncelleyin

- `firestore.rules` dosyasının içeriğini kopyalayın
- Firebase Console'daki editöre yapıştırın
- **"Publish"** butonuna tıklayın

### 4. Doğrulama

Rules başarıyla deploy edildiğinde:

- Yeşil onay mesajı görünecek
- Son deploy tarihi güncellenecek

## 🔧 Alternatif: Firebase CLI Kurulumu

Gelecekte otomatik deploy için Firebase CLI'yi kurabilirsiniz:

```powershell
# NPM ile global kurulum
npm install -g firebase-tools

# Firebase'e giriş yapın
firebase login

# Rules'u deploy edin
firebase deploy --only firestore:rules
```

## ⚠️ Önemli Notlar

- **system_logs** koleksiyonu için `allow create: if false` kalmalı

  - Bu normal, Admin SDK security rules'u bypass eder
  - Client-side asla doğrudan yazamaz
  - API routes (`/api/logs`) üzerinden Admin SDK ile yazılır

- Rules deploy ettikten sonra değişiklikler **anında** aktif olur
- Test için `/api/test-log` ve `/api/test-rate-limit` endpoint'lerini kullanabilirsiniz

## 🧪 Test

Development modunda test endpoint'leri:

```bash
# Log testi
curl -X POST http://localhost:3000/api/test-log \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"Test log message"}'

# Rate limit testi
curl http://localhost:3000/api/test-rate-limit
```

## 📝 Güncel Rules Durumu

Son güncelleme: 22 Kasım 2025

✅ **Düzeltilen Sorunlar:**

- Firebase Admin duplicate initialization kaldırıldı
- serverLogger async/await düzeltildi
- system_logs için update/delete izinleri eklendi
- Token refresh ve idle timeout mekanizması eklendi

✅ **Güvenlik:**

- Client-side asla system_logs'a yazamaz
- Sadece adminler logları okuyabilir/silebilir
- Admin SDK bypass eder (API routes güvenli)
