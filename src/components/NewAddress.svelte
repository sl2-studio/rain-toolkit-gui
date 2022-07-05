<script lang="ts">
  import NewAlias from "src/routes/address-library/NewAlias.svelte";

  import { formatAddress } from "src/utils";
  import { getContext } from "svelte";
  import IconLibrary from "./IconLibrary.svelte";

  const { open } = getContext("simple-modal");

  export let address, type;

  const handleSave = () => {
    open(NewAlias, { address, type });
  };
</script>

<div
  class="inline-flex flex-row items-center gap-x-2 self-start rounded-3xl bg-gray-700 px-4 py-2 text-gray-200"
>
  <div>{formatAddress(address)}</div>
  <span class="pointer" on:click={handleSave}
    ><IconLibrary inline icon="add" width={15} /></span
  >
</div>

<style>
  .pointer {
    cursor: pointer;
  }
</style>
