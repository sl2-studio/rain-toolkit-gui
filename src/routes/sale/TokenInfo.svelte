<script lang="ts">
  import DisplayAddress from "./../../components/DisplayAddress.svelte";
  // import ReserveTokenArtifact from "abis/ReserveToken.json";
  import { BigNumberish, Contract, ethers, Signer } from "ethers";
  import { formatUnits } from "ethers/lib/utils";
  import { Writable } from "svelte/store";
  import FlashTooltip from "./FlashTooltip.svelte";
  import { SvelteComponent } from "svelte";
  import IconLibrary from "src/components/IconLibrary.svelte";
  import { copyToClipboard } from "src/utils";
  import { ERC20 } from "rain-sdk";

  interface TokenData {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
    totalSupply: string;
  }

  export let tokenData;
  export let signer: Writable<Signer> | undefined = undefined;
  export let token: ERC20 | undefined = undefined;

  let balancePromise: Promise<BigNumberish>;
  let tooltip: SvelteComponent;

  const checkBalance = async (token: ERC20): Promise<BigNumberish> => {
    return await token.balanceOf(await $signer.getAddress());
  };

  $: if ($signer) {
    token = token || new ERC20(tokenData.id, $signer);
    balancePromise = checkBalance(token);
  }
</script>

<div class="flex w-full flex-col items-start">
  <div class="table table-auto grid-cols-2 gap-2">
    <div class="table-row">
      <div class="table-cell text-gray-400">Token address:</div>
      <div class="table-cell pl-4 text-left">
        <FlashTooltip message="Copied!" light bind:this={tooltip}>
          <div
            class="inline-flex cursor-pointer flex-row items-center gap-x-2 transition-colors hover:text-gray-300"
            on:click={async () => {
              await copyToClipboard(tokenData.id);
              tooltip.flash();
            }}
          >
            <DisplayAddress address={tokenData.id} />
            <IconLibrary icon="copy" width={15} />
          </div>
        </FlashTooltip>
      </div>
    </div>
    <div class="table-row">
      <div class="table-cell text-gray-400">Name:</div>
      <div class="table-cell pl-4">{tokenData.name}</div>
    </div>
    <div class="table-row">
      <div class="table-cell text-gray-400">Symbol:</div>
      <div class="table-cell pl-4">{tokenData.symbol}</div>
    </div>
    <div class="table-row">
      <div class="table-cell text-gray-400">Total supply:</div>
      <div class="table-cell pl-4">
        {formatUnits(tokenData.totalSupply, tokenData.decimals)}
      </div>
    </div>
    {#if $signer && token}
      <div class="table-cell text-gray-400">Your balance:</div>
      <div class="table-cell pl-4">
        {#await balancePromise}
          Checking balance...
        {:then balance}
          {formatUnits(balance, tokenData.decimals)}
        {/await}
      </div>
    {/if}
  </div>
</div>
