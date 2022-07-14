<script lang="ts">
  import { client } from "./../../stores";
  import { signerAddress } from "svelte-ethers-store";
  import { getVaults } from "./orderbook-queries";
  import Switch from "src/components/Switch.svelte";
  import Button from "src/components/Button.svelte";

  $: ({ onlyOwned, owner, vaults, tokens, vaultsQueryStore } = getVaults());
  $: $owner = $signerAddress;
  $: console.log("vaults", $vaults);
  $: console.log("tokens", $tokens);
  $: console.log("store", vaultsQueryStore);
</script>

<div class="flex flex-row justify-between">
  <Switch bind:checked={$onlyOwned} />
</div>
<Button
  on:click={() => {
    vaultsQueryStore.reexecute();
  }}>Click</Button
>
