import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Enable logs
  _experiments: {
    enableLogs: true,
  },
  
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,
  
  // Integrations
  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Set environment
  environment: process.env.NODE_ENV || 'development',
  
  // Add custom tags
  initialScope: {
    tags: {
      component: 'client',
      app: 'henna-gallery',
    },
  },
  
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Capture uncaught exceptions
  captureUncaughtException: true,
  
  // Custom error filtering
  beforeSend(event, hint) {
    // In development, send all events
    if (process.env.NODE_ENV === 'development') {
      return event;
    }
    
    // In production, only filter out debug logs, but keep info, warn, error
    if (event.level === 'debug') {
      return null;
    }
    
    // Add custom context
    event.tags = {
      ...event.tags,
      userId: hint.originalException?.userId || 'anonymous',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    };
    
    return event;
  },
});
