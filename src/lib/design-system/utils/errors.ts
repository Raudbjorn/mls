/**
 * Error handling utilities
 * Consistent error message extraction and handling
 */

/**
 * Extracts a human-readable error message from an unknown error value
 *
 * @param error - The error value to extract a message from
 * @returns A string representation of the error
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (e: unknown) {
 *   const message = getErrorMessage(e);
 *   console.error(message);
 * }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with a message property
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  // Fallback to string representation
  return String(error);
}

/**
 * Type guard to check if a value is an Error instance
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Safely converts any value to a displayable error message
 * with optional prefix
 */
export function formatError(error: unknown, prefix?: string): string {
  const message = getErrorMessage(error);
  return prefix ? `${prefix}: ${message}` : message;
}
