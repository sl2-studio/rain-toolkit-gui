<script lang="ts">
  import Select from "./Select.svelte";
  import { chainId } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import { networks } from "src/constants";
  import { hexValue } from "ethers/lib/utils";
  import { selectedNetwork } from "src/stores";

  $: if ($chainId) {
    updateSelect();
  }

  const updateSelect = () => {
    // see if the currently selected network in mm is in our list
    const connectedNetwork = networks.find((network) => {
      return (
        network.config.chainId == hexValue(ethers.BigNumber.from($chainId))
      );
    });

    // if it is, update the select to match
    if (connectedNetwork) {
      $selectedNetwork = connectedNetwork;
    } else {
      // switch network
      switchNetwork($selectedNetwork);
    }
  };

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

  // when the user changes the network in the dropdown, switch to, or add that network
  const handleChange = async () => {
    switchNetwork($selectedNetwork);
  };
</script>

<Select
  on:change={handleChange}
  bind:value={$selectedNetwork}
  items={networks}
/>
