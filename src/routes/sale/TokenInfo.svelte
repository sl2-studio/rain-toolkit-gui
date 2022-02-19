<script lang="ts">
  import ReserveTokenArtifact from "abis/ReserveToken.json";
  import { BigNumberish, Contract, ethers, Signer } from "ethers";
  import { formatUnits } from "ethers/lib/utils";
  import { Writable } from "svelte/store";

  interface TokenData {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
    totalSupply: string;
  }

  export let tokenData: TokenData;
  export let signer: Writable<Signer> | undefined = undefined;
  export let token: Contract | undefined = undefined;

  let balancePromise: Promise<BigNumberish>;

  const checkBalance = async (token: Contract): Promise<BigNumberish> => {
    return await token.balanceOf($signer.getAddress());
  };

  $: if ($signer) {
    token =
      token ||
      new ethers.Contract(tokenData.id, ReserveTokenArtifact.abi, $signer);
    balancePromise = checkBalance(token);
  }
</script>

<div class="flex w-full flex-col items-start">
  <div class="table table-auto grid-cols-2 gap-2">
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
