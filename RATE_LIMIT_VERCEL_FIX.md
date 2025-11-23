# Rate Limit Vercel Deployment Hatası Çözümü

## 🔴 Problem

Rate limiting **localhost'ta çalışıyor** ama **Vercel production'da çalışmıyor** - kullanıcılar rate limite takılmıyor.

## 🔍 Muhtemel Sebepler

### 1. **Environment Variables Eksik** ⚠️ (En Olası)

Vercel Dashboard'da Upstash Redis credentials tanımlanmamış olabilir.

**Çözüm:**

1. Vercel Dashboard > Project Settings > Environment Variables
2. Şu değerleri ekleyin:

```bash
UPSTASH_REDIS_REST_URL=https://tough-locust-35218.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYmSAAIncDEyNjE0ODFlYThiZmE0NDcyYjVhNWEwNDEyZmNmN2UwMnAxMzUyMTg
```

3. **Production, Preview, Development** üçüne de ekleyin
4. Redeploy yapın: `vercel --prod`

### 2. **Redis Connection Timeout**

Upstash Redis free plan rate limit'i aşılmış olabilir.

**Kontrol:**

1. Upstash Dashboard'a girin: https://console.upstash.com/
2. Database > **tough-locust-35218** > Metrics
3. Command count ve connection count kontrol edin
4. Eğer limit aşıldıysa **Upgrade** veya **yeni DB oluşturun**

### 3. **IP Detection Problemi**

Vercel Edge Network IP'leri farklı header'lardan alıyor olabilir.

**Test:**

```bash
# Vercel production'da test endpoint'ini çağır
curl https://your-domain.vercel.app/api/test-rate-limit \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected output:

```json
{
  "success": true,
  "environment": "production",
  "redis": {
    "connected": true,
    "url": "✓ configured"
  },
  "rateLimit": {
    "success": true,
    "limit": 100,
    "remaining": 99
  },
  "request": {
    "ip": "123.45.67.89"
  }
}
```

Eğer `redis.connected = false` ise → **Environment variables eksik**
Eğer `request.ip = "unknown"` ise → **IP detection sorunu**

### 4. **Production'da Fail Open Mode**

`lib/rateLimitServer.ts` production'da hata durumunda "fail open" (izin ver) yapıyor olabilir.

**Kontrol:**

```typescript
// lib/rateLimitServer.ts line 124-130
if (process.env.NODE_ENV === 'production') {
  return {
    success: false,  // ✅ Bu olmalı (deny)
    // success: true,  // ❌ Bu olursa rate limit çalışmaz
```

## 🧪 Test Adımları

### 1. Local Test (Çalışıyor mu?)

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: 6 kez login dene
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"emailOrUsername": "test@test.com", "password": "wrong"}'
  echo ""
done
```

**Expected:** 6. istekte `429 Too Many Requests`

### 2. Vercel Production Test

```bash
# Aynı testi production'da dene
for i in {1..6}; do
  curl -X POST https://your-domain.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"emailOrUsername": "test@test.com", "password": "wrong"}'
  echo ""
done
```

**Expected:** 6. istekte `429 Too Many Requests`
**Actual (şu an):** Hepsi `401 Unauthorized` (rate limit yok)

### 3. Redis Connection Test

```bash
# Production'da Redis testi
curl https://your-domain.vercel.app/api/test-rate-limit \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## ✅ Çözüm Checklist

- [ ] **Vercel Environment Variables** ekle:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- [ ] **Redeploy** yap: `vercel --prod`
- [ ] **Test endpoint** çağır: `curl /api/test-rate-limit`
- [ ] **Redis connection** kontrol et: `redis.connected = true` olmalı
- [ ] **Rate limit test** yap: 6 login denemesi sonrası 429 dönmeli
- [ ] **Upstash Dashboard** metrics kontrol et

## 📊 Upstash Redis Limits (Free Plan)

```
✅ 10,000 commands/day
✅ 256 MB storage
✅ 1 GB bandwidth
```

Eğer limit aşıldıysa:

1. Yeni database oluştur (Free tier = 1 DB)
2. Veya **Pay as you go** plan'e geç ($0.2/100K commands)

## 🔧 Debug Commands

```bash
# 1. Vercel logs (real-time)
vercel logs --follow

# 2. Redis test
curl https://your-domain.vercel.app/api/test-rate-limit \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 3. Rate limit test (spam)
for i in {1..10}; do
  curl -X POST https://your-domain.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"emailOrUsername": "test", "password": "test"}' \
    -i | grep -E "(HTTP|error|Rate)"
done

# 4. Upstash Redis direct test
curl https://tough-locust-35218.upstash.io/ping \
  -H "Authorization: Bearer AYmSAAIncDEyNjE0..."
```

## 🎯 En Hızlı Çözüm

```bash
# 1. Vercel'e environment variables ekle (Dashboard'dan)
UPSTASH_REDIS_REST_URL=https://tough-locust-35218.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYmSAAIncDE...

# 2. Redeploy
git push origin main

# 3. Test
curl https://your-domain.vercel.app/api/test-rate-limit \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📝 Notlar

- **Local'de çalışıyor çünkü:** `.env.local` dosyası var
- **Vercel'de çalışmıyor çünkü:** Environment variables Dashboard'dan eklenmeliş
- **`.env.local` dosyası Git'e commit edilmez** (`.gitignore`'da)
- **Vercel otomatik olarak `.env.local`'ı okumaz**, manuel eklenmeli

## 🚨 Acil Durum: Redis Olmadan Rate Limit

Eğer Redis çalışmazsa, IP-based in-memory rate limit eklenebilir (geçici çözüm):

```typescript
// lib/rateLimitServer.ts içinde
const inMemoryLimits = new Map<string, { count: number; resetAt: number }>();

// Redis fail olursa fallback
if (!redis) {
  const ip = getRequestIdentifier(req);
  const limit = inMemoryLimits.get(ip);
  const now = Date.now();

  if (!limit || now > limit.resetAt) {
    inMemoryLimits.set(ip, { count: 1, resetAt: now + 900000 }); // 15 min
    return { success: true, limit: 5, remaining: 4, reset: now + 900000 };
  }

  if (limit.count >= 5) {
    return { success: false, limit: 5, remaining: 0, reset: limit.resetAt };
  }

  limit.count++;
  return {
    success: true,
    limit: 5,
    remaining: 5 - limit.count,
    reset: limit.resetAt,
  };
}
```

**NOT:** In-memory çözüm sadece **tek serverless function** için çalışır, distributed değildir.
