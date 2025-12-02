/**
 * Performance optimization utilities
 * Virtual scrolling, lazy loading, and optimization helpers
 */

import { onMount, onDestroy } from 'svelte';

/**
 * Virtual scrolling configuration
 */
export interface VirtualScrollConfig {
  itemHeight: number;
  buffer: number;
  container: HTMLElement;
  totalItems: number;
}

/**
 * Virtual scrolling implementation
 */
export class VirtualScroller {
  private itemHeight: number;
  private buffer: number;
  private container: HTMLElement;
  private totalItems: number;
  private scrollTop = 0;
  private visibleStart = 0;
  private visibleEnd = 0;
  private onUpdate: (start: number, end: number) => void;

  constructor(config: VirtualScrollConfig, onUpdate: (start: number, end: number) => void) {
    this.itemHeight = config.itemHeight;
    this.buffer = config.buffer;
    this.container = config.container;
    this.totalItems = config.totalItems;
    this.onUpdate = onUpdate;

    this.init();
  }

  private init() {
    this.container.addEventListener('scroll', this.handleScroll);
    this.calculateVisible();
  }

  private handleScroll = () => {
    this.scrollTop = this.container.scrollTop;
    this.calculateVisible();
  };

  private calculateVisible() {
    const containerHeight = this.container.clientHeight;
    const start = Math.floor(this.scrollTop / this.itemHeight) - this.buffer;
    const end = Math.ceil((this.scrollTop + containerHeight) / this.itemHeight) + this.buffer;

    this.visibleStart = Math.max(0, start);
    this.visibleEnd = Math.min(this.totalItems - 1, end);

    this.onUpdate(this.visibleStart, this.visibleEnd);
  }

  updateTotalItems(total: number) {
    this.totalItems = total;
    this.calculateVisible();
  }

  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll);
  }
}

/**
 * Lazy loading observer
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, options);

  return {
    observe: (element: Element) => observer.observe(element),
    unobserve: (element: Element) => observer.unobserve(element),
    disconnect: () => observer.disconnect(),
  };
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback wrapper
 */
export function whenIdle(callback: () => void, options?: IdleRequestOptions) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, options);
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Batch DOM updates
 */
export class DOMBatcher {
  private reads: (() => void)[] = [];
  private writes: (() => void)[] = [];
  private scheduled = false;

  read(fn: () => void) {
    this.reads.push(fn);
    this.scheduleFlush();
  }

  write(fn: () => void) {
    this.writes.push(fn);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush() {
    const reads = this.reads.slice();
    const writes = this.writes.slice();

    this.reads.length = 0;
    this.writes.length = 0;
    this.scheduled = false;

    // Execute reads first
    reads.forEach(fn => fn());
    // Then writes
    writes.forEach(fn => fn());
  }
}

/**
 * Memory-efficient list renderer
 */
export function createListRenderer<T>(
  container: HTMLElement,
  items: T[],
  renderItem: (item: T, index: number) => HTMLElement,
  options: {
    batchSize?: number;
    delay?: number;
  } = {}
) {
  const { batchSize = 10, delay = 0 } = options;
  let currentIndex = 0;

  function renderBatch() {
    const fragment = document.createDocumentFragment();
    const end = Math.min(currentIndex + batchSize, items.length);

    for (let i = currentIndex; i < end; i++) {
      fragment.appendChild(renderItem(items[i], i));
    }

    container.appendChild(fragment);
    currentIndex = end;

    if (currentIndex < items.length) {
      if (delay > 0) {
        setTimeout(renderBatch, delay);
      } else {
        requestAnimationFrame(renderBatch);
      }
    }
  }

  renderBatch();
}

/**
 * Web Worker wrapper for heavy computations
 */
export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ data: any; resolve: (value: any) => void; reject: (error: any) => void }> = [];
  private busy: Set<Worker> = new Set();

  constructor(workerScript: string, poolSize = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      this.workers.push(worker);
    }
  }

  async execute(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.getIdleWorker();

      if (worker) {
        this.runWorker(worker, data, resolve, reject);
      } else {
        this.queue.push({ data, resolve, reject });
      }
    });
  }

  private getIdleWorker(): Worker | null {
    return this.workers.find(w => !this.busy.has(w)) || null;
  }

  private runWorker(worker: Worker, data: any, resolve: (value: any) => void, reject: (error: any) => void) {
    this.busy.add(worker);

    const handleMessage = (e: MessageEvent) => {
      this.busy.delete(worker);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);

      resolve(e.data);

      // Process queue
      if (this.queue.length > 0) {
        const next = this.queue.shift()!;
        this.runWorker(worker, next.data, next.resolve, next.reject);
      }
    };

    const handleError = (e: ErrorEvent) => {
      this.busy.delete(worker);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);

      reject(e);

      // Process queue
      if (this.queue.length > 0) {
        const next = this.queue.shift()!;
        this.runWorker(worker, next.data, next.resolve, next.reject);
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    worker.postMessage(data);
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.busy.clear();
    this.queue = [];
  }
}

/**
 * Image lazy loading
 */
export function lazyLoadImage(img: HTMLImageElement, src: string, placeholder?: string) {
  if (placeholder) {
    img.src = placeholder;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });

  observer.observe(img);

  return () => observer.disconnect();
}

/**
 * Prefetch resources
 */
export function prefetch(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Memoization decorator for expensive function calls
 *
 * Creates a memoized version of a function that caches results based on arguments.
 * Uses a nested Map/WeakMap structure for efficient multi-argument caching:
 * - WeakMap for object arguments (allows garbage collection)
 * - Map for primitive arguments (stored by value)
 *
 * @template T - The function type to memoize
 * @param fn - The function to memoize
 * @returns A memoized version of the function
 *
 * @remarks
 * Cache Structure:
 * - Each argument creates a nested cache level
 * - Object arguments use WeakMap (GC-friendly)
 * - Primitive arguments use Map (persistent)
 * - Final result stored with a symbol key
 *
 * Memory Considerations:
 * - Object arguments are weakly referenced from their cache level
 * - Cache chain persists if any primitive arguments are in the path
 * - Consider clearing cache manually for long-running applications
 *
 * Limitations:
 * - Arguments are compared by reference (objects) or strict equality (primitives)
 * - Functions with non-deterministic behavior should not be memoized
 * - Circular object references are not handled specially
 *
 * @example
 * ```typescript
 * const expensiveCalculation = memoize((a: number, b: number) => {
 *   console.log('Computing...');
 *   return a + b;
 * });
 *
 * expensiveCalculation(1, 2); // Logs "Computing..." and returns 3
 * expensiveCalculation(1, 2); // Returns 3 from cache (no log)
 * ```
 *
 * @example
 * ```typescript
 * const processData = memoize((data: DataObject) => {
 *   // Expensive processing...
 *   return transformed;
 * });
 *
 * const obj = { value: 42 };
 * processData(obj); // Computes result
 * processData(obj); // Returns cached result
 * ```
 */
// Helper type: recursively build nested cache structure for argument types
type MemoizeCache<Args extends any[], R> =
  Args extends [infer First, ...infer Rest]
    ? First extends object
      ? WeakMap<First, MemoizeCache<Rest, R>>
      : Map<First, MemoizeCache<Rest, R>>
    : Map<symbol, R>;

export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  // Use nested Map/WeakMap for argument-based caching
  const cacheRoot: MemoizeCache<Parameters<T>, ReturnType<T>> = new Map();
  const RESULT_KEY = Symbol('memoizeResult');

  return function (this: any, ...args: Parameters<T>) {
    let cache: MemoizeCache<any, ReturnType<T>> = cacheRoot;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const isObject = arg !== null && (typeof arg === 'object' || typeof arg === 'function');
      let nextCache;
      if (isObject) {
        if (!(cache as WeakMap<any, any>).has(arg)) {
          (cache as WeakMap<any, any>).set(arg, new WeakMap());
        }
        nextCache = (cache as WeakMap<any, any>).get(arg);
      } else {
        if (!(cache as Map<any, any>).has(arg)) {
          (cache as Map<any, any>).set(arg, new Map());
        }
        nextCache = (cache as Map<any, any>).get(arg);
      }
      cache = nextCache;
    }
    if ((cache as Map<symbol, ReturnType<T>>).has(RESULT_KEY)) {
      return (cache as Map<symbol, ReturnType<T>>).get(RESULT_KEY);
    }
    const result = fn.apply(this, args);
    (cache as Map<symbol, ReturnType<T>>).set(RESULT_KEY, result);
    return result;
  } as T;
}