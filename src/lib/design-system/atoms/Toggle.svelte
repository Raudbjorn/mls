<script lang="ts">
  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let label: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let onChange: ((checked: boolean) => void) | undefined = undefined;

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    onChange?.(checked);
  }
</script>

<div class="toggle toggle--{size}">
  <label class="toggle__label" for={id}>
    <input
      type="checkbox"
      bind:checked
      on:change={handleChange}
      {disabled}
      {name}
      {id}
      class="toggle__input"
      role="switch"
      aria-checked={checked}
    />
    <span class="toggle__slider"></span>
    {#if label}
      <span class="toggle__text">{label}</span>
    {/if}
  </label>
</div>

<style>
  .toggle {
    display: inline-block;
  }

  .toggle__label {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .toggle__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle__slider {
    position: relative;
    display: inline-block;
    background-color: #ccc;
    border-radius: 34px;
    transition: background-color 0.3s;
  }

  /* Size variants */
  .toggle--small .toggle__slider {
    width: 32px;
    height: 18px;
  }

  .toggle--medium .toggle__slider {
    width: 44px;
    height: 24px;
  }

  .toggle--large .toggle__slider {
    width: 56px;
    height: 30px;
  }

  .toggle__slider::before {
    position: absolute;
    content: "";
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Size variants for slider button */
  .toggle--small .toggle__slider::before {
    width: 14px;
    height: 14px;
    top: 2px;
    left: 2px;
  }

  .toggle--medium .toggle__slider::before {
    width: 20px;
    height: 20px;
    top: 2px;
    left: 2px;
  }

  .toggle--large .toggle__slider::before {
    width: 26px;
    height: 26px;
    top: 2px;
    left: 2px;
  }

  /* Checked state */
  .toggle__input:checked + .toggle__slider {
    background-color: #007bff;
  }

  .toggle--small .toggle__input:checked + .toggle__slider::before {
    transform: translateX(14px);
  }

  .toggle--medium .toggle__input:checked + .toggle__slider::before {
    transform: translateX(20px);
  }

  .toggle--large .toggle__input:checked + .toggle__slider::before {
    transform: translateX(26px);
  }

  /* Focus state */
  .toggle__input:focus + .toggle__slider {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  /* Disabled state */
  .toggle__input:disabled + .toggle__slider {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle__input:disabled ~ .toggle__text {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle__text {
    margin-left: 0.5rem;
    font-size: 0.875rem;
  }

  .toggle--large .toggle__text {
    font-size: 1rem;
  }
</style>