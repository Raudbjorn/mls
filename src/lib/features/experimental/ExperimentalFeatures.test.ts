import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import ExperimentalFeatures from './ExperimentalFeatures.svelte';

// Skip UI tests until environment configuration is fixed
describe.skip('ExperimentalFeatures', () => {
  let mockClient: any;
  let contextMap: Map<any, any>;

  beforeEach(() => {
    mockClient = {
      getExperimentalFeatures: vi.fn().mockResolvedValue({
        vectorStore: false,
        metrics: true,
        logs: false
      }),
      updateExperimentalFeatures: vi.fn().mockResolvedValue({
        vectorStore: true,
        metrics: true,
        logs: false
      })
    };
    
    contextMap = new Map([
      ['meili', { client: mockClient, hasAdminRights: true }]
    ]);
  });

  it('should load features on mount', async () => {
    render(ExperimentalFeatures, { context: contextMap });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockClient.getExperimentalFeatures).toHaveBeenCalled();
      expect(screen.getByText('vectorStore')).toBeInTheDocument();
      expect(screen.getByText('metrics')).toBeInTheDocument();
    });
  });

  it('should toggle feature', async () => {
    render(ExperimentalFeatures, { context: contextMap });
    await waitFor(() => screen.getByText('vectorStore'));

    const vectorSwitch = screen.getAllByRole('checkbox')[0];
    expect(vectorSwitch).not.toBeChecked();

    await fireEvent.click(vectorSwitch);

    expect(mockClient.updateExperimentalFeatures).toHaveBeenCalledWith({ vectorStore: true });
  });

  it('should show warning for non-admin users', async () => {
    const noAdminMap = new Map([
      ['meili', { client: mockClient, hasAdminRights: false }]
    ]);
    
    render(ExperimentalFeatures, { context: noAdminMap });
    
    expect(screen.getByText('Admin rights required to configure experimental features.')).toBeInTheDocument();
    expect(mockClient.getExperimentalFeatures).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    mockClient.getExperimentalFeatures.mockRejectedValue(new Error('API Error'));
    
    render(ExperimentalFeatures, { context: contextMap });
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});
