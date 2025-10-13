# 🚀 Caching System Documentation

## Overview

המערכת משתמשת ב-**dual-layer caching strategy** לביצועים אופטימליים:

1. **Client-Side Caching** - TanStack Query + localStorage
2. **Server-Side Caching** - Redis (אופציונלי)

---

## 📦 Client-Side Caching (TanStack Query)

### Features
- ✅ **In-Memory Cache** - נתונים נשמרים ב-RAM לגישה מהירה
- ✅ **Persistent Cache** - נתונים נשמרים ב-localStorage בין sessions
- ✅ **Smart Invalidation** - cache מתרענן אוטומטית כשצריך
- ✅ **Infinite Query Support** - pagination יעיל עם `useInfiniteQuery`

### Configuration

```typescript
// src/providers/QueryProvider.tsx
{
  staleTime: 5 * 60 * 1000,  // 5 minutes - כמה זמן נתונים נחשבים "טריים"
  gcTime: 10 * 60 * 1000,    // 10 minutes - כמה זמן להחזיק בcache
  persistOptions: {
    maxAge: 10 * 60 * 1000,  // 10 minutes - כמה זמן לשמור ב-localStorage
  }
}
```

### How It Works

1. **First Load**: נתונים נטענים מהשרת
2. **Cache Hit**: טעינות עוקבות משתמשות ב-cache
3. **Stale Data**: אחרי 5 דקות, נתונים מסומנים כ-stale
4. **Background Refresh**: TanStack Query מרענן אוטומטית ברקע
5. **Persistence**: נתונים נשמרים ב-localStorage למשך 10 דקות

### Cache Keys

```typescript
const mediaQueryKeys = {
  infiniteList: (filters) => ['media', 'list', 'infinite', filters],
  count: () => ['media', 'count'],
  countByType: (type) => ['media', 'count', type],
}
```

---

## 🔴 Server-Side Caching (Redis)

### Why Redis?

- ⚡ **Ultra Fast** - גישה לנתונים ב-microseconds
- 💾 **Shared Cache** - כל המשתמשים מרוויחים מאותו cache
- 🔄 **Reduces S3 Calls** - פחות API calls יקרים ל-S3
- 📊 **Better Performance** - עד **10x faster** response times

### Setup

#### Option 1: Vercel KV (Recommended for Production)

1. **Enable Vercel KV**:
   ```bash
   # In Vercel Dashboard:
   # Settings → Storage → Create KV Database
   ```

2. **Add Environment Variable**:
   ```bash
   # Vercel automatically sets this:
   KV_URL=redis://default:***@***.kv.vercel-storage.com:***
   ```

#### Option 2: Self-Hosted Redis

1. **Install Redis**:
   ```bash
   # macOS
   brew install redis
   brew services start redis

   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis

   # Docker
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Add Environment Variable**:
   ```bash
   # .env.local
   REDIS_URL=redis://localhost:6379
   ```

#### Option 3: Redis Cloud (Free Tier)

1. Sign up at [redis.com](https://redis.com/try-free/)
2. Create a free database
3. Copy connection string:
   ```bash
   # .env.local
   REDIS_URL=redis://default:password@redis-xxxxx.cloud.redislabs.com:12345
   ```

### Without Redis

**הכל עובד!** המערכת תמשיך לעבוד ללא Redis:
- ✅ Graceful fallback - אין errors
- ✅ Client-side cache עדיין פעיל
- ⚠️ תהיה מעט פחות ביצועים (עדיין טוב!)

---

## 🎯 Cache Strategy

### Media List Endpoint (`/api/download`)
- **TTL**: 5 minutes
- **Key Pattern**: `media:list:{sort}:{page}:{limit}:{type}`
- **Invalidation**: אוטומטי אחרי העלאה

### Media Count Endpoint (`/api/media/count`)
- **TTL**: 10 minutes
- **Key Pattern**: `media:count:{type}`
- **Invalidation**: אוטומטי אחרי העלאה

### Cache Invalidation

אוטומטי! כשמעלים קובץ חדש:

```typescript
// בקוד - src/hooks/useBulkUploader.ts
await fetch('/api/cache/invalidate', { method: 'POST' });
```

---

## 📊 Performance Impact

### Without Caching
- ⏱️ Media List: ~2000-3000ms (S3 API calls)
- ⏱️ Media Count: ~1500-2500ms (S3 List + Count)

### With Client Cache Only
- ⚡ Media List: ~50-100ms (localStorage)
- ⚡ Media Count: ~50-100ms (localStorage)

### With Redis + Client Cache
- 🚀 Media List: ~10-30ms (Redis)
- 🚀 Media Count: ~10-30ms (Redis)
- 🎯 Subsequent visits: ~5ms (localStorage)

---

## 🛠️ Monitoring

### Check Cache Headers

```bash
# Cache HIT (from Redis)
curl -I https://your-app.com/api/download
# X-Cache: HIT

# Cache MISS (fetched from S3)
curl -I https://your-app.com/api/download
# X-Cache: MISS
```

### Logs

```typescript
// Cache hit
[INFO] Cache hit for media list { page: 1, limit: 50, cacheKey: 'media:list:...' }

// Cache miss
[INFO] Cache miss for media list, fetching from S3 { page: 1, limit: 50 }

// Cache invalidation
[INFO] Media cache invalidated { deletedKeys: 12 }
```

---

## 🔧 Troubleshooting

### Cache Not Working

1. **Check Redis Connection**:
   ```bash
   # Test Redis connection
   redis-cli -u $REDIS_URL ping
   # Should return: PONG
   ```

2. **Check Logs**:
   ```bash
   # Development
   yarn dev

   # Look for:
   [INFO] Redis connected successfully
   # or
   [WARN] Redis not configured - running without server-side cache
   ```

3. **Clear Cache Manually**:
   ```bash
   # Via Redis CLI
   redis-cli -u $REDIS_URL FLUSHDB

   # Via API
   curl -X POST https://your-app.com/api/cache/invalidate
   ```

### localStorage Full

```typescript
// Clear TanStack Query cache
localStorage.removeItem('WEDDING_GALLERY_CACHE');
```

---

## 🎨 Best Practices

### ✅ DO
- Use Redis in production for best performance
- Monitor cache hit rates
- Set appropriate TTLs based on your update frequency
- Invalidate cache after mutations (upload/delete)

### ❌ DON'T
- Don't cache sensitive user data
- Don't set TTL too long (stale data)
- Don't forget to invalidate after uploads
- Don't hardcode cache keys (use `CacheKeys` helper)

---

## 📝 Example Usage

### Get Cached Media List

```typescript
// Frontend - automatic with TanStack Query
const { data } = useInfiniteMediaList({
  sort: '-created_date',
  limit: 50,
});

// Backend - automatic with Redis
GET /api/download?page=1&limit=50
// Returns: X-Cache: HIT or X-Cache: MISS
```

### Invalidate Cache

```typescript
// After successful upload
await fetch('/api/cache/invalidate', {
  method: 'POST',
});
```

---

## 🚀 Quick Start

1. **Add Redis URL** (optional):
   ```bash
   echo "REDIS_URL=redis://localhost:6379" >> .env.local
   ```

2. **Start Redis** (if self-hosting):
   ```bash
   redis-server
   ```

3. **Run App**:
   ```bash
   yarn dev
   ```

4. **Check Logs**:
   ```
   ✓ Ready in 2.3s
   [INFO] Redis connected successfully
   ```

🎉 **That's it!** Your caching system is now active!

---

## 📚 Related Files

- `src/lib/redis.ts` - Redis client & cache helpers
- `src/providers/QueryProvider.tsx` - TanStack Query setup
- `src/hooks/useMediaQueries.ts` - Query hooks
- `src/app/api/download/route.ts` - Cached endpoint
- `src/app/api/cache/invalidate/route.ts` - Cache invalidation

---

## 💡 Tips

- Monitor Redis memory usage in production
- Consider using compression for large datasets
- Use Redis persistence (RDB + AOF) for important data
- Set up Redis sentinel/cluster for high availability

---

**Questions?** Check the code or ask in the team chat! 🙌

