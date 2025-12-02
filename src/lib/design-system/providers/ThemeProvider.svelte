<!--
  ThemeProvider Component
  Provides theme context and applies design tokens to the application

  Usage:
    <ThemeProvider theme="auto">
      <YourApp />
    </ThemeProvider>
-->
<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import { generateAdaptiveThemeCSS, applyTheme, getSystemTheme } from '../tokens';

  interface ThemeContext {
    theme: Writable<'light' | 'dark' | 'auto'>;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    toggleTheme: () => void;
    systemTheme: 'light' | 'dark';
  }

  interface Props {
    theme?: 'light' | 'dark' | 'auto';
    prefix?: string;
    injectStyles?: boolean;
    children?: any;
  }

  let {
    theme = 'auto',
    prefix = '--mls',
    injectStyles = true,
    children
  }: Props = $props();

  const themeStore = writable<'light' | 'dark' | 'auto'>(theme);
  let systemTheme = $state<'light' | 'dark'>('light');
  let styleElement: HTMLStyleElement | null = null;

  // Type guard for validating theme values
  function isValidTheme(value: string): value is 'light' | 'dark' | 'auto' {
    return ['light', 'dark', 'auto'].includes(value);
  }

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    themeStore.set(newTheme);
    if (typeof document !== 'undefined') {
      applyTheme(document.documentElement, newTheme);

      // Save preference to localStorage
      try {
        localStorage.setItem('mls-theme', newTheme);
      } catch (e) {
        console.warn(
          `Failed to save theme preference to localStorage (key: 'mls-theme', value: '${newTheme}'). ` +
          `This may be due to browser settings, private browsing mode, or storage restrictions. ` +
          `Theme preference will not persist across sessions. Error:`, e
        );
      }
    }
  };

  const toggleTheme = () => {
    themeStore.update(current => {
      const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
      const currentIndex = themes.indexOf(current);
      const nextIndex = (currentIndex + 1) % themes.length;
      const nextTheme = themes[nextIndex];
      setTheme(nextTheme);
      return nextTheme;
    });
  };

  // Provide theme context
  setContext<ThemeContext>('theme', {
    theme: themeStore,
    setTheme,
    toggleTheme,
    systemTheme
  });

  onMount(() => {
    // Detect system theme
    systemTheme = getSystemTheme();

    // Check for saved preference
    try {
      const savedTheme = localStorage.getItem('mls-theme');
      if (savedTheme && isValidTheme(savedTheme)) {
        theme = savedTheme;
        themeStore.set(theme);
      }
    } catch (e) {
      console.warn('Unable to load theme preference:', e);
    }

    // Apply initial theme
    applyTheme(document.documentElement, theme);

    // Inject design token styles if requested
    if (injectStyles && !document.getElementById('mls-theme-styles')) {
      styleElement = document.createElement('style');
      styleElement.id = 'mls-theme-styles';
      styleElement.textContent = generateAdaptiveThemeCSS(prefix);
      document.head.appendChild(styleElement);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      systemTheme = e.matches ? 'dark' : 'light';
    };

    // Listen for system theme changes (modern browsers only)
    mediaQuery.addEventListener('change', handleThemeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);

      // Optionally remove injected styles
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  });

  // React to theme prop changes
  $effect(() => {
    setTheme(theme);
  });
</script>

<div class="mls-theme-provider" data-theme={$themeStore}>
  {#if children}
    {@render children()}
  {:else}
    <slot />
  {/if}
</div>

<style>
  .mls-theme-provider {
    /* Ensure the provider fills its container */
    width: 100%;
    height: 100%;

    /* Apply base font family from tokens */
    font-family: var(--mls-font-sans, system-ui, -apple-system, sans-serif);

    /* Apply base colors */
    background-color: var(--mls-surface-background);
    color: var(--mls-text-primary);

    /* Smooth transitions for theme changes */
    transition: background-color var(--mls-duration-base, 250ms) var(--mls-ease-inOut),
                color var(--mls-duration-base, 250ms) var(--mls-ease-inOut);
  }
</style>