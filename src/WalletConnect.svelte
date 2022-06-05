<script lang="ts">
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import Web3Modal from "web3modal";
  import { providerOptions, networkParams } from "./providers";
  import Button from "./components/Button.svelte";
  import Input from "./components/Input.svelte";
  import Select from "./components/Select.svelte";
  import User from "./components/User.svelte";
  import {
    defaultEvmStores,
    chainId,
    signerAddress,
  } from "svelte-ethers-store";

  let provider,
    library,
    account,
    signature,
    error,
    chainId,
    network,
    message,
    signedMessage,
    verified;

  const web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
  });

  const connectWallet = async () => {
    try {
      await web3Modal.clearCachedProvider();
      const webProvider = await web3Modal.connect();
      // const webLibrary = new ethers.providers.Web3Provider(webProvider);
      const webLibrary = defaultEvmStores.setProvider(webProvider);
      const accounts = await webLibrary.listAccounts();
      const network = await webLibrary.getNetwork();
      provider = webProvider;
      library = webLibrary;
      if (accounts) account = accounts[0];
      chainId = network.chainId;
    } catch (err) {
      console.log(err);
    }
  };

  const switchNetwork = async (network) => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[network]],
          });
        } catch (err) {
          error = err;
        }
      }
    }
  };

  const refreshState = () => {
    account = "";
    chainId = "";
    network = "";
    message = "";
    signature = "";
    verified = undefined;
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  // onMount(() => {
  //   if (web3Modal.cachedProvider) {
  //     connectWallet();
  //   }
  // });

  onMount(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) account = accounts[0];
      };

      const handleChainChanged = (_hexChainId) => {
        chainId = _hexChainId;
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  });
</script>

<div class="flex flex-col gap-y-4">
  <!-- {#if !account} -->
  <button
    class="rounded-md border-none bg-gray-700 px-4 py-2 text-gray-200"
    on:click={connectWallet}>Connect Wallet</button
  >
  <!-- {:else} -->
  <!-- <button
      class="rounded-md border-none bg-gray-700 px-4 py-2 text-gray-200"
      on:click={disconnect}>Disconnect</button
    > -->
  <!-- {/if} -->
</div>

<style>
  .walletconnect-modal__base {
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
  }
  .walletconnect-qrcode__image {
    width: calc(100% - 20%);
  }
</style>
