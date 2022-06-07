<script>
  import { networks } from "src/constants";
  import { selectedNetwork } from "src/stores";
  import { getContext } from "svelte";
  import {
    defaultEvmStores,
    chainId,
    signerAddress,
  } from "svelte-ethers-store";
  import Select from "./Select.svelte";

  const { close } = getContext("simple-modal");

  const handleClick = async () => {
    await switchNetwork($selectedNetwork);
    defaultEvmStores.setProvider();
    close();
  };

  $: if ($chainId) {
    // set the provider again if the connected network changes
    defaultEvmStores.setProvider();
  }

  const switchNetwork = async (network) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.config.chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [network.config],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  };
</script>

<div class="flex flex-col gap-y-4">
  <span>Choose network:</span>
  <Select bind:value={$selectedNetwork} items={networks} />

  <button
    class="rounded-md border-none bg-gray-700 px-4 py-2 text-gray-200"
    on:click={handleClick}>Connect</button
  >
</div>
