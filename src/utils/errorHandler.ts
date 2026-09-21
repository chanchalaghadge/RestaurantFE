import { useToast } from '../components/common/Toast';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  action?: string;
  component?: string;
  additionalInfo?: Record<string, any>;
}

export class AppError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly technicalMessage: string;
  public readonly recoverable: boolean;
  public readonly context?: ErrorContext;

  constructor(
    userMessage: string,
    technicalMessage: string,
    severity: ErrorSeverity = 'medium',
    recoverable: boolean = true,
    context?: ErrorContext
  ) {
    super(technicalMessage);
    this.name = 'AppError';
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage;
    this.severity = severity;
    this.recoverable = recoverable;
    this.context = context;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error. Please check your connection.', context?: ErrorContext) {
    super(
      message,
      'Network request failed',
      'medium',
      true,
      context
    );
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(
      message,
      'Validation failed',
      'low',
      true,
      context
    );
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed. Please login again.', context?: ErrorContext) {
    super(
      message,
      'Authentication error',
      'high',
      false,
      context
    );
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.', context?: ErrorContext) {
    super(
      message,
      'Rate limit exceeded',
      'medium',
      true,
      context
    );
    this.name = 'RateLimitError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Server error. Please try again later.', context?: ErrorContext) {
    super(
      message,
      'Server error occurred',
      'high',
      true,
      context
    );
    this.name = 'ServerError';
  }
}

/**
 * Centralized error handler
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: Error; timestamp: Date; context?: ErrorContext }> = [];
  private maxLogSize = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle error with appropriate user feedback
   */
  handleError(error: Error, showToast: ReturnType<typeof useToast>['showToast'], context?: ErrorContext): void {
    // Log error
    this.logError(error, context);

    // Determine error type and show appropriate message
    if (error instanceof AppError) {
      this.handleAppError(error, showToast);
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      this.handleNetworkError(showToast, context);
    } else {
      this.handleGenericError(error, showToast, context);
    }
  }

  private handleAppError(error: AppError, showToast: ReturnType<typeof useToast>['showToast']): void {
    const toastType = this.getToastType(error.severity);
    showToast(error.userMessage, toastType);

    // For critical errors, consider additional actions
    if (error.severity === 'critical' && !error.recoverable) {
      console.error('Critical error occurred:', error);
      // Could trigger app-wide state change or redirect
    }
  }

  private handleNetworkError(showToast: ReturnType<typeof useToast>['showToast'], context?: ErrorContext): void {
    const networkError = new NetworkError(
      'Network error. Please check your connection and try again.',
      context
    );
    this.handleAppError(networkError, showToast);
  }

  private handleGenericError(error: Error, showToast: ReturnType<typeof useToast>['showToast'], context?: ErrorContext): void {
    const appError = new AppError(
      'An unexpected error occurred. Please try again.',
      error.message,
      'medium',
      true,
      context
    );
    this.handleAppError(appError, showToast);
  }

  private getToastType(severity: ErrorSeverity): 'success' | 'error' | 'warning' | 'info' {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'error';
    }
  }

  private logError(error: Error, context?: ErrorContext): void {
    const logEntry = {
      error,
      timestamp: new Date(),
      context
    };

    this.errorLog.push(logEntry);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console logging with appropriate level
    if (error instanceof AppError) {
      switch (error.severity) {
        case 'low':
          console.info(`[${error.name}] ${error.technicalMessage}`, context);
          break;
        case 'medium':
          console.warn(`[${error.name}] ${error.technicalMessage}`, context);
          break;
        case 'high':
        case 'critical':
          console.error(`[${error.name}] ${error.technicalMessage}`, error, context);
          break;
      }
    } else {
      console.error('Unhandled error:', error, context);
    }
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): Array<{ error: Error; timestamp: Date; context?: ErrorContext }> {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Create error context from component/action info
   */
  createContext(component: string, action: string, additionalInfo?: Record<string, any>): ErrorContext {
    return {
      component,
      action,
      additionalInfo
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

/**
 * React hook for error handling
 */
export function useErrorHandler() {
  const { showToast } = useToast();

  const handleError = (error: Error, context?: ErrorContext) => {
    errorHandler.handleError(error, showToast, context);
  };

  const createErrorContext = (component: string, action: string, additionalInfo?: Record<string, any>) => {
    return errorHandler.createContext(component, action, additionalInfo);
  };

  return {
    handleError,
    createErrorContext,
    getErrorLog: () => errorHandler.getErrorLog(),
    clearErrorLog: () => errorHandler.clearErrorLog()
  };
}
