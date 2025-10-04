# מערכת מעקב אחרי לוגים ושגיאות

הפרויקט כולל מערכת מקיפה למעקב אחרי לוגים ושגיאות בפרודקשן באמצעות Sentry ומערכת לוגים מובנית.

## הגדרה ראשונית

### 1. יצירת חשבון Sentry

1. היכנס ל-[Sentry.io](https://sentry.io)
2. צור פרויקט חדש עבור Next.js
3. קבל את ה-DSN שלך מההגדרות

### 2. הגדרת משתני סביבה

הוסף את המשתנים הבאים לקובץ `.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# AWS Configuration (קיים)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
```

### 3. הגדרת Vercel

הוסף את המשתנים הבאים להגדרות הפרויקט ב-Vercel:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

## תכונות המערכת

### 1. מעקב אחרי שגיאות אוטומטי

- **Client-side errors**: שגיאות JavaScript, Promise rejections, וכו'
- **Server-side errors**: שגיאות ב-API routes
- **Lambda errors**: שגיאות בעיבוד קבצים

### 2. מערכת לוגים מובנית

```typescript
import { logger } from '@/lib/logger';

// לוגים בסיסיים
logger.info('משתמש התחבר', { userId: '123' });
logger.warn('ניסיון גישה חשוד', { ip: '192.168.1.1' });
logger.error('שגיאה בהעלאת קובץ', error, { fileId: 'abc123' });

// לוגים מיוחדים
logger.apiRequest('POST', '/api/upload', { userId: '123' });
logger.apiResponse('POST', '/api/upload', 200, 150, { userId: '123' });
logger.userAction('העלאת תמונה', { userId: '123', fileType: 'image' });
logger.uploadProgress('file123', 75, { userId: '123' });
logger.securityEvent('ניסיון פריצה', { ip: '192.168.1.1' });
```

### 3. רמות לוגים

- **DEBUG**: מידע מפורט לפיתוח
- **INFO**: מידע כללי על פעולות
- **WARN**: אזהרות על בעיות פוטנציאליות
- **ERROR**: שגיאות קריטיות

### 4. מעקב אחרי ביצועים

- זמני תגובה של API
- זמני עיבוד קבצים
- מעקב אחרי משתמשים

## הגדרת CloudWatch Logs

### 1. Lambda Functions

ה-Lambda functions כבר מוגדרים לשלוח לוגים ל-CloudWatch Logs. תוכל לראות אותם ב:

1. AWS Console → CloudWatch → Log groups
2. חפש את הקבוצה: `/aws/lambda/your-function-name`

### 2. הגדרת התראות

1. עבור ל-CloudWatch → Alarms
2. צור התראה חדשה עבור:
   - שגיאות Lambda
   - זמני תגובה גבוהים
   - שימוש בזיכרון גבוה

## דשבורד Sentry

### 1. Issues

- רשימת כל השגיאות
- סטטיסטיקות שגיאות
- מעקב אחרי תיקונים

### 2. Performance

- זמני תגובה
- טעינת דפים
- ביצועי API

### 3. Releases

- מעקב אחרי גרסאות
- שגיאות לפי גרסה
- סטטיסטיקות שימוש

## התראות

### 1. Email Notifications

הגדר התראות ב-Sentry עבור:
- שגיאות חדשות
- שגיאות חוזרות
- שגיאות קריטיות

### 2. Slack Integration

חבר את Sentry ל-Slack לקבלת התראות בזמן אמת.

### 3. Webhooks

הגדר webhooks לשליחת התראות למערכות חיצוניות.

## ניטור מתקדם

### 1. Custom Dashboards

צור דשבורדים מותאמים אישית ב-Sentry עבור:
- סטטיסטיקות העלאות
- שגיאות לפי סוג קובץ
- ביצועים לפי אזור גיאוגרפי

### 2. Analytics

השתמש ב-Sentry Analytics עבור:
- מעקב אחרי משתמשים
- ניתוח התנהגות
- זיהוי דפוסי שגיאות

## פתרון בעיות

### 1. שגיאות נפוצות

- **DSN לא מוגדר**: ודא שה-DSN מוגדר נכון
- **לוגים לא מופיעים**: בדוק את הגדרות הסביבה
- **שגיאות Lambda**: בדוק את CloudWatch Logs

### 2. ביצועים

- **לוגים איטיים**: השתמש ברמת לוג נמוכה יותר בפרודקשן
- **זיכרון גבוה**: בדוק את הגדרות Sentry

## תחזוקה

### 1. ניקוי לוגים

- CloudWatch Logs: הגדר retention policy
- Sentry: הגדר data retention

### 2. עדכונים

- עדכן את Sentry SDK באופן קבוע
- בדוק את ה-release notes

## תמיכה

לשאלות או בעיות:
1. בדוק את ה-documentation של Sentry
2. בדוק את CloudWatch Logs
3. פנה לתמיכה טכנית
