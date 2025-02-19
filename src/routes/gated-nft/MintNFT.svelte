<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import { push } from "svelte-spa-router";
  import { selectedNetwork } from "src/stores";
  import { GatedNFT } from "rain-sdk";
  import { Logger } from "ethers/lib/utils";

  let gatedMinter,
    mintPromise,
    errorMsg,
    gatedNFTaddress,
    recipientAddress,
    mintError;
  export let params;

  $: if (params.wild) {
    initMinter();
  }

  const initMinter = async () => {
    if (params.wild && ethers.utils.isAddress(params.wild)) {
      gatedMinter = new GatedNFT(params.wild, $signer);
    }
  };

  const mint = async () => {
    mintError = null;
    if (ethers.utils.isAddress(recipientAddress)) {
      let receipt, tx;
      try {
        tx = await gatedMinter.mint(recipientAddress);
        receipt = await tx.wait();
        return receipt;
      } catch (error) {
        if (error.code === Logger.errors.TRANSACTION_REPLACED) {
          if (error.cancelled) {
            errorMsg = "Transaction Cancelled";
            return;
          } else {
            receipt = await error.replacement.wait();
          }
        } else {
          errorMsg = error.data?.message || error?.message;
          return;
        }
      }
    } else {
      mintError = "Not a valid Ethereum address.";
    }
  };

  const handleClick = () => {
    mintPromise = mint();
  };

  const mintForSigner = () => {
    recipientAddress = $signerAddress;
    mintPromise = mint();
  };

  // NFT contract: 0x8123b0891639E9Ca7a02db53a70990c9b7EEB271
  // Wrapper contract: 0x6F6690f672a8f337DC5616d6a9Aa46d5C9d8F8F7
</script>

<div class="flex w-full max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl"> Mint an edition of a gated NFT. </span>
    <span class="text-gray-400">
      The recipient address must have the minimum tier required to receive the
      NFT.
    </span>
    {#if !params.wild}
      <span class="text-gray-400">
        Enter a Gated NFT contract address below, or browse all deployed Gated
        NFT contracts.
      </span>
    {/if}
  </div>
  {#if ethers.utils.isAddress(params.wild) && params.wild && !errorMsg}
    <FormPanel heading="Mint for an address">
      <Input
        label="Recipient wallet address:"
        bind:value={recipientAddress}
        type="string"
      />
      <div class="flex flex-row gap-x-2">
        <Button shrink on:click={handleClick}>Mint</Button>
        <Button shrink on:click={mintForSigner}>Mint to my address</Button>
      </div>
      {#if mintError}
        <span class="text-red-400">{mintError}</span>
      {:else if mintPromise}
        <div class="text-blue-400 flex flex-col gap-y-2">
          {#await mintPromise}
            <span>Minting...</span>
          {:then receipt}
            <span> NFT minted! </span>
            <span>
              <a
                target="_blank"
                class="underline"
                href={`${$selectedNetwork.blockExplorer}/tx/${receipt.transactionHash}`}
                >See transaction.</a
              >
            </span>
          {/await}
        </div>
      {/if}
    </FormPanel>
  {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
  {:else if !params.wild}
    <FormPanel>
      <Input
        bind:value={gatedNFTaddress}
        type="string"
        placeholder="Contract address"
      />
      <Button
        shrink
        on:click={() => {
          push(`/gatednft/mint/${gatedNFTaddress}`);
        }}
      >
        Load
      </Button>
    </FormPanel>
  {/if}
</div>
