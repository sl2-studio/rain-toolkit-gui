<script>
  import { signerAddress } from "svelte-ethers-store";
  import Connect from "../components/Connect.svelte";
  import User from "../components/User.svelte";
</script>

<div
  class="sticky top-0 z-40 flex h-16 w-full flex-row items-center justify-between border-b border-gray-700 bg-gray-900 px-5"
>
  <span class="text-xl font-light text-gray-50">Rain UI Toolkit</span>
  <span class="text-gray-400">
    {#if $signerAddress}
      <User address={$signerAddress} />
    {:else}
      <Connect />
    {/if}
  </span>
</div>
