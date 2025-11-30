import { describe, it, expect } from 'vitest';

/**
 * Error Classes Domain Tests
 *
 * Custom error types for the library.
 * Goal: "Domain rules are correct under a storm of random inputs."
 */
describe('Error Classes', () => {
  describe('MlsError', () => {
    it.todo('should extend Error', () => {
      expect.fail('TODO: Test that MlsError is instanceof Error');
    });

    it.todo('should have correct name property', () => {
      expect.fail('TODO: Test that error.name === "MlsError"');
    });

    it.todo('should include stack trace', () => {
      expect.fail('TODO: Test that error.stack is populated');
    });
  });

  describe('MlsApiError', () => {
    it.todo('should include status code', () => {
      expect.fail('TODO: Test that statusCode is accessible');
    });

    it.todo('should include error code from Meili', () => {
      expect.fail('TODO: Test that code (e.g., "invalid_api_key") is preserved');
    });

    it.todo('should include error type', () => {
      expect.fail('TODO: Test that type (e.g., "auth") is preserved');
    });

    it.todo('should include link to documentation', () => {
      expect.fail('TODO: Test that link to Meili docs is included');
    });

    it.todo('should format message helpfully', () => {
      expect.fail('TODO: Test that message includes actionable info');
    });
  });

  describe('MlsTaskTimeoutError', () => {
    it.todo('should include task UID', () => {
      expect.fail('TODO: Test that taskUid is accessible');
    });

    it.todo('should include timeout duration', () => {
      expect.fail('TODO: Test that timeout value is in message');
    });

    it.todo('should include last known task status', () => {
      expect.fail('TODO: Test that lastStatus is preserved');
    });
  });

  describe('MlsRequestTimeoutError', () => {
    it.todo('should include request URL', () => {
      expect.fail('TODO: Test that url is accessible');
    });

    it.todo('should include timeout duration', () => {
      expect.fail('TODO: Test that timeout value is in message');
    });
  });

  describe('MlsBatchError', () => {
    it.todo('should include batch ID', () => {
      expect.fail('TODO: Test that batchId is accessible');
    });

    it.todo('should include failed task UIDs', () => {
      expect.fail('TODO: Test that failedTasks array is available');
    });

    it.todo('should include per-task errors', () => {
      expect.fail('TODO: Test that individual task errors are preserved');
    });
  });

  describe('MlsTokenError', () => {
    it.todo('should indicate token problem type', () => {
      expect.fail('TODO: Test that error indicates expired/invalid/malformed');
    });
  });

  describe('error instanceof checks', () => {
    it.todo('should allow catching specific error types', () => {
      expect.fail('TODO: Test that instanceof works for error type checking');
    });

    it.todo('should allow catching parent MlsError', () => {
      expect.fail('TODO: Test that all errors are instanceof MlsError');
    });
  });
});
