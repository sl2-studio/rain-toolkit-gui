<script lang="ts">
  import AddressLibrary from "src/routes/address-library/AddressLibrary.svelte";

  import { createEventDispatcher, getContext } from "svelte";
  import IconLibrary from "./IconLibrary.svelte";
  import { writable } from "svelte/store";
  import Modal, { bind } from "svelte-simple-modal/src/Modal.svelte";
  import Ring from "src/components/Ring.svelte";

  const modal2 = writable(null);
  const showModal = () => modal2.set(bind(AddressLibrary, { onSelectAddress }));

  export let from: string | undefined = undefined;
  export let type: "text" | "number" | "range" | "address" = "text";
  export let value: string | number = "";
  export let placeholder = "";
  export let validator = (value: any): any => null;
  export let debounce: boolean = false;
  export let debounceTime: number = 750;
  let error: string;
  let timer;
  let validating: boolean = false;

  //--------- newly added --------
  export let min = "";
  export let max = "";
  export let disabled = false;
  //------------------------------

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

  export const validate = async () => {
    validating = true;
    const validation = await validator(value);
    validating = false;

    if (validation?.error) {
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
    validate();
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
  <div class="flex w-full flex-row items-center gap-x-2 self-stretch relative">
    <div class="w-full relative">
      <input
        type={_type}
        {value}
        {placeholder}
        on:input={handleInput}
        on:blur={validate}
        disabled={disabled || validating}
        {min}
        {max}
        class="w-full rounded-md border border-gray-500 bg-transparent p-2 font-light text-gray-200"
      />
      {#if validating}
        <div
          class="absolute right-1 top-0 bottom-0 flex flex-col justify-center"
        >
          <Ring size="30px" color="#FFF" />
        </div>
      {/if}
    </div>
    {#if type == "address"}
      {#if from == "depositModal"}
        <Modal
          show={$modal2}
          styleContent={{ color: "rgba(249, 250, 251, 1)" }}
          styleWindow={{
            backgroundColor: "rgba(17, 24, 39, 1) !important",
            width: "fit-content",
          }}
          closeButton={false}
        >
          <span class="flex-shrink cursor-pointer" on:click={showModal}
            ><IconLibrary icon="library" inline /></span
          >
        </Modal>
      {:else}
        <span class="flex-shrink cursor-pointer" on:click={openLibrary}
          ><IconLibrary icon="library" inline /></span
        >
      {/if}
    {/if}
  </div>
  {#if error}
    <span class="text-red-400">{error}</span>
  {/if}
</div>
