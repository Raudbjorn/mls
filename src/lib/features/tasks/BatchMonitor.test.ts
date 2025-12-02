import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import BatchMonitor from './BatchMonitor.svelte';

// Skip UI tests until environment configuration is fixed
describe.skip('BatchMonitor', () => {
  let mockApi: any;
  let mockClient: any;
  let contextMap: Map<any, any>;

  beforeEach(() => {
    mockApi = {
      getBatches: vi.fn().mockResolvedValue({ results: [] })
    };

    vi.mock('../../meili/utils/api', () => ({
      createApiClient: () => mockApi
    }));

    mockClient = {};
    contextMap = new Map([
      ['meili', { client: mockClient }]
    ]);
  });

  it('should fetch batches on mount', async () => {
    render(BatchMonitor, { context: contextMap });
    expect(mockApi.getBatches).toHaveBeenCalled();
  });

  it('should display active batches', async () => {
    mockApi.getBatches.mockResolvedValue({
      results: [
        {
          uid: 1,
          status: 'processing',
          type: 'documentAddition',
          duration: 1000,
          stats: { totalSize: 500 }
        }
      ]
    });

    render(BatchMonitor, { context: contextMap });

    await waitFor(() => {
      expect(screen.getByText('Batch #1')).toBeInTheDocument();
      expect(screen.getByText('processing')).toBeInTheDocument();
      expect(screen.getByText('500 bytes')).toBeInTheDocument();
    });
  });

  it('should toggle polling', async () => {
    vi.useFakeTimers();
    render(BatchMonitor, { context: contextMap });

    const button = screen.getByText('Pause');
    await fireEvent.click(button);
    expect(screen.getByText('Resume')).toBeInTheDocument();

    await fireEvent.click(screen.getByText('Resume'));
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('should handle 404 error gracefully (feature not available)', async () => {
    mockApi.getBatches.mockRejectedValue({ status: 404, message: 'Not Found' });
    
    render(BatchMonitor, { context: contextMap });
    
    await waitFor(() => {
      expect(screen.getByText(/feature requires Meilisearch v1.9+/)).toBeInTheDocument();
    });
  });
});

