/**
 * i18n utilities for internationalization support
 * Provides a simple text management system ready for i18n
 */

export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

export interface I18nConfig {
  locale: string;
  fallbackLocale: string;
  messages: Record<string, TranslationMessages>;
}

// Default English messages for MLS components
export const defaultMessages: TranslationMessages = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    submit: 'Submit',
    reset: 'Reset',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    yes: 'Yes',
    no: 'No',
  },

  meili: {
    connection: {
      connecting: 'Connecting to MeiliSearch...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      error: 'Connection error',
      retry: 'Retry connection',
    },

    indexes: {
      title: 'Indexes',
      create: 'Create Index',
      delete: 'Delete Index',
      noIndexes: 'No indexes found',
      documents: '{count} documents',
      primaryKey: 'Primary Key: {key}',
    },

    search: {
      placeholder: 'Search...',
      noResults: 'No results found',
      results: '{count} results found',
      searchTime: 'Search completed in {time}ms',
      filters: 'Filters',
      facets: 'Facets',
      sorting: 'Sort by',
    },

    tasks: {
      title: 'Tasks',
      pending: 'Pending',
      processing: 'Processing',
      succeeded: 'Succeeded',
      failed: 'Failed',
      canceled: 'Canceled',
      noTasks: 'No tasks',
      taskId: 'Task #{id}',
    },

    settings: {
      title: 'Settings',
      rankingRules: 'Ranking Rules',
      searchableAttributes: 'Searchable Attributes',
      filterableAttributes: 'Filterable Attributes',
      sortableAttributes: 'Sortable Attributes',
      stopWords: 'Stop Words',
      synonyms: 'Synonyms',
      typoTolerance: 'Typo Tolerance',
    },

    backup: {
      title: 'Backup & Restore',
      createBackup: 'Create Backup',
      restoreBackup: 'Restore Backup',
      backupInProgress: 'Creating backup...',
      restoreInProgress: 'Restoring backup...',
      backupComplete: 'Backup complete',
      restoreComplete: 'Restore complete',
    },

    keys: {
      title: 'API Keys',
      create: 'Create Key',
      delete: 'Delete Key',
      masterKey: 'Master Key',
      searchKey: 'Search Key',
      adminKey: 'Admin Key',
      permissions: 'Permissions',
      expiresAt: 'Expires at',
      neverExpires: 'Never expires',
    },
  },

  errors: {
    generic: 'An error occurred',
    networkError: 'Network error',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    notFound: 'Not found',
    serverError: 'Server error',
    timeout: 'Request timeout',
    invalidInput: 'Invalid input',
    required: 'This field is required',
  },

  validation: {
    required: '{field} is required',
    minLength: '{field} must be at least {min} characters',
    maxLength: '{field} must be at most {max} characters',
    pattern: '{field} format is invalid',
    email: 'Invalid email address',
    url: 'Invalid URL',
    number: 'Must be a number',
    integer: 'Must be an integer',
    positive: 'Must be a positive number',
  },

  pagination: {
    page: 'Page {current} of {total}',
    showing: 'Showing {from} to {to} of {total}',
    rowsPerPage: 'Rows per page',
    goToPage: 'Go to page',
  },

  datetime: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    now: 'Now',
    ago: '{time} ago',
    in: 'in {time}',
    seconds: '{count, plural, =1 {second} other {seconds}}',
    minutes: '{count, plural, =1 {minute} other {minutes}}',
    hours: '{count, plural, =1 {hour} other {hours}}',
    days: '{count, plural, =1 {day} other {days}}',
    weeks: '{count, plural, =1 {week} other {weeks}}',
    months: '{count, plural, =1 {month} other {months}}',
    years: '{count, plural, =1 {year} other {years}}',
  },
};

/**
 * Simple i18n class for managing translations
 */
export class I18n {
  private locale: string;
  private fallbackLocale: string;
  private messages: Record<string, TranslationMessages>;

  constructor(config?: Partial<I18nConfig>) {
    this.locale = config?.locale || 'en';
    this.fallbackLocale = config?.fallbackLocale || 'en';
    this.messages = config?.messages || { en: defaultMessages };
  }

  /**
   * Get translated message
   */
  t(key: string, params?: Record<string, any>): string {
    const message = this.getMessage(key);
    if (!message) return key;

    // Replace parameters
    if (params) {
      return this.interpolate(message, params);
    }

    return message;
  }

  /**
   * Get message from nested object
   */
  private getMessage(key: string): string | undefined {
    const keys = key.split('.');
    let messages = this.messages[this.locale] || this.messages[this.fallbackLocale];

    for (const k of keys) {
      if (typeof messages === 'object' && k in messages) {
        messages = messages[k] as any;
      } else {
        return undefined;
      }
    }

    return typeof messages === 'string' ? messages : undefined;
  }

  /**
   * Interpolate parameters in message
   */
  private interpolate(message: string, params: Record<string, any>): string {
    return message.replace(/{(\w+)}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * Set current locale
   */
  setLocale(locale: string) {
    this.locale = locale;
  }

  /**
   * Add messages for a locale
   */
  addMessages(locale: string, messages: TranslationMessages) {
    this.messages[locale] = { ...this.messages[locale], ...messages };
  }

  /**
   * Format number
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.locale).format(value);
  }

  /**
   * Format date
   */
  formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, options).format(new Date(date));
  }

  /**
   * Format relative time
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });
    return rtf.format(value, unit);
  }

  /**
   * Format currency
   */
  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
    }).format(value);
  }

  /**
   * Format percentage
   */
  formatPercent(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
}

// Default i18n instance
export const i18n = new I18n();

/**
 * Svelte store for reactive i18n
 */
import { writable } from 'svelte/store';

export const locale = writable('en');
export const t = writable((key: string, params?: Record<string, any>) => i18n.t(key, params));

// Update t function when locale changes
locale.subscribe(newLocale => {
  i18n.setLocale(newLocale);
  t.set((key: string, params?: Record<string, any>) => i18n.t(key, params));
});