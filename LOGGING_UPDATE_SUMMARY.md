# Logging System Update Summary

## Changes Made

### 1. Updated Log Format
All logs now include the prefix `[henna-idan-sapir]:` and are in English.

**Before:**
```
[2024-01-15T10:30:00.000Z] INFO: משתמש התחבר
```

**After:**
```
[2024-01-15T10:30:00.000Z] [henna-idan-sapir]: INFO: User logged in
```

### 2. Updated Files

#### Core Logger (`src/lib/logger.ts`)
- ✅ Added `[henna-idan-sapir]:` prefix to all log messages
- ✅ Updated tracing methods to include prefix in span names
- ✅ All log messages are now in English

#### Lambda Logger (`infrastructure/lambda/normalize-media/index.ts`)
- ✅ Added `[henna-idan-sapir]:` prefix to Lambda logs
- ✅ All log messages are now in English

#### Documentation (`SENTRY_USAGE_EXAMPLES.md`)
- ✅ Updated all examples to English
- ✅ Added `[henna-idan-sapir]:` prefix to span names
- ✅ Updated component examples with English messages

### 3. Log Message Examples

#### Basic Logging
```typescript
logger.info('User logged in', { userId: '123' });
// Output: [2024-01-15T10:30:00.000Z] [henna-idan-sapir]: INFO: User logged in | {"userId":"123"}
```

#### API Logging
```typescript
logger.apiRequest('POST', '/api/upload', { userId: '123' });
// Output: [2024-01-15T10:30:00.000Z] [henna-idan-sapir]: INFO: API Request: POST /api/upload | {"userId":"123","method":"POST","url":"/api/upload","type":"api_request"}
```

#### User Actions
```typescript
logger.userAction('File Upload', { fileName: 'photo.jpg' });
// Output: [2024-01-15T10:30:00.000Z] [henna-idan-sapir]: INFO: User Action: File Upload | {"fileName":"photo.jpg","action":"File Upload","type":"user_action"}
```

#### Tracing
```typescript
logger.traceUserAction('File Upload', () => {
  // Upload code...
}, { fileName: 'photo.jpg' });
// Creates span with name: "[henna-idan-sapir]: User Action: File Upload"
```

### 4. Sentry Integration

#### Console Integration
All console.log, console.warn, and console.error calls are automatically sent to Sentry with the `[henna-idan-sapir]:` prefix.

#### Structured Logging
```typescript
const { logger: sentryLogger } = Sentry;
sentryLogger.info("User logged in", { userId: '123' });
sentryLogger.debug(sentryLogger.fmt`Cache miss for user: ${userId}`);
```

### 5. Environment Setup

Create `.env.local` file:
```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://376b4540c6078ed2ca07f250d72eea07@o4508160837681152.ingest.us.sentry.io/4510130262441984
SENTRY_DSN=https://376b4540c6078ed2ca07f250d72eea07@o4508160837681152.ingest.us.sentry.io/4510130262441984

# AWS Configuration (existing)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
```

### 6. Testing the System

1. **Start the development server:**
   ```bash
   yarn dev
   ```

2. **Perform actions that generate logs:**
   - Upload files
   - Navigate between pages
   - Trigger API calls

3. **Check logs in:**
   - Browser console (development)
   - Sentry dashboard (production)
   - CloudWatch Logs (Lambda functions)

### 7. Log Levels

- **DEBUG**: Detailed information for development
- **INFO**: General information about operations
- **WARN**: Warnings about potential issues
- **ERROR**: Critical errors that need attention

### 8. Specialized Logging Methods

- `logger.apiRequest()` - API request logging
- `logger.apiResponse()` - API response logging
- `logger.userAction()` - User action logging
- `logger.uploadProgress()` - Upload progress logging
- `logger.uploadComplete()` - Upload completion logging
- `logger.uploadError()` - Upload error logging
- `logger.mediaProcessing()` - Media processing logging
- `logger.securityEvent()` - Security event logging

### 9. Tracing Methods

- `logger.traceApiCall()` - API call tracing with performance metrics
- `logger.traceUserAction()` - User action tracing
- `logger.traceUpload()` - File upload tracing
- `logger.startSpan()` - Custom span creation

### 10. Benefits

1. **Consistent Formatting**: All logs have the same prefix for easy identification
2. **English Language**: All logs are in English for better international support
3. **Structured Data**: All logs include relevant context and metadata
4. **Performance Tracking**: Tracing provides detailed performance metrics
5. **Error Tracking**: Comprehensive error tracking with Sentry integration
6. **Production Ready**: Optimized for production use with appropriate log levels

## Next Steps

1. Create the `.env.local` file with your Sentry DSN
2. Test the logging system in development
3. Deploy to production and monitor logs in Sentry
4. Set up alerts for critical errors
5. Use the tracing features to monitor performance
