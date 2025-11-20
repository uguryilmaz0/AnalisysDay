# Firebase Kurulum Adımları

## 🔥 Firestore Indexes

Sistemin düzgün çalışması için aşağıdaki Firestore index'lerinin oluşturulması gerekmektedir:

### 1. Username Index (Kullanıcı Adı Araması)

Firebase Console > Firestore Database > Indexes sekmesine gidin ve **Composite Index** ekleyin:

**Koleksiyon:** `users`
**Alanlar:**

- `username` (Ascending)

**veya**

Firebase Console'da ilk username ile giriş denemesinde otomatik olarak index oluşturma linki gelecektir. O linke tıklayıp bekleyin.

### 2. Mevcut Admin Kullanıcılarına Username Ekleyin

Eğer sistemde zaten kayıtlı kullanıcılar varsa, onlara manuel olarak username eklemeniz gerekir:

1. Firebase Console > Firestore Database
2. `users` koleksiyonuna gidin
3. Her kullanıcı dokümantına `username` alanı ekleyin (küçük harf, benzersiz)

Örnek:

```
username: "admin01"
username: "ahmet_123"
```

## 📧 Email Doğrulama Ayarları

### Email Templates (Opsiyonel)

Firebase Console > Authentication > Templates sekmesinden email şablonlarını özelleştirebilirsiniz:

1. **Email address verification** - Kayıt sonrası gönderilen doğrulama emaili
2. **Password reset** - Şifre sıfırlama emaili

Şablonlarda kendi marka logonuzu ve metinlerinizi kullanabilirsiniz.

## 🔐 Firestore Security Rules

`firestore.rules` dosyasını Firebase Console'a deploy etmeyi unutmayın:

```bash
firebase deploy --only firestore:rules
```

veya Firebase Console > Firestore Database > Rules sekmesinden manuel olarak kopyalayıp yapıştırın.

### ⚠️ Rules Deploy Ettikten Sonra

Rules deploy ettikten sonra değişikliklerin aktif olması **1-2 dakika** sürebilir. Bu süre zarfında "Missing or insufficient permissions" hatası alabilirsiniz. Bu normaldir, birkaç dakika bekleyin.

Eğer hata devam ederse:

1. Firebase Console > Firestore Database > Rules sekmesini açın
2. Rules'ın doğru deploy edildiğini kontrol edin
3. `exists()` ve `get()` fonksiyonlarının doğru çalıştığından emin olun

## ✅ Kontrol Listesi

- [ ] Firestore `username` index'i oluşturuldu
- [ ] Mevcut kullanıcılara `username` alanı eklendi
- [ ] Firestore rules güncellendi ve publish edildi
- [ ] Email doğrulama aktif (Firebase Authentication > Sign-in method > Email/Password)
- [ ] Email templates kontrol edildi (opsiyonel)
- [ ] **`.env.local` dosyasında `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` ayarlandı**
- [ ] **İlk super admin kullanıcısı oluşturuldu**

## 🚨 Önemli Notlar

1. **Username Benzersizliği:** Her username unique olmalıdır. Sistem otomatik kontrol ediyor.
2. **Email Doğrulama:** Kayıt sonrası kullanıcılara otomatik doğrulama linki gönderiliyor.
3. **Super Admin Kurulumu:** `.env.local` dosyasında `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` alanına email adresinizi ekleyin ve o email ile kayıt olun. Otomatik super admin olacaksınız!
4. **Firestore Rules:** Rules güncellemesi 1-2 dakika sürebilir, sabırlı olun.
5. **Admin Yönetimi:** Super adminler admin panelinden diğer adminleri yönetebilir.

## 🐛 Sık Karşılaşılan Hatalar

### "Missing or insufficient permissions" Hatası

**Sebep:** Firestore rules henüz aktif olmamış veya yanlış yapılandırılmış.

**Çözüm:**

1. Firebase Console > Firestore Database > Rules sekmesini açın
2. `firestore.rules` dosyasındaki kuralların doğru kopyalandığını kontrol edin
3. "Publish" butonuna bastığınızdan emin olun
4. 2-3 dakika bekleyin
5. Tarayıcıyı yenileyin (Hard Refresh: Ctrl+Shift+R)

### Kullanıcı oluşturduktan sonra "Kullanıcı bulunamadı" hatası

**Sebep:** Firestore'da kullanıcı dokümanı henüz oluşmadı veya `username` alanı eksik.

**Çözüm:**

1. Firebase Console > Firestore Database > users koleksiyonunu kontrol edin
2. Yeni oluşturulan kullanıcının `username` alanının olduğundan emin olun
3. `username` küçük harfle yazılmış olmalı
4. Kullanıcı dokümanının ID'si, Firebase Auth UID'si ile aynı olmalı

## 👑 Super Admin Kurulumu

### Otomatik Yöntem (Önerilen)

1. `.env.local` dosyasını açın
2. `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` değişkenine email adresinizi ekleyin:

   ```env
   NEXT_PUBLIC_SUPER_ADMIN_EMAILS=admin@yourcompany.com,ugur@example.com
   ```

   (Birden fazla email için virgülle ayırın)

3. Geliştirme sunucusunu yeniden başlatın:

   ```bash
   npm run dev
   ```

4. `/register` sayfasından bu email ile kayıt olun

5. **Otomatik olarak Super Admin olacaksınız!**
   - `role`: "admin"
   - `superAdmin`: true
   - Admin rolü otomatik premium erişim sağlar
   - Kullanıcı listesinde görünmezsiniz (gizli yönetici)

### Manuel Yöntem (Yedek)

Eğer otomatik yöntem çalışmazsa:

1. Önce normal kullanıcı olarak kayıt olun
2. Firebase Console > Firestore > users koleksiyonuna gidin
3. Kullanıcınızı bulun ve şu alanları düzenleyin:
   ```
   role: "admin"
   superAdmin: true
   isPaid: true
   ```
4. Kaydedin ve sayfayı yenileyin

### Admin Yönetimi

Super admin olduktan sonra:

1. `/admin` paneline gidin
2. "Admin Yönetimi" sekmesini açın
3. Normal kullanıcıları admin yapabilirsiniz
4. Adminlere super admin yetkisi verebilirsiniz
5. Admin yetkilerini kaldırabilirsiniz
