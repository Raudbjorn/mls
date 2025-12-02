/**
 * Design Token System - Spacing
 * Consistent spacing scale for margins, padding, and gaps
 */

export interface SpacingTokens {
  // Base spacing scale (using rem units)
  0: string;     // 0
  px: string;    // 1px
  0.5: string;   // 0.125rem (2px)
  1: string;     // 0.25rem (4px)
  1.5: string;   // 0.375rem (6px)
  2: string;     // 0.5rem (8px)
  2.5: string;   // 0.625rem (10px)
  3: string;     // 0.75rem (12px)
  3.5: string;   // 0.875rem (14px)
  4: string;     // 1rem (16px)
  5: string;     // 1.25rem (20px)
  6: string;     // 1.5rem (24px)
  7: string;     // 1.75rem (28px)
  8: string;     // 2rem (32px)
  9: string;     // 2.25rem (36px)
  10: string;    // 2.5rem (40px)
  11: string;    // 2.75rem (44px)
  12: string;    // 3rem (48px)
  14: string;    // 3.5rem (56px)
  16: string;    // 4rem (64px)
  20: string;    // 5rem (80px)
  24: string;    // 6rem (96px)
  28: string;    // 7rem (112px)
  32: string;    // 8rem (128px)
  36: string;    // 9rem (144px)
  40: string;    // 10rem (160px)
  44: string;    // 11rem (176px)
  48: string;    // 12rem (192px)
  52: string;    // 13rem (208px)
  56: string;    // 14rem (224px)
  60: string;    // 15rem (240px)
  64: string;    // 16rem (256px)
  72: string;    // 18rem (288px)
  80: string;    // 20rem (320px)
  96: string;    // 24rem (384px)
}

export const spacing: SpacingTokens = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Border radius tokens
export interface RadiusTokens {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export const radius: RadiusTokens = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

// Shadow tokens
export interface ShadowTokens {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export const shadows: ShadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Z-index tokens for layering
export interface ZIndexTokens {
  auto: string;
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  dropdown: number;
  sticky: number;
  modal: number;
  popover: number;
  tooltip: number;
  notification: number;
}

export const zIndex: ZIndexTokens = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  notification: 1500,
};

// Breakpoints for responsive design
export interface BreakpointTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export const breakpoints: BreakpointTokens = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation/transition tokens
export interface AnimationTokens {
  duration: {
    instant: string;
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
  easing: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
    bounce: string;
  };
}

export const animation: AnimationTokens = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Generate CSS custom properties for spacing and layout
export function generateLayoutCSSVariables(prefix = '--mls'): string {
  const cssVars: string[] = [];

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    const cssKey = key.replace('.', '-');
    cssVars.push(`${prefix}-space-${cssKey}: ${value};`);
  });

  // Border radius
  Object.entries(radius).forEach(([key, value]) => {
    cssVars.push(`${prefix}-radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    cssVars.push(`${prefix}-shadow-${key}: ${value};`);
  });

  // Z-index
  Object.entries(zIndex).forEach(([key, value]) => {
    if (key !== 'auto') {
      cssVars.push(`${prefix}-z-${key}: ${value};`);
    }
  });

  // Animation durations
  Object.entries(animation.duration).forEach(([key, value]) => {
    cssVars.push(`${prefix}-duration-${key}: ${value};`);
  });

  // Animation easings
  Object.entries(animation.easing).forEach(([key, value]) => {
    cssVars.push(`${prefix}-ease-${key}: ${value};`);
  });

  return cssVars.join('\n  ');
}