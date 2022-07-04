<script lang="ts">
  import { ethers } from "ethers";
  import Web3Modal from "web3modal";
  import { networks, providerOptions } from "../../constants";
  import { defaultEvmStores, signerAddress } from "svelte-ethers-store";
  import User from "../../components/User.svelte";
  import { selectedNetwork } from "src/stores";
  import selectNetwork from "./selectNetwork.svelte";
  import { getContext } from "svelte";


  const { open } = getContext("simple-modal");

  let providers,
    library,
    networkName,
    changedName = false;

  const web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
  });

  const connectWallet = async () => {
    try {
      await web3Modal.clearCachedProvider();
      const webProvider = await web3Modal.connect();
      const webLibrary = new ethers.providers.Web3Provider(webProvider);
      defaultEvmStores.setProvider(webProvider);
      const network = await webLibrary.getNetwork();
      
      library = webLibrary;
      // networkName = network.name;

      networks.forEach((element) => {
        if (parseInt(element.config.chainId) === network.chainId) {
          networkName = element.config.chainName;
          $selectedNetwork = element;
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
  const onNetworkChange = (text) => {
    networkName = text;
    changedName = true;
  };
</script>

<div class="flex items-center gap-y-4">
  {#if $signerAddress}
    {#if changedName}
      <span
        class="align-center ease mr-2 flex w-max cursor-pointer rounded-full bg-gray-200 px-4 py-2 text-sm font-bold text-gray-500 transition duration-300 active:bg-gray-300"
      >
        <User
          address={$signerAddress}
          name={null}
          avatar={null}
          network={networkName}
        />
      </span>
    {:else}
      <span
        class="mr-2 px-4 py-2 rounded-full text-gray-600 bg-gray-200 font-bold text-sm flex align-center w-max cursor-pointer active:bg-gray-300 transition duration-300 ease"
      >
        <User
          address={$signerAddress}
          name={null}
          avatar={null}
          network={networkName}
        />
      </span>
    {/if}
    <button
      class="rounded-md border-none bg-gray-700 px-4 py-2 text-gray-200"
      on:click={() => open(selectNetwork, { onNetworkChange, library })}
      >Change Network</button
    >
  {:else}
    <button
      class="rounded-md border-none bg-gray-700 px-4 py-2 text-gray-200"
      on:click={connectWallet}>Connect Wallet</button
    >
  {/if}
</div>
