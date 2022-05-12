<script lang="ts">
  import { Contract, ContractReceipt } from "ethers";
  import { ethers } from "ethers";
  import { selectedNetwork } from "src/stores";
  import NewAddress from "./NewAddress.svelte";
  import Ring from "./Ring.svelte";

  export let deployPromise: Promise<Contract>;
  export let type: string;

  let contractAddress;

  deployPromise.then((receipt) => {
    console.log("receipt", receipt);

    contractAddress = receipt.address;
  });
</script>

<div class="flex flex-col gap-y-2">
  {#await deployPromise}
    <div class="flex flex-row gap-x-4 items-center">
      <Ring color="#FFFFFF" />
      <span class="text-lg">
        Deploying new {type}...
      </span>
    </div>
  {:then receipt}
    <span class="text-lg font-semibold">New {type} deployed!</span>
    <div class="flex flex-row items-center gap-x-2">
      <span>Save to library: </span><NewAddress
        address={contractAddress}
        {type}
      />
    </div>
    <span>
      <a
        target="_blank"
        class="underline"
        href={`${$selectedNetwork.blockExplorer}/address/${contractAddress}`}
      >
        View contract on block explorer
      </a>
    </span>
    <!-- <span>
      <a
        target="_blank"
        class="underline"
        href={`${$selectedNetwork.blockExplorer}/tx/${receipt.transactionHash}`}
      >
        View transaction on block explorer
      </a>
    </span> -->
  {:catch error}
    <div class="text-red-400">{error.message}</div>
  {/await}
</div>
