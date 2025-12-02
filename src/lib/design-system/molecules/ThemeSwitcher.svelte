<!--
  ThemeSwitcher Component
  A button/toggle for switching between light, dark, and auto themes

  Usage:
    <ThemeSwitcher />
    <ThemeSwitcher variant="icon" />
    <ThemeSwitcher variant="dropdown" />
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import Button from '../atoms/Button.svelte';
  import type { Writable } from 'svelte/store';

  interface ThemeContext {
    theme: Writable<'light' | 'dark' | 'auto'>;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    toggleTheme: () => void;
    systemTheme: 'light' | 'dark';
  }

  interface Props {
    variant?: 'button' | 'icon' | 'dropdown';
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
  }

  let {
    variant = 'button',
    size = 'medium',
    showLabel = true
  }: Props = $props();

  // Get theme context
  const themeContext = getContext<ThemeContext | undefined>('theme');

  // Fallback if no theme provider
  let currentTheme = $state<'light' | 'dark' | 'auto'>('auto');
  let dropdownOpen = $state(false);

  if (themeContext) {
    // Subscribe to theme changes
    themeContext.theme.subscribe(value => {
      currentTheme = value;
    });
  }

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' }
  ] as const;

  function getCurrentIcon() {
    return themes.find(t => t.value === currentTheme)?.icon || '🔄';
  }

  function getCurrentLabel() {
    return themes.find(t => t.value === currentTheme)?.label || 'Auto';
  }

  function handleToggle() {
    if (themeContext) {
      themeContext.toggleTheme();
    } else {
      // Fallback: cycle through themes
      const themeOrder: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
      const currentIndex = themeOrder.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      currentTheme = themeOrder[nextIndex];

      // Apply to document
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', currentTheme);
      }
    }
  }

  function selectTheme(theme: 'light' | 'dark' | 'auto') {
    if (themeContext) {
      themeContext.setTheme(theme);
    } else {
      currentTheme = theme;
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
    dropdownOpen = false;
  }
</script>

{#if variant === 'button'}
  <Button
    variant="secondary"
    {size}
    onclick={handleToggle}
    aria-label="Toggle theme"
  >
    <span class="theme-button-content">
      <span class="theme-icon">{getCurrentIcon()}</span>
      {#if showLabel}
        <span class="theme-label">{getCurrentLabel()}</span>
      {/if}
    </span>
  </Button>

{:else if variant === 'icon'}
  <button
    class="theme-icon-button theme-icon-{size}"
    onclick={handleToggle}
    aria-label="Toggle theme"
    title="{getCurrentLabel()} theme"
  >
    {getCurrentIcon()}
  </button>

{:else if variant === 'dropdown'}
  <div class="theme-dropdown">
    <button
      class="theme-dropdown-trigger"
      onclick={() => dropdownOpen = !dropdownOpen}
      aria-label="Select theme"
      aria-expanded={dropdownOpen}
    >
      <span class="theme-icon">{getCurrentIcon()}</span>
      {#if showLabel}
        <span class="theme-label">{getCurrentLabel()}</span>
      {/if}
      <span class="dropdown-arrow">▼</span>
    </button>

    {#if dropdownOpen}
      <div class="theme-dropdown-menu">
        {#each themes as theme}
          <button
            class="theme-option"
            class:active={currentTheme === theme.value}
            onclick={() => selectTheme(theme.value)}
          >
            <span class="theme-icon">{theme.icon}</span>
            <span>{theme.label}</span>
            {#if currentTheme === theme.value}
              <span class="checkmark">✓</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .theme-button-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .theme-icon {
    font-size: 1.2em;
    line-height: 1;
  }

  .theme-label {
    font-weight: 500;
  }

  /* Icon button variant */
  .theme-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--mls-surface-paper, #ffffff);
    border: 1px solid var(--mls-neutral-300, #e0e0e0);
    border-radius: var(--mls-radius-md, 0.375rem);
    cursor: pointer;
    font-size: 1.5rem;
    transition: all var(--mls-duration-fast, 150ms) var(--mls-ease-inOut);
  }

  .theme-icon-button:hover {
    background: var(--mls-action-hover, rgba(0, 0, 0, 0.04));
    border-color: var(--mls-neutral-400, #bdbdbd);
  }

  .theme-icon-button:active {
    transform: scale(0.95);
  }

  .theme-icon-small {
    padding: 0.25rem;
    font-size: 1.25rem;
  }

  .theme-icon-medium {
    padding: 0.5rem;
    font-size: 1.5rem;
  }

  .theme-icon-large {
    padding: 0.75rem;
    font-size: 1.75rem;
  }

  /* Dropdown variant */
  .theme-dropdown {
    position: relative;
    display: inline-block;
  }

  .theme-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--mls-surface-paper, #ffffff);
    border: 1px solid var(--mls-neutral-300, #e0e0e0);
    border-radius: var(--mls-radius-md, 0.375rem);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all var(--mls-duration-fast, 150ms) var(--mls-ease-inOut);
  }

  .theme-dropdown-trigger:hover {
    background: var(--mls-action-hover, rgba(0, 0, 0, 0.04));
    border-color: var(--mls-neutral-400, #bdbdbd);
  }

  .dropdown-arrow {
    font-size: 0.75em;
    margin-left: 0.25rem;
    transition: transform var(--mls-duration-fast, 150ms) var(--mls-ease-inOut);
  }

  .theme-dropdown-trigger[aria-expanded="true"] .dropdown-arrow {
    transform: rotate(180deg);
  }

  .theme-dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 150px;
    background: var(--mls-surface-paper, #ffffff);
    border: 1px solid var(--mls-neutral-300, #e0e0e0);
    border-radius: var(--mls-radius-md, 0.375rem);
    box-shadow: var(--mls-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    z-index: var(--mls-z-dropdown, 1000);
    overflow: hidden;
    animation: slideDown var(--mls-duration-fast, 150ms) var(--mls-ease-out);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .theme-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    text-align: left;
    transition: background var(--mls-duration-instant, 0ms);
  }

  .theme-option:hover {
    background: var(--mls-action-hover, rgba(0, 0, 0, 0.04));
  }

  .theme-option.active {
    background: var(--mls-action-selected, rgba(0, 0, 0, 0.08));
    font-weight: 500;
  }

  .checkmark {
    margin-left: auto;
    color: var(--mls-success-main, #4caf50);
  }
</style>