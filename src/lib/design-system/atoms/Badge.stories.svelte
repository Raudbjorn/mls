<script module lang="ts">
  import type { Meta } from '@storybook/svelte';
  import Badge from './Badge.svelte';

  export const meta: Meta<Badge> = {
    title: 'Design System/Atoms/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
      type: {
        control: { type: 'select' },
        options: ['info', 'success', 'warning', 'error', 'neutral']
      },
      size: {
        control: { type: 'select' },
        options: ['small', 'medium', 'large']
      },
      rounded: {
        control: 'boolean'
      },
      onClick: { action: 'clicked' }
    }
  };
</script>

<script lang="ts">
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Default" args={{ type: 'neutral' }}>
  <Badge {...args}>Default Badge</Badge>
</Story>

<Story name="Info" args={{ type: 'info' }}>
  <Badge {...args}>Information</Badge>
</Story>

<Story name="Success" args={{ type: 'success' }}>
  <Badge {...args}>Success</Badge>
</Story>

<Story name="Warning" args={{ type: 'warning' }}>
  <Badge {...args}>Warning</Badge>
</Story>

<Story name="Error" args={{ type: 'error' }}>
  <Badge {...args}>Error</Badge>
</Story>

<Story name="Sizes">
  <div style="display: flex; gap: 1rem; align-items: center;">
    <Badge size="small">Small</Badge>
    <Badge size="medium">Medium</Badge>
    <Badge size="large">Large</Badge>
  </div>
</Story>

<Story name="Rounded">
  <div style="display: flex; gap: 1rem;">
    <Badge rounded type="info">42</Badge>
    <Badge rounded type="success">✓</Badge>
    <Badge rounded type="warning">!</Badge>
    <Badge rounded type="error">✗</Badge>
  </div>
</Story>

<Story name="Clickable" args={{ onClick: () => alert('Badge clicked!') }}>
  <Badge {...args} type="info">Click me</Badge>
</Story>

<Story name="All Types">
  <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
    <Badge type="neutral">Neutral</Badge>
    <Badge type="info">Info</Badge>
    <Badge type="success">Success</Badge>
    <Badge type="warning">Warning</Badge>
    <Badge type="error">Error</Badge>
  </div>
</Story>

<Story name="Status Indicators">
  <div style="display: flex; gap: 1rem;">
    <Badge type="success">Active</Badge>
    <Badge type="warning">Pending</Badge>
    <Badge type="error">Failed</Badge>
    <Badge type="neutral">Draft</Badge>
  </div>
</Story>