# דוגמאות לשימוש במערכת הלוגים

## שימוש בסיסי

```typescript
import { logger } from '@/lib/logger';

// לוגים בסיסיים
logger.info('משתמש התחבר למערכת');
logger.warn('זיכרון נמוך');
logger.error('שגיאה בהעלאת קובץ', error);
logger.debug('מידע מפורט לפיתוח');
```

## לוגים עם הקשר

```typescript
// לוג עם מידע נוסף
logger.info('העלאת קובץ החלה', {
  userId: '123',
  fileName: 'wedding-photo.jpg',
  fileSize: 2048000,
  fileType: 'image/jpeg'
});

// לוג שגיאה עם הקשר
logger.error('שגיאה בהעלאת קובץ', error, {
  userId: '123',
  fileName: 'wedding-photo.jpg',
  uploadProgress: 75,
  retryAttempt: 2
});
```

## לוגים מיוחדים

```typescript
// מעקב אחרי בקשות API
logger.apiRequest('POST', '/api/upload', {
  userId: '123',
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.1'
});

logger.apiResponse('POST', '/api/upload', 200, 150, {
  userId: '123',
  responseSize: 1024
});

// מעקב אחרי פעולות משתמש
logger.userAction('העלאת תמונה', {
  userId: '123',
  fileType: 'image',
  fileSize: 2048000
});

// מעקב אחרי התקדמות העלאה
logger.uploadProgress('file123', 75, {
  userId: '123',
  totalFiles: 5,
  currentFile: 3
});

// מעקב אחרי השלמת העלאה
logger.uploadComplete('file123', {
  userId: '123',
  processingTime: 2500,
  fileSize: 2048000
});

// מעקב אחרי שגיאות העלאה
logger.uploadError('file123', error, {
  userId: '123',
  retryAttempt: 2,
  errorCode: 'NETWORK_ERROR'
});

// מעקב אחרי עיבוד מדיה
logger.mediaProcessing('file123', 'completed', {
  userId: '123',
  processingTime: 5000,
  outputFormat: 'mp4'
});

// מעקב אחרי אירועי אבטחה
logger.securityEvent('ניסיון גישה חשוד', {
  ip: '192.168.1.1',
  attempts: 5,
  userAgent: 'Mozilla/5.0...',
  timestamp: new Date().toISOString()
});
```

## שימוש ברכיבים

```typescript
// ברכיב React
import { logger } from '@/lib/logger';
import { useEffect } from 'react';

export function UploadComponent() {
  useEffect(() => {
    logger.userAction('רכיב העלאה נטען', {
      component: 'UploadComponent',
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleUpload = async (file: File) => {
    try {
      logger.userAction('התחלת העלאה', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // קוד העלאה...
      
      logger.uploadComplete(file.name, {
        processingTime: Date.now() - startTime
      });
    } catch (error) {
      logger.uploadError(file.name, error, {
        retryAttempt: 1
      });
    }
  };

  return (
    // JSX...
  );
}
```

## שימוש ב-API Routes

```typescript
// ב-API route
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    logger.apiRequest('POST', '/api/upload', {
      requestId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')
    });

    // עיבוד הבקשה...
    
    logger.apiResponse('POST', '/api/upload', 200, Date.now() - startTime, {
      requestId,
      success: true
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('שגיאה ב-API', error, {
      requestId,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'שגיאה פנימית' },
      { status: 500 }
    );
  }
}
```

## שימוש ב-Lambda Functions

```typescript
// ב-Lambda function
import { logger } from './logger';

export const handler = async (event: S3Event) => {
  logger.info('עיבוד אירוע S3', {
    recordCount: event.Records.length,
    eventSource: event.Records[0]?.eventSource
  });

  for (const record of event.Records) {
    try {
      await processRecord(record);
      
      logger.info('עיבוד רשומה הושלם', {
        bucket: record.s3.bucket.name,
        key: record.s3.object.key
      });
    } catch (error) {
      logger.error('שגיאה בעיבוד רשומה', error, {
        bucket: record.s3.bucket.name,
        key: record.s3.object.key
      });
    }
  }
};
```

## מעקב אחרי ביצועים

```typescript
// מעקב אחרי זמני תגובה
const startTime = Date.now();

try {
  // פעולה כלשהי...
  const result = await someOperation();
  
  logger.info('פעולה הושלמה', {
    operation: 'someOperation',
    duration: Date.now() - startTime,
    success: true
  });
  
  return result;
} catch (error) {
  logger.error('פעולה נכשלה', error, {
    operation: 'someOperation',
    duration: Date.now() - startTime,
    success: false
  });
  
  throw error;
}
```

## מעקב אחרי שגיאות משתמש

```typescript
// מעקב אחרי שגיאות בצד הלקוח
window.addEventListener('error', (event) => {
  logger.error('שגיאה בצד הלקוח', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    url: window.location.href,
    userAgent: navigator.userAgent
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Promise rejection לא מטופל', event.reason, {
    url: window.location.href,
    userAgent: navigator.userAgent
  });
});
```

## מעקב אחרי אבטחה

```typescript
// מעקב אחרי ניסיונות גישה חשודים
function trackAccessAttempt(ip: string, success: boolean) {
  if (success) {
    logger.info('גישה מוצלחת', {
      ip,
      timestamp: new Date().toISOString()
    });
  } else {
    logger.warn('ניסיון גישה כושל', {
      ip,
      timestamp: new Date().toISOString()
    });
    
    // אם יש יותר מדי ניסיונות כושלים
    if (getFailedAttempts(ip) >= 3) {
      logger.securityEvent('ניסיונות גישה חשודים', {
        ip,
        attempts: getFailedAttempts(ip),
        timestamp: new Date().toISOString()
      });
    }
  }
}
```

## טיפים לשימוש

1. **השתמש ברמת הלוג המתאימה**:
   - `debug`: לפיתוח בלבד
   - `info`: מידע כללי
   - `warn`: אזהרות
   - `error`: שגיאות קריטיות

2. **הוסף הקשר רלוונטי**:
   - userId, sessionId
   - פרטי הבקשה
   - מידע על השגיאה

3. **הימנע מלוגים מיותרים**:
   - אל תוסיף לוגים בלולאות
   - השתמש ברמת לוג נמוכה בפרודקשן

4. **השתמש בלוגים מיוחדים**:
   - `apiRequest`/`apiResponse` עבור API
   - `userAction` עבור פעולות משתמש
   - `securityEvent` עבור אירועי אבטחה
