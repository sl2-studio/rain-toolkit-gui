<script>
  import NetworkSwitcher from "src/components/NetworkSwitcher.svelte";
  import { signerAddress } from "svelte-ethers-store";
  import Connect from "../components/Connect.svelte";
  import User from "../components/User.svelte";
</script>

<div
  class="sticky top-0 z-40 flex h-16 w-full flex-row items-center justify-between border-b border-gray-700 bg-gray-900 px-5"
>
  <span class="text-xl font-light text-gray-50">Rain UI Toolkit</span>
  <div class="flex flex-row items-center gap-x-4">
    {#if $signerAddress}
      <NetworkSwitcher />
      <span class="text-gray-400">
        <User address={$signerAddress} />
      </span>
    {:else}
      <Connect />
    {/if}
  </div>
</div>
