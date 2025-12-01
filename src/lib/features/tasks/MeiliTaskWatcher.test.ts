import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MeiliTaskWatcher from './MeiliTaskWatcher.svelte';

// Skip UI tests until environment configuration is fixed
describe.skip('MeiliTaskWatcher', () => {
  let mockTaskService: any;
  let contextMap: Map<any, any>;

  beforeEach(() => {
    mockTaskService = {
      getAllTasks: vi.fn().mockReturnValue([])
    };
    
    contextMap = new Map([
      ['taskService', mockTaskService]
    ]);
  });

  it('should throw if taskService is missing', () => {
    expect(() => render(MeiliTaskWatcher)).toThrow();
  });

  it('should render nothing if no tasks', () => {
    mockTaskService.getAllTasks.mockReturnValue([]);
    const { container } = render(MeiliTaskWatcher, { context: contextMap });
    expect(container.querySelector('.task-watcher')).toBeInTheDocument();
    expect(screen.queryByText('Active Tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('Recent Failures')).not.toBeInTheDocument();
  });

  it('should display active tasks', () => {
    mockTaskService.getAllTasks.mockReturnValue([
      { taskUid: 1, status: 'processing', type: 'indexCreation' },
      { taskUid: 2, status: 'enqueued', type: 'documentAddition' }
    ]);

    render(MeiliTaskWatcher, { context: contextMap });

    expect(screen.getByText('Active Tasks (2)')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
  });

  it('should display recent failures', () => {
    mockTaskService.getAllTasks.mockReturnValue([
      { taskUid: 3, status: 'failed', type: 'dumpCreation', error: { message: 'Disk full' } }
    ]);

    render(MeiliTaskWatcher, { context: contextMap });

    expect(screen.getByText('Recent Failures')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('Disk full')).toBeInTheDocument();
  });
});

