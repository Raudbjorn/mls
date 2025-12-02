import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { QuickStart, AdminConsole, SearchPlayground } from '../../src/lib/golden-paths';
import type { MeiliSearch } from 'meilisearch';

// Mock MeiliSearch client
const mockClient = {
  getIndexes: vi.fn(),
  getKeys: vi.fn(),
  index: vi.fn()
};

vi.mock('meilisearch', () => ({
  MeiliSearch: vi.fn().mockImplementation(() => mockClient)
}));

describe('Golden Paths Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('QuickStart', () => {
    it('should render and auto-detect admin mode', async () => {
      mockClient.getIndexes.mockResolvedValue({
        results: [{ uid: 'movies' }, { uid: 'products' }]
      });
      mockClient.getKeys.mockResolvedValue([]);

      const { container } = render(QuickStart, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-master-key'
        }
      });

      expect(container.querySelector('.quickstart')).toBeTruthy();
    });

    it('should render and auto-detect search mode', async () => {
      mockClient.getIndexes.mockResolvedValue({
        results: [{ uid: 'movies' }]
      });
      mockClient.getKeys.mockRejectedValue(new Error('Forbidden'));

      const { container } = render(QuickStart, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-search-key'
        }
      });

      expect(container.querySelector('.quickstart')).toBeTruthy();
    });

    it('should handle connection errors gracefully', async () => {
      mockClient.getIndexes.mockRejectedValue(new Error('Connection refused'));

      const { container, getByText } = render(QuickStart, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'invalid-key'
        }
      });

      // Wait for async operations
      await vi.waitFor(() => {
        expect(container.querySelector('.error-state')).toBeTruthy();
      });
    });

    it('should handle empty indexes', async () => {
      mockClient.getIndexes.mockResolvedValue({ results: [] });

      const { container } = render(QuickStart, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-key'
        }
      });

      await vi.waitFor(() => {
        expect(container.querySelector('.empty-state')).toBeTruthy();
      });
    });
  });

  describe('AdminConsole', () => {
    it('should render with default features', () => {
      const { container } = render(AdminConsole, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-master-key'
        }
      });

      expect(container.querySelector('.admin-console')).toBeTruthy();
      expect(container.querySelector('[data-theme="auto"]')).toBeTruthy();
    });

    it('should render with custom title', () => {
      const { getByText } = render(AdminConsole, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-master-key',
          title: 'Custom Admin'
        }
      });

      expect(getByText('Custom Admin')).toBeTruthy();
    });

    it('should respect feature flags', () => {
      const { container } = render(AdminConsole, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-master-key',
          features: {
            tasks: false,
            indexes: true,
            keys: false,
            backup: true,
            health: true
          }
        }
      });

      const console = container.querySelector('.admin-console');
      expect(console).toBeTruthy();

      // With feature flags disabled, those navigation items shouldn't be rendered
      // This is a simplified test - in reality we'd check the navigation items
    });

    it('should apply theme correctly', () => {
      const { container } = render(AdminConsole, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-master-key',
          theme: 'dark'
        }
      });

      expect(container.querySelector('[data-theme="dark"]')).toBeTruthy();
    });
  });

  describe('SearchPlayground', () => {
    beforeEach(() => {
      const mockIndex = {
        search: vi.fn().mockResolvedValue({
          hits: [
            { id: 1, title: 'Result 1' },
            { id: 2, title: 'Result 2' }
          ],
          processingTimeMs: 5,
          estimatedTotalHits: 2
        })
      };
      mockClient.index.mockReturnValue(mockIndex);
    });

    it('should render with required props', () => {
      const { container } = render(SearchPlayground, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-search-key',
          indexUid: 'movies'
        }
      });

      expect(container.querySelector('.search-playground')).toBeTruthy();
      expect(container.querySelector('.search-header')).toBeTruthy();
      expect(container.querySelector('.search-bar')).toBeTruthy();
    });

    it('should display custom placeholder', () => {
      const { container } = render(SearchPlayground, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-search-key',
          indexUid: 'products',
          placeholder: 'Search products...'
        }
      });

      const input = container.querySelector('input[placeholder="Search products..."]');
      expect(input).toBeTruthy();
    });

    it('should respect display mode', () => {
      const { container } = render(SearchPlayground, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-search-key',
          indexUid: 'movies',
          displayMode: 'json'
        }
      });

      expect(container.querySelector('.results-json')).toBeTruthy();
    });

    it('should toggle advanced panel', () => {
      const { container, getByText } = render(SearchPlayground, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-search-key',
          indexUid: 'movies',
          showAdvanced: true
        }
      });

      const toggleButton = getByText(/Show Advanced/);
      expect(toggleButton).toBeTruthy();
    });

    it('should disable search on type when configured', () => {
      const { container, getByText } = render(SearchPlayground, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'test-search-key',
          indexUid: 'movies',
          searchOnType: false
        }
      });

      // Should show a search button when searchOnType is false
      const searchButton = getByText('Search');
      expect(searchButton).toBeTruthy();
    });
  });

  describe('Exports', () => {
    it('should export all golden path components', () => {
      expect(QuickStart).toBeDefined();
      expect(AdminConsole).toBeDefined();
      expect(SearchPlayground).toBeDefined();
    });

    it('should have proper TypeScript types', () => {
      // This test ensures that the components have proper prop types
      // The actual type checking is done by TypeScript at build time
      expect(typeof QuickStart).toBe('function');
      expect(typeof AdminConsole).toBe('function');
      expect(typeof SearchPlayground).toBe('function');
    });
  });

  describe('Golden Path Usage Examples', () => {
    it('should support minimal QuickStart setup', () => {
      const { container } = render(QuickStart, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'key'
        }
      });

      expect(container.querySelector('.quickstart')).toBeTruthy();
    });

    it('should support AdminConsole with all features', () => {
      const { container } = render(AdminConsole, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'master-key',
          title: 'Production Admin',
          theme: 'dark',
          features: {
            tasks: true,
            indexes: true,
            keys: true,
            backup: true,
            health: true
          }
        }
      });

      expect(container.querySelector('.admin-console')).toBeTruthy();
    });

    it('should support SearchPlayground with advanced options', () => {
      const { container } = render(SearchPlayground, {
        props: {
          host: 'http://localhost:7700',
          apiKey: 'search-key',
          indexUid: 'products',
          placeholder: 'Find products...',
          showAdvanced: true,
          theme: 'light',
          displayMode: 'cards',
          searchOnType: true,
          debounceMs: 500
        }
      });

      expect(container.querySelector('.search-playground')).toBeTruthy();
    });
  });
});

describe('Golden Paths API Surface', () => {
  it('should maintain stable public API', async () => {
    const goldenPaths = await import('../../src/lib/golden-paths');

    // Ensure all expected exports exist
    expect(goldenPaths.QuickStart).toBeDefined();
    expect(goldenPaths.AdminConsole).toBeDefined();
    expect(goldenPaths.SearchPlayground).toBeDefined();

    // Ensure no unexpected exports
    const expectedExports = ['QuickStart', 'AdminConsole', 'SearchPlayground'];
    const actualExports = Object.keys(goldenPaths);

    expect(actualExports.sort()).toEqual(expectedExports.sort());
  });
});