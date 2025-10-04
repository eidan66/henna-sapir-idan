import * as Sentry from '@sentry/nextjs';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [henna-idan-sapir]: ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private logToConsole(level: LogLevel, message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(level, message, context);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }
  }

  private logToSentry(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (this.isProduction) {
      // Use Sentry's built-in logger
      const { logger: sentryLogger } = Sentry;
      
      // Add context to Sentry scope
      Sentry.withScope((scope) => {
        if (context) {
          Object.keys(context).forEach(key => {
            scope.setTag(key, context[key]);
          });
        }
        
        // Add breadcrumb
        scope.addBreadcrumb({
          message,
          level: level as any,
          timestamp: Date.now() / 1000,
        });
        
        if (error) {
          Sentry.captureException(error);
        } else {
          // Use Sentry logger for structured logging
          switch (level) {
            case LogLevel.DEBUG:
              sentryLogger.debug(message, context);
              break;
            case LogLevel.INFO:
              sentryLogger.info(message, context);
              break;
            case LogLevel.WARN:
              sentryLogger.warn(message, context);
              break;
            case LogLevel.ERROR:
              sentryLogger.error(message, context);
              break;
          }
        }
      });
    }
  }

  debug(message: string, context?: LogContext): void {
    this.logToConsole(LogLevel.DEBUG, message, context);
    this.logToSentry(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.logToConsole(LogLevel.INFO, message, context);
    this.logToSentry(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logToConsole(LogLevel.WARN, message, context);
    this.logToSentry(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logToConsole(LogLevel.ERROR, message, context);
    this.logToSentry(LogLevel.ERROR, message, context, error);
  }

  // Specialized logging methods
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${url}`, {
      ...context,
      method,
      url,
      type: 'api_request',
    });
  }

  apiResponse(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API Response: ${method} ${url} - ${statusCode} (${duration}ms)`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, undefined, {
        ...context,
        method,
        url,
        statusCode,
        duration,
        type: 'api_response',
      });
    } else {
      this.info(message, {
        ...context,
        method,
        url,
        statusCode,
        duration,
        type: 'api_response',
      });
    }
  }

  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      ...context,
      action,
      type: 'user_action',
    });
  }

  uploadProgress(fileId: string, progress: number, context?: LogContext): void {
    this.debug(`Upload Progress: ${fileId} - ${progress}%`, {
      ...context,
      fileId,
      progress,
      type: 'upload_progress',
    });
  }

  uploadComplete(fileId: string, context?: LogContext): void {
    this.info(`Upload Complete: ${fileId}`, {
      ...context,
      fileId,
      type: 'upload_complete',
    });
  }

  uploadError(fileId: string, error: Error, context?: LogContext): void {
    this.error(`Upload Error: ${fileId}`, error, {
      ...context,
      fileId,
      type: 'upload_error',
    });
  }

  mediaProcessing(fileId: string, status: string, context?: LogContext): void {
    this.info(`Media Processing: ${fileId} - ${status}`, {
      ...context,
      fileId,
      status,
      type: 'media_processing',
    });
  }

  securityEvent(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      event,
      type: 'security_event',
    });
  }

  // New Sentry-specific methods
  startSpan<T>(operation: string, name: string, callback: (span: any) => T, context?: LogContext): T {
    return Sentry.startSpan(
      {
        op: operation,
        name: name,
      },
      (span) => {
        // Add context as attributes
        if (context) {
          Object.keys(context).forEach(key => {
            span.setAttribute(key, context[key]);
          });
        }
        
        return callback(span);
      },
    );
  }

  // API call tracing
  async traceApiCall<T>(
    method: string, 
    url: string, 
    callback: () => Promise<T>, 
    context?: LogContext
  ): Promise<T> {
    return this.startSpan(
      'http.client',
      `[henna-idan-sapir]: ${method} ${url}`,
      async (span) => {
        const startTime = Date.now();
        try {
          const result = await callback();
          const duration = Date.now() - startTime;
          
          span.setAttribute('status', 'success');
          span.setAttribute('duration', duration);
          
          this.apiResponse(method, url, 200, duration, context);
          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          span.setAttribute('status', 'error');
          span.setAttribute('duration', duration);
          span.setAttribute('error', error instanceof Error ? error.message : String(error));
          
          this.apiResponse(method, url, 500, duration, { ...context, error: error instanceof Error ? error.message : String(error) });
          throw error;
        }
      },
      context
    );
  }

  // User action tracing
  traceUserAction<T>(action: string, callback: () => T, context?: LogContext): T {
    return this.startSpan(
      'ui.action',
      `[henna-idan-sapir]: User Action: ${action}`,
      (span) => {
        span.setAttribute('action', action);
        const result = callback();
        this.userAction(action, context);
        return result;
      },
      context
    );
  }

  // File upload tracing
  async traceUpload<T>(fileId: string, callback: () => Promise<T>, context?: LogContext): Promise<T> {
    return this.startSpan(
      'file.upload',
      `[henna-idan-sapir]: Upload: ${fileId}`,
      async (span) => {
        span.setAttribute('fileId', fileId);
        const startTime = Date.now();
        
        try {
          const result = await callback();
          const duration = Date.now() - startTime;
          
          span.setAttribute('status', 'success');
          span.setAttribute('duration', duration);
          
          this.uploadComplete(fileId, { ...context, duration });
          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          span.setAttribute('status', 'error');
          span.setAttribute('duration', duration);
          span.setAttribute('error', error instanceof Error ? error.message : String(error));
          
          this.uploadError(fileId, error instanceof Error ? error : new Error(String(error)), { ...context, duration });
          throw error;
        }
      },
      context
    );
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for convenience
export default logger;
