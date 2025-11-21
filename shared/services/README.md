# Service Layer Architecture

Bu klasör, uygulamanın servis katmanını içerir. Tüm API çağrıları ve veri işlemleri bu katman üzerinden yönetilir.

## 📁 Yapı

```
shared/services/
├── BaseService.ts          # Temel servis sınıfı (error handling, retry logic)
└── index.ts                # Export dosyası

features/admin/services/
├── analysisService.ts      # Analiz işlemleri
├── userService.ts          # Kullanıcı yönetimi
└── index.ts                # Export dosyası
```

## 🎯 BaseService Özellikleri

### Error Handling

- Tüm hatalar merkezi olarak yakalanır ve formatlanır
- Console logging ile debug kolaylığı
- Tip güvenli error objesi döner

### Retry Logic

- Configurable retry sayısı (default: 3)
- Exponential backoff stratejisi
- Network hatalarında otomatik retry
- Custom retry koşulları tanımlanabilir

### Örnek Kullanım

```typescript
// BaseService'ten türeyen bir servis
class MyService extends BaseService {
  constructor() {
    super("MyService");
  }

  async getData() {
    return this.executeWithRetry(() => fetchData(), "getData", {
      maxRetries: 3,
      retryDelay: 1000,
    });
  }
}
```

## 📊 Analysis Service

### Metodlar

- `getAll()` - Tüm analizleri getirir (retry ile)
- `create(title, imageFiles, description, userId)` - Yeni analiz oluşturur
- `delete(id)` - Analiz siler
- `downloadImage(url, index)` - Görsel indirir

### Örnek Kullanım

```typescript
import { analysisService } from "@/features/admin/services";

// Tüm analizleri getir
const analyses = await analysisService.getAll();

// Yeni analiz oluştur
await analysisService.create("Başlık", [file1, file2], "Açıklama", userId);

// Analiz sil
await analysisService.delete(analysisId);

// Görsel indir
analysisService.downloadImage(imageUrl, 0);
```

## 👥 User Service

### Metodlar

- `getAll()` - Tüm kullanıcıları getirir
- `getAllWithAuthData()` - Email verification ile kullanıcıları getirir
- `makePremium(uid, days)` - Premium üyelik verir
- `cancelSubscription(uid)` - Abonelik iptal eder
- `delete(uid)` - Kullanıcı siler
- `toggleEmailVerified(uid, newStatus)` - Email doğrulama değiştirir
- `makeAdmin(uid, isSuperAdmin)` - Admin yetkisi verir
- `removeAdmin(uid)` - Admin yetkisi kaldırır
- `toggleSuperAdmin(uid, currentStatus)` - Super admin toggle

### Örnek Kullanım

```typescript
import { userService } from "@/features/admin/services";

// Tüm kullanıcıları getir
const users = await userService.getAll();

// Premium yap (30 gün)
await userService.makePremium(userId, 30);

// Admin yap
await userService.makeAdmin(userId, false);

// Super admin toggle
await userService.toggleSuperAdmin(userId, currentStatus);

// Email doğrulama değiştir
await userService.toggleEmailVerified(userId, true);
```

## 🔄 Hook Integration

Servisler, `useAdminData` hook'u ile entegre edilmiştir:

```typescript
import { useAdminData } from "@/features/admin/hooks";

function MyComponent() {
  const { analyses, users, loading, loadData } = useAdminData();

  // Servisler otomatik olarak kullanılır
  // loadData() çağrısı analysisService.getAll() ve userService.getAll() kullanır
}
```

## ✅ Avantajlar

1. **Merkezi Error Handling**

   - Tüm hatalar tek noktadan yönetilir
   - Consistent error format

2. **Retry Logic**

   - Network hatalarında otomatik retry
   - Exponential backoff ile server yükü azalır

3. **Separation of Concerns**

   - Komponentler business logic'ten ayrı
   - Test edilebilir kod

4. **Type Safety**

   - TypeScript ile tip güvenliği
   - IntelliSense desteği

5. **Maintainability**
   - API değişikliği tek yerden yapılır
   - Kod tekrarı minimize edilir

## 🚀 Performans

- **Parallel Requests**: `Promise.all()` ile çoklu veri çekme
- **Error Recovery**: Retry logic ile hata toleransı
- **Singleton Pattern**: Servisler singleton olarak çalışır

## 📝 Best Practices

1. **Servisleri direkt kullanmayın**

   - Hook'lar üzerinden kullanın
   - Component'lerde business logic olmasın

2. **Error handling ekleyin**

   - Try-catch ile hataları yakalayın
   - Toast ile kullanıcıya bilgi verin

3. **Loading state yönetin**

   - useAdminData loading state'ini kullanın
   - LoadingSpinner gösterin

4. **Optimistic updates kullanın**
   - Hemen UI güncelleyin
   - Hata durumunda geri alın

## 🔧 Genişletme

Yeni bir servis eklemek için:

```typescript
// 1. BaseService'ten türetin
import { BaseService } from "@/shared/services/BaseService";

class MyNewService extends BaseService {
  constructor() {
    super("MyNewService");
  }

  // 2. Metodları ekleyin
  async myMethod() {
    return this.executeWithErrorHandling(() => myApiCall(), "myMethod");
  }
}

// 3. Singleton export
export const myNewService = new MyNewService();
```

## 🧪 Testing

Servisler izole test edilebilir:

```typescript
import { analysisService } from "@/features/admin/services";

// Mock DB fonksiyonları
jest.mock("@/lib/db");

test("should fetch all analyses", async () => {
  const analyses = await analysisService.getAll();
  expect(analyses).toHaveLength(5);
});
```
