<script>
  import { networks } from "src/constants";
  import { selectedNetwork } from "src/stores";
  import { getContext } from "svelte";
  import {
    defaultEvmStores,
    chainId,
    signerAddress,
  } from "svelte-ethers-store";
  import Select from "../../components/Select.svelte";

  export let onNetworkChange = () => {};
  export let library;
  let name;

  const { close } = getContext("simple-modal");

  const handleClick = async () => {
    await switchNetwork($selectedNetwork);
    onNetworkChange(name);
    close();
  };

  const switchNetwork = async (network) => {
    try {
      // await window.ethereum.request({
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.config.chainId }],
      });
      defaultEvmStores.setProvider();
      name = network.config.chainName;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          // await window.ethereum.request({
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [network.config],
          });
          defaultEvmStores.setProvider();
          name = network.config.chainName;
        } catch (addError) {}
      }
      if (switchError.code === 4001) {
        defaultEvmStores.disconnect();
      }
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
