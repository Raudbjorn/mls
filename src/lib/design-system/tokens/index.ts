/**
 * Design Token System
 * Central export point for all design tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { lightColors, darkColors, generateCSSVariables, type ColorTokens } from './colors';
import { typography, generateTypographyCSSVariables } from './typography';
import { spacing, radius, shadows, zIndex, animation, breakpoints, generateLayoutCSSVariables } from './spacing';

export interface Theme {
  colors: ColorTokens;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
  animation: typeof animation;
  breakpoints: typeof breakpoints;
}

// Light theme
export const lightTheme: Theme = {
  colors: lightColors,
  typography,
  spacing,
  radius,
  shadows,
  zIndex,
  animation,
  breakpoints,
};

// Dark theme
export const darkTheme: Theme = {
  colors: darkColors,
  typography,
  spacing,
  radius,
  shadows,
  zIndex,
  animation,
  breakpoints,
};

/**
 * Generate a complete CSS stylesheet with all design tokens as custom properties
 */
export function generateThemeCSS(theme: Theme, selector = ':root', prefix = '--mls'): string {
  return `
${selector} {
  /* Color Tokens */
  ${generateCSSVariables(theme.colors, prefix)}

  /* Typography Tokens */
  ${generateTypographyCSSVariables(theme.typography, prefix)}

  /* Layout Tokens */
  ${generateLayoutCSSVariables(prefix)}
}
  `.trim();
}

/**
 * Generate theme CSS for both light and dark modes
 */
export function generateAdaptiveThemeCSS(prefix = '--mls'): string {
  return `
/* Light Theme (default) */
:root {
  ${generateCSSVariables(lightColors, prefix)}
}

/* Dark Theme */
:root[data-theme="dark"] {
  ${generateCSSVariables(darkColors, prefix)}
}

/* Auto Theme - follows system preference */
@media (prefers-color-scheme: dark) {
  :root[data-theme="auto"] {
    ${generateCSSVariables(darkColors, prefix)}
  }
}

/* Shared tokens (same in both themes) */
:root {
  ${generateTypographyCSSVariables(typography, prefix)}
  ${generateLayoutCSSVariables(prefix)}
}
  `.trim();
}

/**
 * Utility function to apply theme to an element
 */
export function applyTheme(element: HTMLElement, theme: 'light' | 'dark' | 'auto') {
  element.setAttribute('data-theme', theme);
}

/**
 * Utility function to get current theme from an element
 */
export function getTheme(element: HTMLElement): string {
  return element.getAttribute('data-theme') || 'auto';
}

/**
 * Detect system color scheme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

// Export individual token collections for direct use
export const tokens = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  typography,
  spacing,
  radius,
  shadows,
  zIndex,
  animation,
  breakpoints,
};