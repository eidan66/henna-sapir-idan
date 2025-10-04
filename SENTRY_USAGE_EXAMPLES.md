# Examples for using the new logging system with Sentry

## Basic usage with Sentry Logger

```typescript
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

// Using Sentry's built-in logger
const { logger: sentryLogger } = Sentry;

// Structured logs with template literals
sentryLogger.debug(sentryLogger.fmt`Cache miss for user: ${userId}`);
sentryLogger.info("Updated profile", { profileId: 345 });
sentryLogger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});
sentryLogger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});
```

## Tracing and Spans

### User action tracking

```typescript
import { logger } from '@/lib/logger';

function UploadButton() {
  const handleUpload = (file: File) => {
    // Track user action
    logger.traceUserAction('File Upload', () => {
      // Upload code...
      console.log('Uploading file:', file.name);
    }, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  };

  return (
    <button onClick={() => handleUpload(file)}>
      Upload File
    </button>
  );
}
```

### API call tracking

```typescript
import { logger } from '@/lib/logger';

async function fetchUserData(userId: string) {
  return logger.traceApiCall(
    'GET',
    `/api/users/${userId}`,
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      return data;
    },
    { userId }
  );
}
```

### File upload tracking

```typescript
import { logger } from '@/lib/logger';

async function uploadFile(file: File) {
  const fileId = crypto.randomUUID();
  
  return logger.traceUpload(fileId, async () => {
    // Upload code...
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }, {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });
}
```

## Using Sentry Spans directly

### Custom Span

```typescript
import * as Sentry from '@sentry/nextjs';

function processImage(imageData: string) {
  return Sentry.startSpan(
    {
      op: "image.process",
      name: "[henna-idan-sapir]: Process Image",
    },
    (span) => {
      span.setAttribute("imageSize", imageData.length);
      span.setAttribute("format", "base64");
      
      // Image processing code...
      const processedImage = compressImage(imageData);
      
      span.setAttribute("compressionRatio", processedImage.length / imageData.length);
      
      return processedImage;
    },
  );
}
```

### Span with child spans

```typescript
import * as Sentry from '@sentry/nextjs';

async function complexOperation() {
  return Sentry.startSpan(
    {
      op: "complex.operation",
      name: "[henna-idan-sapir]: Complex Operation",
    },
    async (parentSpan) => {
      // Child span 1
      const step1 = await Sentry.startSpan(
        {
          op: "step.1",
          name: "[henna-idan-sapir]: Step 1",
        },
        async (span) => {
          span.setAttribute("step", 1);
          // Step 1 code...
          return "result1";
        },
      );
      
      // Child span 2
      const step2 = await Sentry.startSpan(
        {
          op: "step.2",
          name: "[henna-idan-sapir]: Step 2",
        },
        async (span) => {
          span.setAttribute("step", 2);
          span.setAttribute("dependsOn", step1);
          // Step 2 code...
          return "result2";
        },
      );
      
      parentSpan.setAttribute("totalSteps", 2);
      parentSpan.setAttribute("step1Result", step1);
      parentSpan.setAttribute("step2Result", step2);
      
      return { step1, step2 };
    },
  );
}
```

## Error tracking

### Exception Catching

```typescript
import * as Sentry from '@sentry/nextjs';

async function riskyOperation() {
  try {
    // Operation that might fail...
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    // Send error to Sentry
    Sentry.captureException(error);
    
    // Add additional context
    Sentry.withScope((scope) => {
      scope.setTag("operation", "riskyOperation");
      scope.setContext("additionalInfo", {
        timestamp: new Date().toISOString(),
        userId: getCurrentUserId(),
      });
      Sentry.captureException(error);
    });
    
    throw error;
  }
}
```

## Component usage

### Component with full tracking

```typescript
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function MediaUploader() {
  useEffect(() => {
    // Track component loading
    logger.info('MediaUploader component loaded', {
      component: 'MediaUploader',
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleFileSelect = (file: File) => {
    logger.traceUserAction('File Selection', () => {
      console.log('File selected:', file.name);
    }, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  };

  const handleUpload = async (file: File) => {
    const fileId = crypto.randomUUID();
    
    try {
      await logger.traceUpload(fileId, async () => {
        // Upload code...
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: createFormData(file),
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        
        return response.json();
      }, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      
      logger.info('File uploaded successfully', { fileId });
    } catch (error) {
      logger.error('File upload failed', error instanceof Error ? error : new Error(String(error)), {
        fileId,
        fileName: file.name,
      });
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
            handleUpload(file);
          }
        }}
      />
    </div>
  );
}
```

## Performance tracking

### Response time tracking

```typescript
import { logger } from '@/lib/logger';

async function processLargeDataset(data: any[]) {
  return logger.startSpan(
    'data.process',
    '[henna-idan-sapir]: Process Large Dataset',
    async (span) => {
      span.setAttribute('datasetSize', data.length);
      
      const startTime = Date.now();
      
      try {
        // Data processing...
        const result = await processData(data);
        
        const duration = Date.now() - startTime;
        span.setAttribute('duration', duration);
        span.setAttribute('processedItems', result.length);
        span.setAttribute('status', 'success');
        
        logger.info('Dataset processed successfully', {
          datasetSize: data.length,
          processedItems: result.length,
          duration,
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        span.setAttribute('duration', duration);
        span.setAttribute('status', 'error');
        span.setAttribute('error', error instanceof Error ? error.message : String(error));
        
        logger.error('Dataset processing failed', error instanceof Error ? error : new Error(String(error)), {
          datasetSize: data.length,
          duration,
        });
        
        throw error;
      }
    },
    { datasetSize: data.length }
  );
}
```

## Setting up .env.local file

Create a `.env.local` file in the project with the following content:

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

## Usage tips

1. **Use spans for meaningful operations**:
   - API calls
   - File processing
   - User actions

2. **Add relevant attributes**:
   - Execution times
   - File sizes
   - User IDs

3. **Use Sentry logger for structured logs**:
   - `sentryLogger.fmt` for template literals
   - Add context as second parameter

4. **Error tracking**:
   - `Sentry.captureException()` for errors
   - Add context with `Sentry.withScope()`

5. **System testing**:
   - Run the project
   - Perform various actions
   - Check Sentry dashboard
