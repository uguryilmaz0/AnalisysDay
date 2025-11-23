# Multi-Analysis Daily System Setup Guide

## 🎯 Özellikler

### 1. **Çoklu Günlük Analiz Sistemi**

- Her gün birden fazla analiz eklenebilir
- Her analiz otomatik olarak ertesi gün saat 04:00'te silinir
- Kullanıcılar aynı gün içindeki tüm analizleri görebilir

### 2. **Rol Tabanlı Yetki Sistemi**

- **Super Admin**: Tüm yetkilere sahip (user management, logs, rate limits, analyses)
- **Admin**: Kullanıcı yönetimi + analiz yükleme
- **Moderator**: SADECE analiz yükleme + görüntüleme (logs/users/rate limits erişemez)
- **User**: Sadece premium içerik görüntüleme

### 3. **Otomatik Temizlik Sistemi**

- Vercel Cron Job her gece 04:00'te çalışır
- Expired analizler otomatik olarak silinir
- Cloudinary görselleri de temizlenir

---

## 🔧 Yapılan Değişiklikler

### **Type Definitions** (`types/index.ts`)

```typescript
export type UserRole = "user" | "admin" | "moderator";

export interface DailyAnalysis {
  id: string;
  title: string;
  description?: string;
  imageUrls: string[];
  date: Timestamp;
  expiresAt: Timestamp; // ✅ YENİ - Auto-deletion time
  createdAt: Timestamp; // ✅ YENİ - Creation timestamp
  isVisible: boolean;
  createdBy?: string;
  createdByEmail?: string;
}
```

### **Database Layer** (`lib/db.ts`)

```typescript
// ✅ YENİ - Get all analyses for today
export async function getTodayAnalyses(): Promise<DailyAnalysis[]>;

// ✅ YENİ - Delete expired analyses (cron job helper)
export async function deleteExpiredAnalyses(): Promise<number>;

// ✅ GÜNCELLEME - createAnalysis now sets expiresAt to next day 4 AM
export async function createAnalysis(data: CreateAnalysisData): Promise<string>;
```

### **Auth Middleware** (`middleware/auth.ts`)

```typescript
// ✅ YENİ - Moderator+ access (moderator, admin, super_admin)
export async function requireModerator(req: NextRequest);

// ✅ GÜNCELLEME - Now returns user role
export async function requireAdmin(req: NextRequest);
```

### **Cron Endpoint** (`app/api/cron/cleanup-analyses/route.ts`)

```typescript
// ✅ YENİ - Vercel Cron endpoint for nightly cleanup
export const runtime = "edge";
export async function GET(req: NextRequest);
// Bearer token auth with CRON_SECRET
```

### **Admin Panel** (`app/admin/page.tsx`)

```typescript
// ✅ GÜNCELLEME - Role-based tab visibility
const isModerator = userData.role === "moderator";
const isAdmin = userData.role === "admin" || isSuperAdmin;

// Moderators: ONLY see "analyses" tab
// Admins: See "analyses" + "users" + "admins" tabs
// Super Admins: See ALL tabs (+ rate limits + logs)
```

### **Analysis Page** (`app/analysis/page.tsx`)

```typescript
// ✅ GÜNCELLEME - Display multiple analyses per day
const analyses = await getTodayAnalyses();
// Shows vertical list of all today's analyses
// Each analysis card shows "Analiz 1/3" badge
```

### **Analysis APIs** (`app/api/admin/analyses/**`)

```typescript
// ✅ GÜNCELLEME - Changed from requireAdmin to requireModerator
// Moderators can now upload/edit/delete analyses
POST   /api/admin/analyses       - Create (moderator+)
GET    /api/admin/analyses       - List (moderator+)
GET    /api/admin/analyses/[id]  - Get single (moderator+)
PUT    /api/admin/analyses/[id]  - Update (moderator+)
DELETE /api/admin/analyses/[id]  - Delete (moderator+)
```

### **Vercel Config** (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-analyses",
      "schedule": "0 4 * * *" // ✅ YENİ - Every day at 04:00
    }
  ]
}
```

---

## 🚀 Deployment Adımları

### 1. **Environment Variables**

Vercel Dashboard'a ekleyin:

```bash
CRON_SECRET=your-super-secret-cron-token-here
```

### 2. **Vercel Cron Job Aktivasyonu**

```bash
# Deploy sonrası otomatik aktif olur
# Manuel kontrol için:
vercel crons ls
```

### 3. **Firestore Index Gereksinimi**

Aşağıdaki indexleri Firebase Console'dan oluşturun:

```
Collection: daily_analysis
Fields:
  - date (Descending)
  - expiresAt (Ascending)
  - isVisible (==)
```

### 4. **Mevcut Verilerin Migrasyonu**

Eski analizlere `expiresAt` ve `createdAt` eklemek için:

```typescript
// Firebase Console'da Firestore'da çalıştırın (tek seferlik)
const analyses = await adminDb.collection("daily_analysis").get();
const batch = adminDb.batch();

analyses.docs.forEach((doc) => {
  const data = doc.data();
  const date = data.date.toDate();
  const nextDay4AM = new Date(date);
  nextDay4AM.setDate(nextDay4AM.getDate() + 1);
  nextDay4AM.setHours(4, 0, 0, 0);

  batch.update(doc.ref, {
    expiresAt: admin.firestore.Timestamp.fromDate(nextDay4AM),
    createdAt: data.date, // or admin.firestore.Timestamp.now()
  });
});

await batch.commit();
```

---

## 👥 Kullanıcı Rolü Değiştirme

### **Firebase Console'da Manuel**

```javascript
// Firestore > users > [userId] > Edit
{
  "role": "moderator"  // veya "admin", "user"
}
```

### **Admin Panelinde (TODO)**

Gelecekte `AdminManagementTab` içine role dropdown eklenebilir:

- Super Admin users/admins tabında role değiştirebilir
- Moderator kullanıcıları göremez/düzenleyemez

---

## 🧪 Test Senaryoları

### **Moderator Testi**

1. Bir kullanıcıyı `moderator` role'üne atayın
2. `/admin` sayfasına gidin
3. Kontrol edin:
   - ✅ "Analizler" tabı görünür
   - ✅ Analiz yükleyebilir/silebilir
   - ❌ "Kullanıcılar", "Adminler", "Rate Limits", "Sistem Logları" görmemeli

### **Admin Testi**

1. Bir kullanıcıyı `admin` role'üne atayın
2. `/admin` sayfasına gidin
3. Kontrol edin:
   - ✅ "Analizler" + "Kullanıcılar" + "Adminler" görünür
   - ❌ "Rate Limits", "Sistem Logları" görmemeli (super admin only)

### **Cron Test**

```bash
# Local test (manuel trigger)
curl -X GET http://localhost:3000/api/cron/cleanup-analyses \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Vercel test
curl -X GET https://your-domain.vercel.app/api/cron/cleanup-analyses \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **Multi-Analysis Test**

1. Admin panelde aynı gün için 3 analiz ekleyin
2. `/analysis` sayfasına gidin
3. Kontrol edin:
   - ✅ 3 analiz card'ı alt alta görünür
   - ✅ Her card'da "Analiz 1/3", "Analiz 2/3", "Analiz 3/3" badge'leri var

---

## ⚠️ Önemli Notlar

### **Breaking Change: DailyAnalysis Schema**

- Eski analizlerde `expiresAt` ve `createdAt` YOK
- Migration scripti çalıştırılmazsa eski analizler patlar
- Alternatif: `getTodayAnalyses()` içinde null check ekle

### **Cloudinary Auto-Delete**

- Şu anda sadece Firestore'dan siliniyor
- Görseller Cloudinary'de kalıyor (space kullanımı)
- TODO: Cron job'a Cloudinary delete ekle

### **Rate Limits**

- Moderator için ayrı rate limit tanımlanmadı
- Şu anda admin rate limitlerini kullanıyor
- Gerekirse `admin-create` → `moderator-create` ayrımı yapılabilir

### **Timezone**

- Vercel Cron UTC timezone kullanır
- `0 4 * * *` = UTC 04:00 = TR 07:00 (summer) / 06:00 (winter)
- Gerekirse schedule'u düzenleyin: `0 1 * * *` (UTC 01:00 = TR 04:00)

---

## 📊 Firestore Quota Kontrolü

Firebase Free Plan limitleri:

```
Read:  50,000/day
Write: 20,000/day
```

Günlük tüketim tahmini:

- 1000 premium user × 3 page load = 3000 reads
- 10 analiz × CRUD = 40 writes
- Cron job = 10 deletes/day
- **Total: ~3000 reads, 50 writes/day** ✅ Güvenli
