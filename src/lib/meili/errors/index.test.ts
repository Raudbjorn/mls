import { describe, it, expect } from 'vitest';
import {
  MlsError,
  MlsApiError,
  MlsTaskTimeoutError,
  MlsRequestTimeoutError,
  MlsBatchError,
  MlsTokenError
} from './index';

describe('Error Classes', () => {
  describe('MlsError', () => {
    it('should extend Error', () => {
      const err = new MlsError('test error');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(MlsError);
    });

    it('should have correct name property', () => {
      const err = new MlsError('test error');
      expect(err.name).toBe('MlsError');
    });

    it('should include stack trace', () => {
      const err = new MlsError('test error');
      expect(err.stack).toBeDefined();
    });
    
    it('should store cause', () => {
      const cause = new Error('root cause');
      const err = new MlsError('wrapped', cause);
      expect(err.cause).toBe(cause);
    });
  });

  describe('MlsApiError', () => {
    const err = new MlsApiError(
      'API failed',
      400,
      'invalid_api_key',
      'auth_error',
      'https://docs.meili.com/errors'
    );

    it('should include status code', () => {
      expect(err.statusCode).toBe(400);
    });

    it('should include error code from Meili', () => {
      expect(err.errorCode).toBe('invalid_api_key');
    });

    it('should include error type', () => {
      expect(err.errorType).toBe('auth_error');
    });

    it('should include link to documentation', () => {
      expect(err.errorLink).toBe('https://docs.meili.com/errors');
    });
  });

  describe('MlsTaskTimeoutError', () => {
    const err = new MlsTaskTimeoutError(123, 5000);

    it('should include task UID', () => {
      expect(err.taskUid).toBe(123);
    });

    it('should include timeout duration', () => {
      expect(err.timeout).toBe(5000);
    });
    
    it('should generate descriptive message', () => {
      expect(err.message).toContain('Task 123 timed out after 5000ms');
    });
  });

  describe('MlsRequestTimeoutError', () => {
    const err = new MlsRequestTimeoutError(1000, 'http://api.com');

    it('should include request URL', () => {
      expect(err.url).toBe('http://api.com');
    });

    it('should include timeout duration', () => {
      expect(err.timeout).toBe(1000);
    });
  });

  describe('MlsBatchError', () => {
    const failedIndices = [1, 3];
    const successfulIndices = [0, 2];
    const errors = [{ batchIndex: 1, error: new Error('fail') }];
    const err = new MlsBatchError(
      'Batch failed',
      failedIndices,
      successfulIndices,
      errors
    );

    it('should include failed batches', () => {
      expect(err.failedBatches).toEqual(failedIndices);
    });

    it('should include successful batches', () => {
        expect(err.successfulBatches).toEqual(successfulIndices);
    });

    it('should include per-task errors', () => {
      expect(err.errors).toEqual(errors);
    });
  });

  describe('MlsTokenError', () => {
    it('should have correct name', () => {
      const err = new MlsTokenError('Expired token');
      expect(err.name).toBe('MlsTokenError');
    });
  });

  describe('error instanceof checks', () => {
    it('should allow catching specific error types', () => {
      const err = new MlsApiError('api');
      expect(err).toBeInstanceOf(MlsApiError);
      expect(err).not.toBeInstanceOf(MlsTaskTimeoutError);
    });

    it('should allow catching parent MlsError', () => {
      const err1 = new MlsApiError('api');
      const err2 = new MlsTokenError('token');
      
      expect(err1).toBeInstanceOf(MlsError);
      expect(err2).toBeInstanceOf(MlsError);
    });
  });
});
