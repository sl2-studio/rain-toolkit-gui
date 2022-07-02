<script lang="ts">
  import { formatAddress } from "src/utils";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import IconLibrary from "../../components/IconLibrary.svelte";
  import dayjs from "dayjs";
  import { selectedNetwork } from "src/stores";
  import { operationStore, query } from "@urql/svelte";
  import { AddressBook } from "rain-sdk";

  const { open } = getContext("simple-modal");
  export let tierAddress;
  let transferTierAddress;
  let signer;
  const transferTierQuery = operationStore(
    `
query ($transferTierAddress: Bytes!, $signer: Bytes!) {
  erc20TransferTiers(where: {id: $transferTierAddress}) {
    id
    address
    deployBlock
    deployTimestamp
    tierChanges(where:{account: $signer}, orderBy:changetimestamp, orderDirection: desc){
        transactionHash
        id
        startTier
        endTier
        changeblock
        changetimestamp
        sender
        account
    }
  }
}
`,
    {
      transferTierAddress,
      signer,
    },
    {
      requestPolicy: "network-only",
      url: AddressBook.getSubgraphEndpoint(
        parseInt($selectedNetwork.config.chainId, 16)
      ),
    }
  );

  query(transferTierQuery);

  // setting the query variables
  $: if (tierAddress) {
    runQuery();
  }
  const runQuery = () => {
    $transferTierQuery.variables.transferTierAddress = tierAddress;
    $transferTierQuery.variables.signer = $signerAddress.toLowerCase();
  };
  // handling table refresh
  const refresh = () => {
    $transferTierQuery.reexecute();
  };

  //   $: tierQuery = $transferTierQuery?.data?.erc20TransferTier[0];
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Your history</span>
    <div class="flex flex-row items-center gap-x-4">
      <span
        class:animate-spin={$transferTierQuery.fetching}
        class="flex flex-col justify-center"
        on:click={refresh}><IconLibrary icon="reload" /></span
      >
    </div>
  </div>
  {#if $transferTierQuery.fetching}
    Loading transactions...
  {:else if $transferTierQuery.error}
    Something went wrong.
  {:else if $transferTierQuery?.data?.erc20TransferTiers[0]?.tierChanges.length}
    <table class="table-auto w-full space-y-2 text-sm">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light ">Current Tier</th>
        <!-- <th class="text-gray-400 text-left pb-2 font-light">Changed Tier</th> -->
        <th class="text-gray-400 text-left pb-2 font-light text-center">Time</th
        >
        <th class="text-gray-400 text-left pb-2 font-light text-right pr-2"
          >View</th
        >
        <!-- <th class="text-gray-400 text-left pb-2 font-light">Price/rTKN</th>
        <th class="text-gray-400 text-left pb-2 font-light">Fee</th>
        <th class="text-gray-400 text-left pb-2 font-light">Total</th> -->
        <th />
      </tr>
      {#each $transferTierQuery?.data?.erc20TransferTiers[0].tierChanges as transaction}
        <tr class="border-b border-gray-700">
          <!-- <td> Tier {transaction.startTier} </td> -->
          <td class="w-1/4">
            {#if transaction.endTier == 1}
              Exited Tiers
            {:else}
              Tier {transaction.endTier}
            {/if}
          </td>
          <td class="text-center">
            {dayjs.unix(transaction.changetimestamp).format("MMM D h:mm:sa")}
          </td>
          <td class="py-2 text-right pr-2">
            <a
              href={`${$selectedNetwork.blockExplorer}/tx/${transaction.transactionHash}`}
              target="_blank"
            >
              <IconLibrary icon="link" color="font-gray-100" width="10" />
            </a>
          </td>
        </tr>
      {/each}
    </table>
  {:else}
    You haven't made any transactions.
  {/if}
</div>
