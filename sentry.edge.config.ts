import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Set environment
  environment: process.env.NODE_ENV || 'development',
  
  // Add custom tags
  initialScope: {
    tags: {
      component: 'edge',
      app: 'henna-gallery',
    },
  },
  
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Capture uncaught exceptions
  captureUncaughtException: true,
  
  // Custom error filtering
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (process.env.NODE_ENV === 'production' && event.level !== 'error') {
      return null;
    }
    
    // Add custom context
    event.tags = {
      ...event.tags,
      edge: true,
      timestamp: new Date().toISOString(),
    };
    
    return event;
  },
});
