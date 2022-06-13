<script lang="ts">
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import Web3Modal from "web3modal";
  import { providerOptions, networks } from "./constants";
  import {
    defaultEvmStores,
    chainId,
    signerAddress,
    provider,
    chainData,
  } from "svelte-ethers-store";
  import User from "./components/User.svelte";
  import { selectedNetwork } from "src/stores";
  import Select from "./components/Select.svelte";
  import selectNetwork from "./selectNetwork.svelte";
  import { getContext } from "svelte";

  const { open } = getContext("simple-modal");

  let providers,
    library,
    account,
    signature,
    error,
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
      providers = webProvider;
      library = webLibrary;
      networkName = network.name;
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
      <span class="mr-2 text-gray-400">
        <User
          address={$signerAddress}
          name={null}
          avatar={null}
          network={networkName}
        />
      </span>
    {:else}
      <span class="mr-2 text-gray-400">
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
