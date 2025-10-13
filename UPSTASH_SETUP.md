# 🔴 Upstash Redis Setup Guide (Alternative to Vercel KV)

## When to Use Upstash Instead of Vercel KV

- ✅ Want more control over Redis configuration
- ✅ Need multiple databases
- ✅ Want to use Redis with other platforms (not just Vercel)
- ✅ Need advanced Redis features

## Step 1: Create Upstash Account

1. **Sign Up**:
   - Go to: https://console.upstash.com/
   - Click **"Sign up"**
   - Use GitHub (fastest) or Email

2. **Verify Email** (if using email signup)

## Step 2: Create Redis Database

1. **Click "Create Database"**

2. **Configure**:
   - **Name**: `wedding-gallery-cache`
   - **Type**: Choose **"Regional"** or **"Global"**
     - Regional: Cheaper, single region (EU/US)
     - Global: Higher latency but replicated globally
   - **Region**: Choose closest to your users
     - **Europe**: `eu-west-1` (Ireland)
     - **US East**: `us-east-1` (Virginia)
     - **US West**: `us-west-1` (California)
   - **Eviction**: Enable (recommended)
   - **TLS**: Enable (recommended for security)

3. **Click "Create"**

## Step 3: Get Connection String

1. **In your database dashboard**, scroll to **"REST API"** section

2. **Copy the connection URLs**:
   ```
   UPSTASH_REDIS_REST_URL="https://******.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="******"
   ```

3. **Or get the Redis URL** (for ioredis):
   - Click **"Connect"** tab
   - Copy **"REDIS_URL"**:
   ```
   REDIS_URL="rediss://default:******@******.upstash.io:6379"
   ```

## Step 4: Add to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Add:
   ```
   REDIS_URL = rediss://default:******@******.upstash.io:6379
   ```
5. Click **"Save"**
6. **Redeploy** your app

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Set environment variable
vercel env add REDIS_URL
# Paste your Upstash REDIS_URL when prompted
# Select: Production, Preview, Development (all)

# Redeploy
vercel --prod
```

## Step 5: Local Development

Add to `.env.local`:
```bash
REDIS_URL="rediss://default:******@******.upstash.io:6379"
```

Or use local Redis:
```bash
brew install redis
brew services start redis
REDIS_URL="redis://localhost:6379"
```

## Step 6: Verify It's Working

1. **Check Logs** (Vercel Dashboard → Deployments → Functions):
   ```
   [INFO] Redis connected successfully
   ```

2. **Test Cache**:
   ```bash
   curl -I https://your-app.vercel.app/api/download
   # X-Cache: MISS (first time)
   # X-Cache: HIT (second time)
   ```

3. **Monitor Upstash Dashboard**:
   - Console → Your Database → Metrics
   - See: Commands, Connections, Memory

## ✅ Done!

Your app now has Redis caching with Upstash!

## 📊 Free Tier Limits (Upstash)

- **Max Commands**: 10,000 per day
- **Max Request Size**: 1 MB
- **Max Data Size**: 256 MB
- **Bandwidth**: Unlimited on reads!
- **Price**: **$0/month forever** 🎉

Perfect for a wedding gallery!

## 🆚 Upstash vs Vercel KV

| Feature | Vercel KV | Upstash |
|---------|-----------|---------|
| Integration | Native Vercel | Manual setup |
| Free Tier | 256MB, 10K/day | 256MB, 10K/day |
| Setup | 1-click | 5 minutes |
| Global Replication | ✅ | ✅ (Global tier) |
| Multi-platform | Vercel only | Anywhere |
| Control | Limited | Full control |

**Recommendation**: Use **Vercel KV** for simplicity!

## 🔧 Troubleshooting

### "Connection timeout"
- Check your REDIS_URL is correct
- Ensure TLS is enabled (rediss://)
- Check Upstash dashboard for service status

### "Authentication failed"
- Verify your password/token is correct
- Make sure you copied the full connection string

### "Too many connections"
- Free tier: max 100 concurrent connections
- Our app uses 1-2 connections (should be fine!)

## 💡 Advanced: Using Upstash REST API

If you want even more serverless optimization:

```typescript
// Alternative: Use Upstash REST API (no persistent connections)
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Works exactly like our current implementation!
await redis.get('key');
await redis.set('key', 'value');
```

## 📚 Learn More

- [Upstash Docs](https://docs.upstash.com/redis)
- [Pricing](https://upstash.com/pricing)
- [Our Caching Guide](./CACHING.md)

---

**Questions?** Check Upstash console or their excellent docs!

