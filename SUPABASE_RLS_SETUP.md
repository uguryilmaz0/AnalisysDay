# Supabase Row Level Security (RLS) Kurulumu

## 📋 Genel Bakış

Bu dokümanda Supabase'de Row Level Security (RLS) nasıl aktif edilir ve güvenli bir şekilde nasıl kullanılır anlatılmaktadır.

## 🔒 RLS Nedir?

Row Level Security (RLS), PostgreSQL'in güvenlik özelliğidir. Her satıra politikalar uygulayarak:

- Hangi kullanıcıların hangi verilere erişebileceğini kontrol eder
- SQL injection saldırılarına karşı koruma sağlar
- Client-side'dan gelen istekleri güvenli hale getirir

## ⚠️ Neden RLS Gerekli?

**RLS olmadan:**

```typescript
// ❌ TEHLİKELİ: RLS disabled - herkes her şeyi yapabilir!
const { data } = await supabase.from("matches").delete(); // TÜM VERİLER SİLİNİR!
```

**RLS ile:**

```typescript
// ✅ GÜVENLİ: RLS enabled - politikalar uygulanır
const { data, error } = await supabase.from("matches").delete();
// error: "new row violates row-level security policy"
```

## 🚀 Kurulum Adımları

### 1. SQL Script'i Çalıştırın

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. **SQL Editor** menüsüne tıklayın
4. `supabase-rls-policies.sql` dosyasının içeriğini yapıştırın
5. **Run** butonuna basın

```sql
-- RLS'i etkinleştir
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- SELECT politikası: Herkese açık okuma
CREATE POLICY "matches_select_policy"
ON matches FOR SELECT TO public USING (true);

-- INSERT/UPDATE/DELETE politikaları: Kimse yapamaz
CREATE POLICY "matches_insert_policy"
ON matches FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "matches_update_policy"
ON matches FOR UPDATE TO authenticated USING (false);

CREATE POLICY "matches_delete_policy"
ON matches FOR DELETE TO authenticated USING (false);
```

### 2. Politikaları Doğrulayın

SQL Editor'de aşağıdaki sorguyu çalıştırın:

```sql
-- RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'matches';

-- Politikaları listele
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'matches';
```

**Beklenen çıktı:**

```
rls_enabled: true

policyname              | cmd    | roles
-----------------------|--------|---------------
matches_select_policy  | SELECT | {public}
matches_insert_policy  | INSERT | {authenticated}
matches_update_policy  | UPDATE | {authenticated}
matches_delete_policy  | DELETE | {authenticated}
```

### 3. Environment Variables

`.env.local` dosyanızda şu değişkenlerin olduğundan emin olun:

```env
# Client-side (Browser) - Public key
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Server-side (API Routes) - Admin key (OPSİYONEL)
# Sadece RLS bypass gerekiyorsa kullanın
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

## 📚 Kullanım Örnekleri

### Client-Side (Browser)

```typescript
import { supabase } from "@/lib/supabase";

// ✅ SELECT - İzin verilir (RLS: public)
const { data, error } = await supabase.from("matches").select("*").limit(1000);

// ❌ INSERT - Reddedilir (RLS: false)
const { error } = await supabase.from("matches").insert({ home_team: "Test" });
// error: "new row violates row-level security policy"

// ❌ DELETE - Reddedilir (RLS: false)
const { error } = await supabase.from("matches").delete().eq("id", 123);
// error: "new row violates row-level security policy"
```

### Server-Side API (Admin - Opsiyonel)

```typescript
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // Admin client (RLS bypass)
  const admin = getSupabaseAdmin();

  if (!admin) {
    // Service role key yoksa normal client kullan
    // RLS politikaları yine uygulanır
    return Response.json({ error: "Admin access not configured" });
  }

  // ⚠️ SADECE GÜVENLİ İŞLEMLER İÇİN
  // RLS bypass - tüm verilere erişim
  const { data, error } = await admin.from("matches").select("*"); // RLS uygulanmaz!

  return Response.json({ data });
}
```

## 🔐 Güvenlik Best Practices

### ✅ YAPILMASI GEREKENLER

1. **Her zaman RLS kullanın**

   ```sql
   ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
   ```

2. **En az yetki prensibi**

   - SELECT: Public (read-only)
   - INSERT/UPDATE/DELETE: False (kimse yapamaz)

3. **Client-side'da anon key kullanın**

   ```typescript
   // ✅ Client-side
   import { supabase } from "@/lib/supabase"; // Anon key
   ```

4. **Admin key'i sadece server-side'da kullanın**

   ```typescript
   // ✅ Server-side API route
   import { getSupabaseAdmin } from "@/lib/supabase"; // Service role key
   ```

5. **Environment variable'ları güvenli tutun**
   ```bash
   # ✅ .env.local (Git'e eklemeyin!)
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```

### ❌ YAPILMAMASI GEREKENLER

1. **RLS'i devre dışı bırakmayın**

   ```sql
   -- ❌ ASLA YAPMAYIN!
   ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
   ```

2. **Client-side'da service role key kullanmayın**

   ```typescript
   // ❌ TEHLİKELİ - Browser'da gözükür!
   const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
   ```

3. **NEXT*PUBLIC* prefix'i service role key'de kullanmayın**

   ```env
   # ❌ YANLIŞ - Browser'a gider!
   NEXT_PUBLIC_SUPABASE_SERVICE_KEY=xxx

   # ✅ DOĞRU - Sadece server-side
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```

## 🧪 Test Etme

### 1. Browser Console'da Test

1. `F12` tuşuna basın (Developer Tools)
2. Console sekmesine gidin
3. Aşağıdaki kodu çalıştırın:

```javascript
// SELECT test (İzin verilmeli)
const { data, error } = await window.supabase
  .from("matches")
  .select("*")
  .limit(1);
console.log("SELECT:", data ? "SUCCESS" : "FAILED", error);

// INSERT test (Reddedilmeli)
const { data: data2, error: error2 } = await window.supabase
  .from("matches")
  .insert({ home_team: "Test" });
console.log("INSERT:", error2 ? "BLOCKED ✅" : "ALLOWED ❌", error2?.message);
```

**Beklenen sonuç:**

```
SELECT: SUCCESS
INSERT: BLOCKED ✅ "new row violates row-level security policy"
```

### 2. API Route Test

```typescript
// app/api/test-rls/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // Test 1: Client query (RLS uygulanır)
  const { data: clientData, error: clientError } = await supabase
    .from("matches")
    .select("count")
    .single();

  // Test 2: Admin query (RLS bypass - opsiyonel)
  const admin = getSupabaseAdmin();
  const { data: adminData, error: adminError } = admin
    ? await admin.from("matches").select("count").single()
    : { data: null, error: "No admin client" };

  return NextResponse.json({
    client: { data: clientData, error: clientError?.message },
    admin: { data: adminData, error: adminError },
  });
}
```

## 📊 RLS Politika Örnekleri

### 1. Herkese Açık Okuma

```sql
-- Tüm kullanıcılar (anonim dahil) okuyabilir
CREATE POLICY "public_read"
ON matches FOR SELECT
TO public
USING (true);
```

### 2. Sadece Authenticated Kullanıcılar

```sql
-- Sadece giriş yapmış kullanıcılar okuyabilir
CREATE POLICY "authenticated_read"
ON matches FOR SELECT
TO authenticated
USING (true);
```

### 3. Belirli Role'e Göre

```sql
-- Sadece admin role'ü olanlar yazabilir
CREATE POLICY "admin_write"
ON matches FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

### 4. Kullanıcıya Özel Veri

```sql
-- Kullanıcılar sadece kendi verilerini görebilir
CREATE POLICY "user_own_data"
ON user_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

## 🔍 Sorun Giderme

### RLS Etkinleştirilmiş mi?

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Hangi Politikalar Var?

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'matches';
```

### Politika Silme

```sql
-- Tek bir politika
DROP POLICY IF EXISTS "matches_select_policy" ON matches;

-- Tüm politikalar
DROP POLICY IF EXISTS "matches_select_policy" ON matches;
DROP POLICY IF EXISTS "matches_insert_policy" ON matches;
DROP POLICY IF EXISTS "matches_update_policy" ON matches;
DROP POLICY IF EXISTS "matches_delete_policy" ON matches;
```

### RLS'i Geçici Olarak Devre Dışı Bırakma (Acil Durum)

```sql
-- ⚠️ SADECE ACİL DURUMDA!
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Sorunu çözdükten sonra tekrar aç
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
```

## 📝 Checklist

- [ ] `supabase-rls-policies.sql` çalıştırıldı
- [ ] RLS enabled: `rowsecurity = true`
- [ ] 4 politika oluşturuldu (SELECT, INSERT, UPDATE, DELETE)
- [ ] `lib/supabase.ts` güncellendi
- [ ] Environment variables kontrol edildi
- [ ] Browser console'da test edildi
- [ ] API route'da test edildi
- [ ] Service role key sadece server-side'da
- [ ] Anon key sadece client-side'da
- [ ] `.env.local` Git'e eklenmedi

## 🎯 Sonuç

RLS aktif olduğunda:

- ✅ **SELECT**: Herkese açık, güvenli okuma
- ❌ **INSERT/UPDATE/DELETE**: Reddedilir, veri güvenli
- 🔒 **Client-side**: Anon key ile sınırlı erişim
- 🛡️ **Server-side**: Service role key ile admin erişim (opsiyonel)

**Artık sisteminiz güvenli! 🎉**
