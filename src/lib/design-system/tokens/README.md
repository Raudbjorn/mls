# Design Tokens

A comprehensive design token system for consistent theming across the MLS library.

## Overview

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. We use them in place of hard-coded values in order to maintain a scalable and consistent visual system.

## Token Categories

### 🎨 Color Tokens
Semantic color system with light and dark theme support:
- **Primary**: Brand colors with 10 shades
- **Semantic**: Success, Error, Warning, Info
- **Neutral**: Grayscale palette (0-1000)
- **Surface**: Background and paper colors
- **Text**: Primary, secondary, disabled, hint
- **Action**: Hover, selected, disabled states

### 📝 Typography Tokens
Complete typography system:
- **Font Families**: Sans, Mono, Serif
- **Font Sizes**: xs to 6xl
- **Font Weights**: thin to black
- **Line Heights**: none to loose
- **Letter Spacing**: tighter to widest
- **Semantic Styles**: Headings (h1-h6), Body (large/medium/small), UI elements

### 📐 Spacing Tokens
Consistent spacing scale:
- **Spacing**: 0 to 96 (0rem to 24rem)
- **Border Radius**: none to full
- **Shadows**: none to 2xl + inner
- **Z-index**: Layering system with semantic names

### ⚡ Animation Tokens
Motion and transitions:
- **Durations**: instant to slower (0ms to 500ms)
- **Easing**: linear, in, out, inOut, bounce

### 📱 Breakpoints
Responsive design:
- xs: 320px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Usage

### Using ThemeProvider

The easiest way to use design tokens is with the `ThemeProvider`:

```svelte
<script>
  import { ThemeProvider } from 'mls/design-system/providers';
</script>

<ThemeProvider theme="auto">
  <YourApp />
</ThemeProvider>
```

### Using CSS Variables

All tokens are available as CSS custom properties:

```css
.my-component {
  /* Colors */
  color: var(--mls-text-primary);
  background: var(--mls-surface-paper);
  border-color: var(--mls-neutral-300);

  /* Typography */
  font-family: var(--mls-font-sans);
  font-size: var(--mls-text-base);
  font-weight: var(--mls-font-medium);
  line-height: var(--mls-leading-normal);

  /* Spacing */
  padding: var(--mls-space-4);
  margin: var(--mls-space-2);
  gap: var(--mls-space-2);

  /* Border Radius */
  border-radius: var(--mls-radius-md);

  /* Shadows */
  box-shadow: var(--mls-shadow-md);

  /* Animation */
  transition: all var(--mls-duration-base) var(--mls-ease-inOut);
}
```

### Using JavaScript Tokens

Import and use tokens directly in JavaScript:

```typescript
import { tokens, lightTheme, darkTheme } from 'mls/design-system/tokens';

// Access individual token values
const primaryColor = tokens.colors.light.primary[500];
const spacing = tokens.spacing[4];

// Use theme objects
const theme = darkTheme;
console.log(theme.colors.primary[500]);
```

### Generating Theme CSS

Generate CSS for custom themes:

```typescript
import { generateThemeCSS, generateAdaptiveThemeCSS } from 'mls/design-system/tokens';

// Generate CSS for a single theme
const css = generateThemeCSS(lightTheme, ':root', '--custom');

// Generate adaptive theme CSS (light/dark/auto)
const adaptiveCSS = generateAdaptiveThemeCSS('--custom');
```

## Theme Switching

### Using ThemeSwitcher Component

```svelte
<script>
  import { ThemeProvider, ThemeSwitcher } from 'mls/design-system';
</script>

<ThemeProvider>
  <!-- Button variant -->
  <ThemeSwitcher variant="button" />

  <!-- Icon variant -->
  <ThemeSwitcher variant="icon" size="small" />

  <!-- Dropdown variant -->
  <ThemeSwitcher variant="dropdown" showLabel={true} />
</ThemeProvider>
```

### Programmatic Theme Control

```svelte
<script>
  import { getContext } from 'svelte';

  const themeContext = getContext('theme');

  // Set specific theme
  themeContext.setTheme('dark');

  // Toggle through themes
  themeContext.toggleTheme();

  // Get current theme
  $: currentTheme = $themeContext.theme;
</script>
```

## Custom Themes

Create custom themes by extending the base tokens:

```typescript
import { lightColors, type ColorTokens } from 'mls/design-system/tokens';

// Custom brand colors
const customColors: ColorTokens = {
  ...lightColors,
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Custom brand red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  }
};

// Apply custom theme
const customTheme = {
  colors: customColors,
  typography,
  spacing,
  // ... other tokens
};
```

## Component Token Usage Examples

### Button with Tokens
```svelte
<button class="custom-button">Click me</button>

<style>
  .custom-button {
    /* Use design tokens */
    padding: var(--mls-space-2) var(--mls-space-4);
    background: var(--mls-primary-500);
    color: var(--mls-text-inverse);
    border-radius: var(--mls-radius-md);
    font-size: var(--mls-text-sm);
    font-weight: var(--mls-font-medium);
    transition: background var(--mls-duration-fast) var(--mls-ease-inOut);
  }

  .custom-button:hover {
    background: var(--mls-primary-600);
  }
</style>
```

### Card with Tokens
```svelte
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>

<style>
  .card {
    padding: var(--mls-space-6);
    background: var(--mls-surface-paper);
    border: 1px solid var(--mls-neutral-200);
    border-radius: var(--mls-radius-lg);
    box-shadow: var(--mls-shadow-md);
  }

  .card h3 {
    margin: 0 0 var(--mls-space-2) 0;
    font-size: var(--mls-text-xl);
    font-weight: var(--mls-font-semibold);
    color: var(--mls-text-primary);
  }

  .card p {
    margin: 0;
    font-size: var(--mls-text-base);
    color: var(--mls-text-secondary);
    line-height: var(--mls-leading-relaxed);
  }
</style>
```

## Responsive Design with Tokens

Use breakpoint tokens for responsive layouts:

```css
.container {
  padding: var(--mls-space-4);
}

@media (min-width: 640px) { /* sm breakpoint */
  .container {
    padding: var(--mls-space-6);
  }
}

@media (min-width: 1024px) { /* lg breakpoint */
  .container {
    padding: var(--mls-space-8);
  }
}
```

## Dark Mode Support

Components automatically adapt to theme changes:

```css
/* Light theme (default) */
.component {
  background: var(--mls-surface-paper);
  color: var(--mls-text-primary);
}

/* These values automatically change in dark mode */
[data-theme="dark"] .component {
  /* No need to override - tokens handle it */
}
```

## Best Practices

1. **Always use tokens** instead of hard-coded values
2. **Use semantic tokens** (e.g., `text-primary`) over raw colors
3. **Maintain consistency** by using the spacing scale
4. **Respect the type scale** for hierarchy
5. **Use animation tokens** for smooth transitions
6. **Test in both themes** (light and dark)
7. **Follow the shadow hierarchy** for elevation

## Token Reference

For a complete list of available tokens, see:
- `colors.ts` - Color tokens
- `typography.ts` - Typography tokens
- `spacing.ts` - Spacing, shadows, and layout tokens

Or explore them interactively in Storybook under "Design System > Tokens".