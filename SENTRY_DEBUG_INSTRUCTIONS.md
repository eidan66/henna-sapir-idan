# בדיקת Sentry - הוראות

## הבעיות שזוהו ותוקנו:

### 1. משתני סביבה חסרים
✅ **תוקן**: נוצר קובץ `.env.local` עם ה-DSN הנכון

### 2. סינון לוגים בפרודקשן
✅ **תוקן**: עדכנתי את ה-`beforeSend` filter כדי לשלוח לוגים גם בפרודקשן

### 3. הוספת לוגי בדיקה
✅ **הוספו**: לוגי בדיקה ב-Gallery page ו-SentryProvider

## איך לבדוק:

### 1. הפעל את הפרויקט
```bash
yarn dev
```

### 2. פתח את הדפדפן ונווט ל:
- `http://localhost:3000/gallery` - יגרום ללוגים ב-Gallery page
- כל דף אחר - יגרום ללוגים ב-SentryProvider

### 3. בדוק את הקונסול
אתה אמור לראות:
```
[timestamp] [henna-idan-sapir]: INFO: Sentry client initialized
[timestamp] [henna-idan-sapir]: INFO: Gallery page loaded
[timestamp] [henna-idan-sapir]: ERROR: Test error for Sentry
Testing Sentry - this should appear in Sentry logs
Testing Sentry warning - this should appear in Sentry logs
Testing Sentry error - this should appear in Sentry logs
```

### 4. בדוק את Sentry Dashboard
1. היכנס ל-[Sentry.io](https://sentry.io)
2. בחר בפרויקט `henna-idan-sapir`
3. לך ל-**Issues** - אמור לראות שגיאות
4. לך ל-**Logs** - אמור לראות לוגים (אם מופעל)

## אם עדיין לא רואה לוגים:

### בדוק את ה-DSN
```bash
echo $NEXT_PUBLIC_SENTRY_DSN
```
אמור להציג את ה-DSN שלך.

### בדוק את הקונסול לדיבוג
אם יש שגיאות Sentry, הן יופיעו בקונסול עם `debug: true`.

### בדוק את הרשת
פתח את Developer Tools → Network וחפש בקשות ל-Sentry.

## הסרת לוגי הבדיקה
אחרי שהכל עובד, הסר את הלוגים הבאים:

1. **מ-Gallery page** (`src/app/gallery/page.tsx`):
   ```typescript
   // Test Sentry logging
   useEffect(() => {
     logger.info('Gallery page loaded', {
       component: 'GalleryPage',
       timestamp: new Date().toISOString(),
     });
     
     // Test error logging
     logger.error('Test error for Sentry', new Error('This is a test error'), {
       test: true,
       component: 'GalleryPage',
     });
   }, []);
   ```

2. **מ-SentryProvider** (`src/components/SentryProvider.tsx`):
   ```typescript
   // Test Sentry directly
   console.log('Testing Sentry - this should appear in Sentry logs');
   console.warn('Testing Sentry warning - this should appear in Sentry logs');
   console.error('Testing Sentry error - this should appear in Sentry logs');

   // Test Sentry captureMessage
   Sentry.captureMessage('Test message from SentryProvider', 'info');
   Sentry.captureMessage('Test warning from SentryProvider', 'warning');
   Sentry.captureMessage('Test error from SentryProvider', 'error');
   ```

## מה אמור לעבוד עכשיו:

1. ✅ **לוגים רגילים** - `logger.info()`, `logger.error()` וכו'
2. ✅ **Console logs** - `console.log()`, `console.warn()`, `console.error()`
3. ✅ **Sentry messages** - `Sentry.captureMessage()`
4. ✅ **שגיאות** - שגיאות JavaScript אוטומטיות
5. ✅ **Tracing** - `logger.traceApiCall()`, `logger.traceUserAction()` וכו'

אם עדיין לא עובד, בדוק את הקונסול לשגיאות Sentry או שלח לי את השגיאות שאתה רואה.
