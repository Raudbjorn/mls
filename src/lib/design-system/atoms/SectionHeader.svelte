<script lang="ts">
  export let title: string;
  export let subtitle: string | undefined = undefined;
  export let level: 1 | 2 | 3 | 4 | 5 | 6 = 2;
</script>

<header class="section-header">
  {#if level === 1}
    <h1 class="section-header__title">{title}</h1>
  {:else if level === 2}
    <h2 class="section-header__title">{title}</h2>
  {:else if level === 3}
    <h3 class="section-header__title">{title}</h3>
  {:else if level === 4}
    <h4 class="section-header__title">{title}</h4>
  {:else if level === 5}
    <h5 class="section-header__title">{title}</h5>
  {:else}
    <h6 class="section-header__title">{title}</h6>
  {/if}

  {#if subtitle}
    <p class="section-header__subtitle">{subtitle}</p>
  {/if}

  {#if $$slots.default}
    <div class="section-header__actions">
      <slot />
    </div>
  {/if}
</header>

<style>
  .section-header {
    margin-bottom: 1.5rem;
  }

  .section-header__title {
    margin: 0;
    font-weight: 600;
    line-height: 1.2;
  }

  h1.section-header__title { font-size: 2rem; }
  h2.section-header__title { font-size: 1.5rem; }
  h3.section-header__title { font-size: 1.25rem; }
  h4.section-header__title { font-size: 1.125rem; }
  h5.section-header__title { font-size: 1rem; }
  h6.section-header__title { font-size: 0.875rem; }

  .section-header__subtitle {
    margin: 0.5rem 0 0 0;
    color: #666;
    font-size: 0.875rem;
  }

  .section-header__actions {
    margin-top: 1rem;
  }
</style>