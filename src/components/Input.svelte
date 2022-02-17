<script lang="ts">
  export let type = "text";
  export let value: string | number = "";
  export let placeholder = "";
  export let validator = (value: any): any => null;
  let error: string;

  const handleInput = (e: any) => {
    value = type.match(/^(number|range)$/) ? +e.target.value : e.target.value;
  };

  export const validate = () => {
    const validation = validator(value);
    if (validator(value)?.error) {
      ({ error } = validation);
      return {
        ok: false,
      };
    } else {
      error = null;
      return {
        ok: true,
        value,
      };
    }
  };
</script>

<div class="flex w-full flex-col gap-y-2">
  {#if $$slots.label}
    <div class="font-light text-gray-100">
      <slot name="label" />
    </div>
  {/if}
  {#if $$slots.description}
    <span class="text-gray-400">
      <slot name="description" />
    </span>
  {/if}
  <input
    {type}
    {value}
    {placeholder}
    on:input={handleInput}
    on:blur={validate}
    class="rounded-md border border-gray-500 bg-transparent p-2 font-light text-gray-200"
  />
  {#if error}
    <span class="text-red-400">{error}</span>
  {/if}
</div>
