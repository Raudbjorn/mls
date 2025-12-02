import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import BackupManager from './BackupManager.svelte';

// Mock children components to simplify testing
vi.mock('$lib/design-system/atoms/Card.svelte', () => ({
  default: { render: () => '<div><slot /></div>' }
}));
vi.mock('$lib/design-system/atoms/Button.svelte', () => ({
  default: { 
    render: () => '<button data-testid="btn"><slot /></button>' 
  }
}));
// We can use real atoms if they are simple enough, but mocking context is key.

describe('BackupManager', () => {
  let mockClient: any;
  let mockTaskService: any;
  let contextMap: Map<any, any>;

  beforeEach(() => {
    mockClient = {
      getTasks: vi.fn().mockResolvedValue({ results: [] }),
      createDump: vi.fn().mockResolvedValue({ taskUid: 1, status: 'enqueued' }),
      createSnapshot: vi.fn().mockResolvedValue({ taskUid: 2, status: 'enqueued' })
    };

    mockTaskService = {
      submitTask: vi.fn().mockResolvedValue({ taskUid: 1, status: 'succeeded' })
    };

    contextMap = new Map([
      ['meili', { client: mockClient, hasAdminRights: true }],
      ['taskService', mockTaskService]
    ]);
    
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('should render backup options when user has admin rights', async () => {
    render(BackupManager, { context: contextMap });

    expect(screen.getByText('Data Management (Backups)')).toBeInTheDocument();
    expect(screen.getByText('Create Dump')).toBeInTheDocument();
    expect(screen.getByText('Create Snapshot')).toBeInTheDocument();
  });

  it('should show warning when user lacks admin rights', async () => {
    const noAdminContext = new Map([
      ['meili', { client: mockClient, hasAdminRights: false }],
      ['taskService', mockTaskService]
    ]);

    render(BackupManager, { context: noAdminContext });

    expect(screen.getByText('Admin rights required to manage backups.')).toBeInTheDocument();
    expect(screen.queryByText('Create Dump')).not.toBeInTheDocument();
  });

  it('should list recent backup tasks on mount', async () => {
    mockClient.getTasks.mockResolvedValue({
      results: [
        { 
          uid: 1, 
          type: 'dumpCreation', 
          status: 'succeeded', 
          enqueuedAt: new Date().toISOString() 
        }
      ]
    });

    render(BackupManager, { context: contextMap });

    await waitFor(() => {
      expect(mockClient.getTasks).toHaveBeenCalledWith(expect.objectContaining({
        types: ['dumpCreation', 'snapshotCreation']
      }));
      expect(screen.getByText('Dump')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
    });
  });

  it('should create a dump when requested', async () => {
    render(BackupManager, { context: contextMap });

    const dumpBtn = screen.getByText('Create Dump');
    await fireEvent.click(dumpBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockClient.createDump).toHaveBeenCalled();
    expect(mockTaskService.submitTask).toHaveBeenCalled();
  });

  it('should create a snapshot when requested', async () => {
    render(BackupManager, { context: contextMap });

    const snapBtn = screen.getByText('Create Snapshot');
    await fireEvent.click(snapBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockClient.createSnapshot).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    mockClient.getTasks.mockRejectedValue(new Error('Failed to fetch'));
    
    render(BackupManager, { context: contextMap });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });
});

