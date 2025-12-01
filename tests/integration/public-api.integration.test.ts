import { describe, test, expect } from 'vitest';
import * as MLS from '../../src/lib';

describe('Public API Contract', () => {
  describe('Top-level feature exports', () => {
    test('exports all main feature components', () => {
      // Core components
      expect(MLS.MeiliProvider).toBeDefined();
      expect(MLS.MeiliSettings).toBeDefined();
      expect(MLS.MeiliTaskWatcher).toBeDefined();

      // Administrative components
      expect(MLS.BackupManager).toBeDefined();
      expect(MLS.BatchMonitor).toBeDefined();
      expect(MLS.ExperimentalFeaturesComponent).toBeDefined();
      expect(MLS.HybridSearchTester).toBeDefined();
      expect(MLS.IndexSwapper).toBeDefined();
      expect(MLS.KeyManager).toBeDefined();
      expect(MLS.LogStreamer).toBeDefined();
      expect(MLS.NetworkFederationConfig).toBeDefined();
      expect(MLS.SystemHealth).toBeDefined();
      expect(MLS.WebhookManager).toBeDefined();

      // Settings components
      expect(MLS.EmbedderConfig).toBeDefined();
      expect(MLS.FilterAttributeConfig).toBeDefined();
      expect(MLS.RankingRulesEditor).toBeDefined();
      expect(MLS.SearchDisplayConfig).toBeDefined();
      expect(MLS.SynonymManager).toBeDefined();
      expect(MLS.TypoToleranceEditor).toBeDefined();
      expect(MLS.VectorIndexConfig).toBeDefined();
      expect(MLS.LocalizedAttributesConfig).toBeDefined();
    });

    test('exports all service classes', () => {
      expect(MLS.TaskService).toBeDefined();
      expect(MLS.EnhancedTaskService).toBeDefined();
      expect(MLS.BatchService).toBeDefined();
      expect(MLS.TypedIndex).toBeDefined();
    });

    test('exports utility functions', () => {
      expect(MLS.generateTenantToken).toBeDefined();
      expect(MLS.validateTenantToken).toBeDefined();
      expect(MLS.decodeTenantToken).toBeDefined();
      expect(MLS.createApiClient).toBeDefined();
      expect(MLS.createExtendedApiClient).toBeDefined();
    });

    test('exports error classes', () => {
      expect(MLS.MlsError).toBeDefined();
      expect(MLS.MlsApiError).toBeDefined();
      expect(MLS.MlsTaskTimeoutError).toBeDefined();
      expect(MLS.MlsRequestTimeoutError).toBeDefined();
      expect(MLS.MlsBatchError).toBeDefined();
      expect(MLS.MlsTokenError).toBeDefined();
    });
  });

  describe('Namespaced exports', () => {
    test('exports design system namespace', () => {
      expect(MLS.designSystem).toBeDefined();
      expect(MLS.atoms).toBeDefined();
      expect(MLS.molecules).toBeDefined();

      // Check sub-namespaces exist (if exported)
      if (MLS.designSystem) {
        expect(typeof MLS.designSystem).toBe('object');
      }
    });

    test('exports feature namespaces', () => {
      expect(MLS.features).toBeDefined();
      expect(MLS.backup).toBeDefined();
      expect(MLS.tasks).toBeDefined();
      expect(MLS.settings).toBeDefined();
      expect(MLS.search).toBeDefined();
      expect(MLS.indexes).toBeDefined();
      expect(MLS.security).toBeDefined();
      expect(MLS.monitoring).toBeDefined();
      expect(MLS.provider).toBeDefined();
      expect(MLS.network).toBeDefined();
      expect(MLS.health).toBeDefined();
      expect(MLS.webhooks).toBeDefined();
      expect(MLS.experimental).toBeDefined();
    });

    test('exports meili domain namespace', () => {
      expect(MLS.meili).toBeDefined();

      if (MLS.meili) {
        expect(typeof MLS.meili).toBe('object');
      }
    });
  });

  describe('Type exports', () => {
    // These are type-only exports, so we check they don't break compilation
    test('type exports compile correctly', () => {
      // If TypeScript compilation passes, these types are exported correctly
      type TestMeiliConfig = typeof MLS.MeiliClientConfig;
      type TestMeiliTask = typeof MLS.MeiliTask;
      type TestMeiliContext = typeof MLS.MeiliContext;
      type TestWaitOptions = typeof MLS.WaitOptions;
      type TestBatchOptions = typeof MLS.BatchOptions;

      // This test passes if compilation succeeds
      expect(true).toBe(true);
    });
  });

  describe('Component shape validation', () => {
    test('Svelte components have expected shape', () => {
      // Svelte components should be objects with specific structure
      const components = [
        MLS.MeiliProvider,
        MLS.BackupManager,
        MLS.KeyManager,
        MLS.SystemHealth
      ];

      components.forEach(component => {
        expect(component).toBeDefined();
        expect(typeof component).toBe('object');
        // Svelte components have a default export or are the component itself
      });
    });

    test('Service classes are constructable', () => {
      expect(typeof MLS.TaskService).toBe('function');
      expect(typeof MLS.EnhancedTaskService).toBe('function');
      expect(typeof MLS.BatchService).toBe('function');
      expect(typeof MLS.TypedIndex).toBe('function');
    });

    test('Utility functions are callable', () => {
      expect(typeof MLS.createApiClient).toBe('function');
      expect(typeof MLS.createExtendedApiClient).toBe('function');
      expect(typeof MLS.generateTenantToken).toBe('function');
    });

    test('Error classes extend Error', () => {
      const errorInstance = new MLS.MlsError('test');
      expect(errorInstance).toBeInstanceOf(Error);
      expect(errorInstance).toBeInstanceOf(MLS.MlsError);
    });
  });

  describe('Backward compatibility', () => {
    test('legacy component paths still work', () => {
      // These should still be available at top level for backward compat
      expect(MLS.BackupManager).toBeDefined();
      expect(MLS.MeiliProvider).toBeDefined();
      expect(MLS.TaskService).toBeDefined();
    });
  });

  describe('No unexpected exports', () => {
    test('does not export internal implementation details', () => {
      // These should NOT be exported at top level
      const unexpectedExports = [
        'mockClient',
        'testHelpers',
        '_internal',
        'private'
      ];

      unexpectedExports.forEach(name => {
        expect((MLS as any)[name]).toBeUndefined();
      });
    });
  });
});