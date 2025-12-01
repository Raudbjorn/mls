<script module lang="ts">
  import type { Meta } from '@storybook/svelte';
  import Button from './Button.svelte';

  export const meta: Meta<Button> = {
    title: 'Design System/Atoms/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: { type: 'select' },
        options: ['primary', 'secondary', 'danger', 'success', 'warning', 'link']
      },
      size: {
        control: { type: 'select' },
        options: ['small', 'medium', 'large']
      },
      disabled: {
        control: 'boolean'
      },
      loading: {
        control: 'boolean'
      },
      fullWidth: {
        control: 'boolean'
      }
    }
  };
</script>

<script lang="ts">
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Primary" args={{ variant: 'primary' }}>
  <Button {...args} onclick={() => alert('Clicked!')}>
    Primary Button
  </Button>
</Story>

<Story name="Secondary" args={{ variant: 'secondary' }}>
  <Button {...args}>Secondary Button</Button>
</Story>

<Story name="Danger" args={{ variant: 'danger' }}>
  <Button {...args}>Delete</Button>
</Story>

<Story name="Success" args={{ variant: 'success' }}>
  <Button {...args}>Save</Button>
</Story>

<Story name="Warning" args={{ variant: 'warning' }}>
  <Button {...args}>Warning</Button>
</Story>

<Story name="Link" args={{ variant: 'link' }}>
  <Button {...args}>Link Button</Button>
</Story>

<Story name="Sizes">
  <div style="display: flex; gap: 1rem; align-items: center;">
    <Button size="small">Small</Button>
    <Button size="medium">Medium</Button>
    <Button size="large">Large</Button>
  </div>
</Story>

<Story name="Loading State" args={{ loading: true }}>
  <Button {...args}>Loading...</Button>
</Story>

<Story name="Disabled State" args={{ disabled: true }}>
  <Button {...args}>Disabled</Button>
</Story>

<Story name="Full Width" args={{ fullWidth: true }}>
  <Button {...args}>Full Width Button</Button>
</Story>

<Story name="All Variants">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="danger">Danger</Button>
    <Button variant="success">Success</Button>
    <Button variant="warning">Warning</Button>
    <Button variant="link">Link</Button>
  </div>
</Story>