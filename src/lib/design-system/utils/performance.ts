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
 * Memoization decorator
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return function (this: any, ...args: Parameters<T>) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}