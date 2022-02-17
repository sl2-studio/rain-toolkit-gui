<script>
  import { ethers } from "ethers";
  import {
    connected,
    provider,
    signer,
    signerAddress,
    defaultEvmStores,
    chainId,
  } from "svelte-ethers-store";
</script>

<button
  class="rounded-md border-none bg-gray-700 px-4 py-2 text-gray-200"
  on:click={() => {
    defaultEvmStores.setProvider();
  }}>Connect</button
>
