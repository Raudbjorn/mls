/**
 * Accessibility utilities for the design system
 * Provides helpers for ARIA attributes, keyboard navigation, and screen reader support
 */

/**
 * Keyboard codes for common navigation keys
 */
export const KeyCodes = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * ARIA role definitions
 */
export const AriaRoles = {
  // Landmark roles
  BANNER: 'banner',
  COMPLEMENTARY: 'complementary',
  CONTENTINFO: 'contentinfo',
  FORM: 'form',
  MAIN: 'main',
  NAVIGATION: 'navigation',
  REGION: 'region',
  SEARCH: 'search',

  // Widget roles
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  BUTTON: 'button',
  CHECKBOX: 'checkbox',
  COMBOBOX: 'combobox',
  DIALOG: 'dialog',
  GRID: 'grid',
  LINK: 'link',
  LISTBOX: 'listbox',
  MENU: 'menu',
  MENUBAR: 'menubar',
  MENUITEM: 'menuitem',
  OPTION: 'option',
  PROGRESSBAR: 'progressbar',
  RADIO: 'radio',
  RADIOGROUP: 'radiogroup',
  SEARCHBOX: 'searchbox',
  SLIDER: 'slider',
  SPINBUTTON: 'spinbutton',
  STATUS: 'status',
  SWITCH: 'switch',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  TEXTBOX: 'textbox',
  TOOLTIP: 'tooltip',
  TREE: 'tree',
  TREEITEM: 'treeitem',
} as const;

/**
 * ARIA live region politeness levels
 */
export const AriaLive = {
  OFF: 'off',
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
} as const;

/**
 * Trap focus within a container element
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== KeyCodes.TAB) return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Restore focus to a previous element
 */
export function restoreFocus(previousElement: HTMLElement | null) {
  if (previousElement && typeof previousElement.focus === 'function') {
    previousElement.focus();
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Get accessible label from element or its label
 */
export function getAccessibleLabel(element: HTMLElement): string | null {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labels = ariaLabelledBy
      .split(' ')
      .map(id => document.getElementById(id)?.textContent)
      .filter(Boolean)
      .join(' ');
    if (labels) return labels;
  }

  // Check associated label element
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label?.textContent) return label.textContent;
  }

  // Check if element is inside a label
  const parentLabel = element.closest('label');
  if (parentLabel?.textContent) {
    return parentLabel.textContent;
  }

  return null;
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  // Check aria-hidden
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check if any parent has aria-hidden
  let parent = element.parentElement;
  while (parent) {
    if (parent.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    parent = parent.parentElement;
  }

  // Check display and visibility
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return true;
}

// Counter for fallback ID generation
let __uniqueIdCounter = 0;

/**
 * Generate unique ID for accessibility
 */
export function generateUniqueId(prefix = 'mls'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    // Use crypto.randomUUID for better uniqueness
    const uuid = crypto.randomUUID();
    // Take first 8 characters of UUID for shorter IDs
    return `${prefix}-${uuid.substring(0, 8)}`;
  } else {
    // Fallback to counter-based approach with added randomness for better uniqueness
    __uniqueIdCounter += 1;
    const randomPart = Math.floor(Math.random() * 1e8).toString(16);
    return `${prefix}-${Date.now()}-${__uniqueIdCounter}-${randomPart}`;
  }
}

/**
 * Handle roving tabindex for list navigation
 */
export class RovingTabindex {
  private items: HTMLElement[];
  private currentIndex: number;

  constructor(container: HTMLElement, itemSelector: string) {
    this.items = Array.from(container.querySelectorAll(itemSelector));
    this.currentIndex = 0;
    this.init();
  }

  private init() {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.addEventListener('keydown', this.handleKeyDown.bind(this));
      item.addEventListener('click', () => this.setFocus(index));
    });
  }

  private handleKeyDown(e: KeyboardEvent) {
    let handled = false;
    const currentItem = e.currentTarget as HTMLElement;
    const currentIndex = this.items.indexOf(currentItem);

    switch (e.key) {
      case KeyCodes.ARROW_DOWN:
      case KeyCodes.ARROW_RIGHT:
        this.setFocus((currentIndex + 1) % this.items.length);
        handled = true;
        break;

      case KeyCodes.ARROW_UP:
      case KeyCodes.ARROW_LEFT:
        this.setFocus((currentIndex - 1 + this.items.length) % this.items.length);
        handled = true;
        break;

      case KeyCodes.HOME:
        this.setFocus(0);
        handled = true;
        break;

      case KeyCodes.END:
        this.setFocus(this.items.length - 1);
        handled = true;
        break;
    }

    if (handled) {
      e.preventDefault();
    }
  }

  private setFocus(index: number) {
    // Update tabindex
    this.items[this.currentIndex].setAttribute('tabindex', '-1');
    this.items[index].setAttribute('tabindex', '0');

    // Update focus
    this.items[index].focus();
    this.currentIndex = index;
  }

  public destroy() {
    this.items.forEach(item => {
      item.removeEventListener('keydown', this.handleKeyDown.bind(this));
      item.removeEventListener('click', () => {});
    });
  }
}

/**
 * Debounce function for reducing announcement frequency
 */
export function debounceAnnouncement(fn: Function, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format number for screen readers
 */
export function formatNumberForScreenReader(value: number, unit?: string): string {
  const formatted = new Intl.NumberFormat().format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format percentage for screen readers
 */
export function formatPercentageForScreenReader(value: number): string {
  return `${Math.round(value)} percent`;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply reduced motion styles if preferred
 */
export function applyReducedMotion(element: HTMLElement) {
  if (prefersReducedMotion()) {
    element.style.animation = 'none';
    element.style.transition = 'none';
  }
}