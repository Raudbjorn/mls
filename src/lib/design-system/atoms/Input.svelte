<script lang="ts">
    export let type: 'text' | 'number' | 'email' | 'password' | 'search' = 'text';
    export let value: string | number = '';
    export let placeholder = '';
    export let disabled = false;
    export let readonly = false;
    export let error = false;
    export let id = '';
    export let name = '';
</script>

<input
    {type}
    {id}
    {name}
    bind:value
    {placeholder}
    {disabled}
    {readonly}
    class="input"
    class:error
    on:input
    on:change
    on:blur
    on:focus
    {...$$restProps}
/>

<style>
    .input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        background: white;
    }

    .input:focus {
        outline: none;
        border-color: #5c6bc0;
        box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.1);
    }

    .input:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .input:readonly {
        background: #fafafa;
    }

    .input.error {
        border-color: #f44336;
    }

    .input.error:focus {
        border-color: #f44336;
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
    }
</style>