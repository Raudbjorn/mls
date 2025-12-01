import { describe, it, expect } from 'vitest';
import * as lib from '$lib';

/**
 * Integration Tests - Library Exports
 *
 * Tests that verify the library's public API is correctly exported
 * and usable by consumers, including backward compatibility with
 * the new atomic design structure.
 *
 * Goal: "Does my published package behave in a consumer app?"
 */
describe('Integration: Library Exports', () => {
  describe('backward compatible component exports', () => {
    it('should export MeiliProvider', () => {
      expect(lib.MeiliProvider).toBeDefined();
    });

    it('should export all admin components', () => {
      expect(lib.BackupManager).toBeDefined();
      expect(lib.BatchMonitor).toBeDefined();
      expect(lib.SystemHealth).toBeDefined();
      expect(lib.WebhookManager).toBeDefined();
    });

    it('should export all settings components', () => {
      expect(lib.EmbedderConfig).toBeDefined();
      expect(lib.FilterAttributeConfig).toBeDefined();
      expect(lib.RankingRulesEditor).toBeDefined();
      expect(lib.SynonymManager).toBeDefined();
    });
  });

  describe('service exports', () => {
    it('should export TaskService', () => {
      expect(lib.TaskService).toBeDefined();
    });

    it('should export EnhancedTaskService', () => {
      expect(lib.EnhancedTaskService).toBeDefined();
    });

    it('should export BatchService', () => {
      expect(lib.BatchService).toBeDefined();
    });

    it('should export TypedIndex', () => {
      expect(lib.TypedIndex).toBeDefined();
    });
  });

  describe('utility exports', () => {
    it('should export token utilities', () => {
      expect(lib.generateTenantToken).toBeDefined();
      expect(lib.validateTenantToken).toBeDefined();
      expect(lib.decodeTenantToken).toBeDefined();
    });

    it('should export API client factory', () => {
      expect(lib.createApiClient).toBeDefined();
    });

    it('should export extended API client', () => {
      expect(lib.createExtendedApiClient).toBeDefined();
    });
  });

  describe('error exports', () => {
    it('should export all error classes', () => {
      expect(lib.MlsError).toBeDefined();
      expect(lib.MlsApiError).toBeDefined();
      expect(lib.MlsTaskTimeoutError).toBeDefined();
      expect(lib.MlsRequestTimeoutError).toBeDefined();
      expect(lib.MlsBatchError).toBeDefined();
      expect(lib.MlsTokenError).toBeDefined();
    });
  });

  describe('atomic design structure exports', () => {
    it('should export design system namespace', () => {
      expect(lib.designSystem).toBeDefined();
      expect(lib.atoms).toBeDefined();
      expect(lib.molecules).toBeDefined();
    });

    it('should export feature namespaces', () => {
      expect(lib.features).toBeDefined();
      expect(lib.backup).toBeDefined();
      expect(lib.tasks).toBeDefined();
      expect(lib.settings).toBeDefined();
      expect(lib.search).toBeDefined();
      expect(lib.security).toBeDefined();
      expect(lib.monitoring).toBeDefined();
      expect(lib.health).toBeDefined();
    });

    it('should export meili domain namespace', () => {
      expect(lib.meili).toBeDefined();
    });

    it('should have atoms available through namespace', () => {
      expect(lib.atoms.Button).toBeDefined();
      expect(lib.atoms.Card).toBeDefined();
      expect(lib.atoms.Badge).toBeDefined();
      expect(lib.atoms.Input).toBeDefined();
      expect(lib.atoms.LoadingSpinner).toBeDefined();
      expect(lib.atoms.ErrorMessage).toBeDefined();
      expect(lib.atoms.EmptyState).toBeDefined();
    });

    it('should have molecules available through namespace', () => {
      expect(lib.molecules.SettingRow).toBeDefined();
      expect(lib.molecules.FormField).toBeDefined();
      expect(lib.molecules.TaskItem).toBeDefined();
    });
  });
});
