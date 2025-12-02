<script lang="ts">
  import Button from '../atoms/Button.svelte';

  export let currentPage: number = 1;
  export let totalPages: number = 1;
  export let onPageChange: ((page: number) => void) | undefined = undefined;

  $: hasPrevious = currentPage > 1;
  $: hasNext = currentPage < totalPages;
</script>

<div class="pagination">
  <Button
    variant="secondary"
    size="small"
    disabled={!hasPrevious}
    onClick={() => onPageChange?.(currentPage - 1)}
  >
    Previous
  </Button>
  
  <span class="pagination__info">
    Page {currentPage} of {totalPages}
  </span>
  
  <Button
    variant="secondary"
    size="small"
    disabled={!hasNext}
    onClick={() => onPageChange?.(currentPage + 1)}
  >
    Next
  </Button>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
  }

  .pagination__info {
    font-size: 0.875rem;
    color: #666;
  }
</style>
