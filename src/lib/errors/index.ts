/**
 * Specialized error classes for MLS library
 * Provides better error handling and debugging capabilities
 */

/**
 * Base error class for all MLS errors
 */
export class MlsError extends Error {
  override name = 'MlsError';

  constructor(message: string, public cause?: unknown) {
    super(message);
    Object.setPrototypeOf(this, MlsError.prototype);
  }
}

/**
 * Error thrown when a MeiliSearch API request fails
 */
export class MlsApiError extends MlsError {
  override name = 'MlsApiError';

  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public errorType?: string,
    public errorLink?: string,
    cause?: unknown
  ) {
    super(message, cause);
    Object.setPrototypeOf(this, MlsApiError.prototype);
  }
}

/**
 * Error thrown when waiting for a task times out
 */
export class MlsTaskTimeoutError extends MlsError {
  override name = 'MlsTaskTimeoutError';

  constructor(
    public taskUid: number,
    public timeout: number,
    message?: string
  ) {
    super(message || `Task ${taskUid} timed out after ${timeout}ms`);
    Object.setPrototypeOf(this, MlsTaskTimeoutError.prototype);
  }
}

/**
 * Error thrown when an HTTP request times out
 */
export class MlsRequestTimeoutError extends MlsError {
  override name = 'MlsRequestTimeoutError';

  constructor(
    public timeout: number,
    public url: string,
    message?: string
  ) {
    super(message || `Request to ${url} timed out after ${timeout}ms`);
    Object.setPrototypeOf(this, MlsRequestTimeoutError.prototype);
  }
}

/**
 * Error thrown when batch processing fails
 */
export class MlsBatchError extends MlsError {
  override name = 'MlsBatchError';

  constructor(
    message: string,
    public failedBatches: number[],
    public successfulBatches: number[],
    cause?: unknown
  ) {
    super(message, cause);
    Object.setPrototypeOf(this, MlsBatchError.prototype);
  }
}

/**
 * Error thrown when token generation fails
 */
export class MlsTokenError extends MlsError {
  override name = 'MlsTokenError';

  constructor(message: string, cause?: unknown) {
    super(message, cause);
    Object.setPrototypeOf(this, MlsTokenError.prototype);
  }
}