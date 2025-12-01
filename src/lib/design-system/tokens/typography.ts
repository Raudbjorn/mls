/**
 * Design Token System - Typography
 * Typography scales and font configurations
 */

export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
    serif: string;
  };

  fontSize: {
    xs: string;    // 12px
    sm: string;    // 14px
    base: string;  // 16px
    lg: string;    // 18px
    xl: string;    // 20px
    '2xl': string; // 24px
    '3xl': string; // 30px
    '4xl': string; // 36px
    '5xl': string; // 48px
    '6xl': string; // 60px
  };

  fontWeight: {
    thin: number;      // 100
    light: number;     // 300
    normal: number;    // 400
    medium: number;    // 500
    semibold: number;  // 600
    bold: number;      // 700
    extrabold: number; // 800
    black: number;     // 900
  };

  lineHeight: {
    none: number;     // 1
    tight: number;    // 1.25
    snug: number;     // 1.375
    normal: number;   // 1.5
    relaxed: number;  // 1.625
    loose: number;    // 2
  };

  letterSpacing: {
    tighter: string;  // -0.05em
    tight: string;    // -0.025em
    normal: string;   // 0
    wide: string;     // 0.025em
    wider: string;    // 0.05em
    widest: string;   // 0.1em
  };

  // Semantic typography styles
  heading: {
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
    h4: TypographyStyle;
    h5: TypographyStyle;
    h6: TypographyStyle;
  };

  body: {
    large: TypographyStyle;
    medium: TypographyStyle;
    small: TypographyStyle;
  };

  ui: {
    button: TypographyStyle;
    label: TypographyStyle;
    caption: TypographyStyle;
    overline: TypographyStyle;
  };
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textTransform?: string;
}

export const typography: TypographyTokens = {
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Cascadia Code", "Fira Code", "SF Mono", Monaco, Consolas, "Courier New", monospace',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  heading: {
    h1: {
      fontFamily: 'inherit',
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: 'inherit',
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: 'inherit',
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: '0',
    },
    h4: {
      fontFamily: 'inherit',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: '0',
    },
    h5: {
      fontFamily: 'inherit',
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    h6: {
      fontFamily: 'inherit',
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
  },

  body: {
    large: {
      fontFamily: 'inherit',
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.625,
      letterSpacing: '0',
    },
    medium: {
      fontFamily: 'inherit',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    small: {
      fontFamily: 'inherit',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
  },

  ui: {
    button: {
      fontFamily: 'inherit',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1,
      letterSpacing: '0.025em',
      textTransform: 'uppercase',
    },
    label: {
      fontFamily: 'inherit',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    caption: {
      fontFamily: 'inherit',
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.025em',
    },
    overline: {
      fontFamily: 'inherit',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
};

// Generate CSS custom properties for typography
export function generateTypographyCSSVariables(tokens: TypographyTokens, prefix = '--mls'): string {
  const cssVars: string[] = [];

  // Font families
  Object.entries(tokens.fontFamily).forEach(([key, value]) => {
    cssVars.push(`${prefix}-font-${key}: ${value};`);
  });

  // Font sizes
  Object.entries(tokens.fontSize).forEach(([key, value]) => {
    cssVars.push(`${prefix}-text-${key}: ${value};`);
  });

  // Font weights
  Object.entries(tokens.fontWeight).forEach(([key, value]) => {
    cssVars.push(`${prefix}-font-${key}: ${value};`);
  });

  // Line heights
  Object.entries(tokens.lineHeight).forEach(([key, value]) => {
    cssVars.push(`${prefix}-leading-${key}: ${value};`);
  });

  // Letter spacing
  Object.entries(tokens.letterSpacing).forEach(([key, value]) => {
    cssVars.push(`${prefix}-tracking-${key}: ${value};`);
  });

  return cssVars.join('\n  ');
}