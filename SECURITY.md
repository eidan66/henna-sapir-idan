# Security Guide - Wedding Gallery

## 🔒 Environment Variables Security

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# AWS Configuration
AWS_REGION=il-central-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
S3_BUCKET_NAME=sapir-and-idan-henna-albums

# CloudFront Configuration (Required for mobile video playback)
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=d1iqpun8bxb9yi.cloudfront.net

# Redis Configuration (Optional - for server-side caching)
REDIS_URL=redis://localhost:6379
# Or use Vercel KV (automatically set by Vercel)
# KV_URL=redis://default:***@***.kv.vercel-storage.com:***

# Sentry Configuration (Optional - for error tracking)
SENTRY_AUTH_TOKEN=your_sentry_token_here
SENTRY_PROJECT=henna-idan-sapir
```

### ⚠️ Security Best Practices

1. **Never commit `.env.local` to version control**
   - Add `.env.local` to `.gitignore`
   - Use `.env.example` for documentation

2. **CloudFront Domain**
   - Don't hardcode CloudFront domains in code
   - Always use environment variables
   - The app will fallback to S3 if CloudFront is not configured

3. **AWS Credentials**
   - Use IAM roles with minimal required permissions
   - Rotate access keys regularly
   - Never share credentials in code or chat

4. **Production Deployment**
   - Set environment variables in your hosting platform (Vercel, etc.)
   - Use different credentials for production vs development

## 🚀 Deployment Checklist

### For Vercel Deployment:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all required environment variables
3. Redeploy the project

### For Local Development:
1. Copy `.env.example` to `.env.local`
2. Fill in your actual values
3. Run `yarn dev`

## 🔍 Current Security Status

✅ **Secure Configuration**
- No hardcoded secrets in code
- Environment variables properly configured
- Fallback mechanisms in place
- CORS headers properly set

✅ **CloudFront Integration**
- Dynamic domain configuration: d1iqpun8bxb9yi.cloudfront.net
- Automatic fallback to S3 (not recommended for production)
- Proper image and video optimization
- Required for mobile video streaming

✅ **Redis Caching (Optional)**
- Server-side caching for better performance
- Graceful fallback if Redis is not configured
- Client-side caching always works

## 📝 Notes

- **CloudFront is REQUIRED for production** - Videos won't load properly on mobile without it
- The app works without Redis (client-side cache still active)
- For production, Redis is highly recommended for best performance
- See [CACHING.md](./CACHING.md) for detailed caching documentation
- All sensitive data is properly externalized
- Current CloudFront domain: d1iqpun8bxb9yi.cloudfront.net

## 🎥 Video Playback Architecture

The app uses CloudFront CDN for efficient video streaming:
1. Videos uploaded to `henna-uploads/` (existing production structure)
2. CloudFront serves videos with Range request support for mobile
3. Proxy route streams video data directly (no buffering)
4. Mobile devices can seek and stream videos efficiently

**Note:** Lambda processing (`henna-sapir-idan/raw/` → `processed/`) is optional
and can be added in the future without affecting existing files.
