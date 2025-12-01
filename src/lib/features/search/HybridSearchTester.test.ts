import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import HybridSearchTester from './HybridSearchTester.svelte';

// Skip UI tests until environment configuration is fixed
describe.skip('HybridSearchTester', () => {
  let mockClient: any;
  let mockIndex: any;
  let contextMap: Map<any, any>;

  beforeEach(() => {
    mockIndex = {
      search: vi.fn().mockResolvedValue({
        hits: [],
        facetDistribution: {},
        processingTimeMs: 10
      })
    };
    mockClient = {
      index: vi.fn().mockReturnValue(mockIndex)
    };
    
    contextMap = new Map([
      ['meili', { client: mockClient }]
    ]);
  });

  it('should render search controls', () => {
    render(HybridSearchTester, { props: { indexUid: 'movies' }, context: contextMap });
    expect(screen.getByPlaceholderText('Search query...')).toBeInTheDocument();
    expect(screen.getByText(/Semantic Ratio/)).toBeInTheDocument();
    expect(screen.getByLabelText('Embedder')).toBeInTheDocument();
  });

  it('should execute search with hybrid parameters', async () => {
    render(HybridSearchTester, { props: { indexUid: 'movies' }, context: contextMap });

    // Type query
    const input = screen.getByPlaceholderText('Search query...');
    await fireEvent.input(input, { target: { value: 'batman' } });

    // Click search (or wait for debounce, but click is faster for test)
    const button = screen.getByText('Search');
    await fireEvent.click(button);

    expect(mockClient.index).toHaveBeenCalledWith('movies');
    expect(mockIndex.search).toHaveBeenCalledWith('batman', expect.objectContaining({
      hybrid: {
        semanticRatio: 0.5,
        embedder: 'default'
      },
      showRankingScore: true
    }));
  });

  it('should apply filters and facets', async () => {
    render(HybridSearchTester, { props: { indexUid: 'movies' }, context: contextMap });

    const filterInput = screen.getByPlaceholderText('Filter expression');
    await fireEvent.input(filterInput, { target: { value: 'year > 2000' } });

    const facetsInput = screen.getByPlaceholderText('Attributes to facet');
    await fireEvent.input(facetsInput, { target: { value: 'genre, director' } });

    await fireEvent.click(screen.getByText('Search'));

    expect(mockIndex.search).toHaveBeenCalledWith('', expect.objectContaining({
      filter: 'year > 2000',
      facets: ['genre', 'director']
    }));
  });

  it('should display results', async () => {
    mockIndex.search.mockResolvedValue({
      hits: [{ id: 1, title: 'Batman', _rankingScore: 0.9 }],
      facetDistribution: { genre: { Action: 10 } },
      processingTimeMs: 15
    });

    render(HybridSearchTester, { props: { indexUid: 'movies' }, context: contextMap });
    await fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Found 1 hits in 15ms')).toBeInTheDocument();
      expect(screen.getByText('Score: 0.9')).toBeInTheDocument();
      expect(screen.getByText('Action: 10')).toBeInTheDocument();
    });
  });
  
  it('should handle search errors', async () => {
    mockIndex.search.mockRejectedValue(new Error('Search failed'));
    
    render(HybridSearchTester, { props: { indexUid: 'movies' }, context: contextMap });
    await fireEvent.click(screen.getByText('Search'));
    
    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });
  });
});

