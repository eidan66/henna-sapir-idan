# 🚀 Vercel KV Setup Guide

## Step 1: Create Vercel KV Database

1. **Go to Vercel Dashboard**
   - Open: https://vercel.com/dashboard
   - Select your project: `henna-sapir-idan`

2. **Navigate to Storage**
   - Click on **"Storage"** tab
   - Click **"Create Database"**
   - Select **"KV"** (Redis)

3. **Configure Database**
   - **Name**: `wedding-gallery-cache` (או כל שם שתרצה)
   - **Region**: Select **closest to your users** (probably EU or US)
   - Click **"Create"**

4. **Connect to Project**
   - Vercel will ask: "Connect to a project?"
   - Select: `henna-sapir-idan`
   - Click **"Connect"**

## Step 2: Environment Variables (Automatic!)

Vercel **automatically** adds these environment variables to your project:

```bash
KV_URL="redis://default:***@***.kv.vercel-storage.com:***"
KV_REST_API_URL="https://***-***.kv.vercel-storage.com"
KV_REST_API_TOKEN="***"
KV_REST_API_READ_ONLY_TOKEN="***"
```

**Our code already supports `KV_URL`!** Check `src/lib/redis.ts`:
```typescript
const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
```

## Step 3: Deploy

```bash
# Commit and push
git add .
git commit -m "Add Redis caching support"
git push origin master

# Vercel will auto-deploy with KV enabled!
```

## Step 4: Verify It's Working

1. **Check Vercel Logs**:
   - Go to: Vercel Dashboard → Deployments → Latest → Functions
   - Look for: `[INFO] Redis connected successfully`

2. **Check Cache Headers**:
   ```bash
   curl -I https://your-app.vercel.app/api/download
   # Look for: X-Cache: HIT or X-Cache: MISS
   ```

3. **Monitor KV Usage**:
   - Vercel Dashboard → Storage → KV
   - See: Requests, Memory usage, Keys

## ✅ Done!

Your app now has:
- 🚀 Ultra-fast Redis caching
- 🌍 Global edge caching
- 📊 10K free requests per day
- 💾 256MB free storage

## 📊 Free Tier Limits

- **Storage**: 256 MB
- **Requests**: 10,000 per day
- **Commands**: 1,000,000 per month
- **Bandwidth**: 100 MB per day

For a wedding gallery app, this is **more than enough**! 🎉

## 🔧 Troubleshooting

### "No database found"
- Make sure you connected KV to the correct project
- Check: Vercel Dashboard → Storage → should show your database

### "Redis not connected"
- Check environment variables: `vercel env ls`
- Redeploy: `vercel --prod`

### "Cache not working"
- Check logs for Redis connection errors
- Verify `KV_URL` is set in production environment

## 💡 Tips

1. **Local Development**: Use local Redis
   ```bash
   brew install redis
   brew services start redis
   echo "REDIS_URL=redis://localhost:6379" >> .env.local
   ```

2. **Production**: Vercel KV (automatic)

3. **Monitor Usage**: 
   - Vercel Dashboard → Storage → KV → Analytics
   - Set up alerts if approaching limits

## 📚 Learn More

- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [Pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)
- [Our Caching Guide](./CACHING.md)

---

**Questions?** Check the Vercel KV dashboard or logs!

