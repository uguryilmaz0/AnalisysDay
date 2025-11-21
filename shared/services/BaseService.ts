/**
 * BaseService - Tüm servisler için temel sınıf
 * Error handling, retry logic ve logging için merkezi yapı
 */

export interface ServiceError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * API çağrılarını error handling ile wrap eder
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logError(operationName, error);
      throw this.formatError(error, operationName);
    }
  }

  /**
   * Retry logic ile API çağrısı yapar
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      shouldRetry = this.defaultShouldRetry,
    } = options;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !shouldRetry(error)) {
          this.logError(operationName, error);
          throw this.formatError(error, operationName);
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Varsayılan retry mantığı - network hataları için retry yap
   */
  private defaultShouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Network hataları için retry yap
      return (
        error.message.includes("network") ||
        error.message.includes("timeout") ||
        error.message.includes("failed to fetch")
      );
    }
    return false;
  }

  /**
   * Hatayı formatlar
   */
  private formatError(error: unknown, operationName: string): ServiceError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as Error & { code?: string }).code,
        details: error,
      };
    }

    return {
      message: `${this.serviceName}.${operationName} başarısız oldu`,
      details: error,
    };
  }

  /**
   * Hatayı console'a loglar
   */
  private logError(operationName: string, error: unknown): void {
    console.error(`[${this.serviceName}] ${operationName} failed:`, error);
  }

  /**
   * Promise sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
