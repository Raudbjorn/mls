/**
 * Design Token System - Colors
 * Semantic color tokens for consistent theming across the library
 */

export interface ColorTokens {
  // Primary brand colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Base
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Semantic colors
  success: {
    light: string;
    main: string;
    dark: string;
    contrast: string;
  };

  error: {
    light: string;
    main: string;
    dark: string;
    contrast: string;
  };

  warning: {
    light: string;
    main: string;
    dark: string;
    contrast: string;
  };

  info: {
    light: string;
    main: string;
    dark: string;
    contrast: string;
  };

  // Neutral colors
  neutral: {
    0: string;    // Pure white
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    1000: string; // Pure black
  };

  // Surface colors
  surface: {
    background: string;
    paper: string;
    elevated: string;
    overlay: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
    inverse: string;
  };

  // Action colors
  action: {
    active: string;
    hover: string;
    selected: string;
    disabled: string;
    disabledBackground: string;
    focus: string;
  };
}

// Default light theme colors
export const lightColors: ColorTokens = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // MeiliSearch blue
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },

  success: {
    light: '#81c784',
    main: '#4caf50',
    dark: '#388e3c',
    contrast: '#ffffff',
  },

  error: {
    light: '#e57373',
    main: '#f44336',
    dark: '#d32f2f',
    contrast: '#ffffff',
  },

  warning: {
    light: '#ffb74d',
    main: '#ff9800',
    dark: '#f57c00',
    contrast: '#000000',
  },

  info: {
    light: '#4fc3f7',
    main: '#29b6f6',
    dark: '#0288d1',
    contrast: '#ffffff',
  },

  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  surface: {
    background: '#fafafa',
    paper: '#ffffff',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)',
    inverse: '#ffffff',
  },

  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(0, 0, 0, 0.12)',
  },
};

// Dark theme colors
export const darkColors: ColorTokens = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },

  success: {
    light: '#81c784',
    main: '#66bb6a',
    dark: '#4caf50',
    contrast: '#000000',
  },

  error: {
    light: '#ef5350',
    main: '#f44336',
    dark: '#e53935',
    contrast: '#000000',
  },

  warning: {
    light: '#ffb74d',
    main: '#ffa726',
    dark: '#ff9800',
    contrast: '#000000',
  },

  info: {
    light: '#4fc3f7',
    main: '#29b6f6',
    dark: '#03a9f4',
    contrast: '#000000',
  },

  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  surface: {
    background: '#121212',
    paper: '#1e1e1e',
    elevated: '#242424',
    overlay: 'rgba(255, 255, 255, 0.12)',
  },

  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)',
    hint: 'rgba(255, 255, 255, 0.38)',
    inverse: '#000000',
  },

  action: {
    active: 'rgba(255, 255, 255, 0.54)',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(255, 255, 255, 0.12)',
  },
};

// Generate CSS custom properties from tokens
export function generateCSSVariables(colors: ColorTokens, prefix = '--mls'): string {
  const cssVars: string[] = [];

  // Primary colors
  Object.entries(colors.primary).forEach(([key, value]) => {
    cssVars.push(`${prefix}-primary-${key}: ${value};`);
  });

  // Semantic colors
  ['success', 'error', 'warning', 'info'].forEach(semantic => {
    Object.entries(colors[semantic as keyof ColorTokens]).forEach(([key, value]) => {
      cssVars.push(`${prefix}-${semantic}-${key}: ${value};`);
    });
  });

  // Neutral colors
  Object.entries(colors.neutral).forEach(([key, value]) => {
    cssVars.push(`${prefix}-neutral-${key}: ${value};`);
  });

  // Surface colors
  Object.entries(colors.surface).forEach(([key, value]) => {
    cssVars.push(`${prefix}-surface-${key}: ${value};`);
  });

  // Text colors
  Object.entries(colors.text).forEach(([key, value]) => {
    cssVars.push(`${prefix}-text-${key}: ${value};`);
  });

  // Action colors
  Object.entries(colors.action).forEach(([key, value]) => {
    cssVars.push(`${prefix}-action-${key}: ${value};`);
  });

  return cssVars.join('\n  ');
}