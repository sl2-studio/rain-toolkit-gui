<script lang="ts">
  import AddressLibrary from "src/routes/address-library/AddressLibrary.svelte";

  import { createEventDispatcher, getContext } from "svelte";
  import IconLibrary from "./IconLibrary.svelte";

  export let type: "text" | "number" | "address" = "text";
  export let value: string | number = "";
  export let placeholder = "";
  export let validator = (value: any): any => null;
  export let debounce: boolean = false;
  export let debounceTime: number = 750;
  let error: string;
  let timer;

  $: _type = type == "address" ? "text" : type;

  const dispatch = createEventDispatcher();
  const { open } = getContext("simple-modal");

  const handleInput = (e: any) => {
    const v = type.match(/^(number|range)$/) ? +e.target.value : e.target.value;
    if (debounce) {
      doDebounce(v);
    } else {
      value = v;
      dispatch("input", v);
    }
  };

  const doDebounce = (v) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      value = v;
      dispatch("input", v);
    }, debounceTime);
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

  const openLibrary = () => {
    open(AddressLibrary, { onSelectAddress });
  };

  const onSelectAddress = (address) => {
    value = address;
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
  <div class="flex w-full flex-row items-center gap-x-2 self-stretch">
    <input
      type={_type}
      {value}
      {placeholder}
      on:input={handleInput}
      on:blur={validate}
      class="w-full rounded-md border border-gray-500 bg-transparent p-2 font-light text-gray-200"
    />
    {#if type == "address"}
      <span class="flex-shrink cursor-pointer" on:click={openLibrary}
        ><IconLibrary icon="library" inline /></span
      >
    {/if}
  </div>
  {#if error}
    <span class="text-red-400">{error}</span>
  {/if}
</div>
