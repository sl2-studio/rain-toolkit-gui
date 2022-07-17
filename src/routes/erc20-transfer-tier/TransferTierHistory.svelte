<!-- <script lang="ts">
  import { getContext } from "svelte";
  import IconLibrary from "../../components/IconLibrary.svelte";
  import dayjs from "dayjs";
  import { selectedNetwork } from "src/stores";
  import { queryStore } from "@urql/svelte";
  import { client } from "src/stores";


  const { open } = getContext("simple-modal");
  export let tierAddress;
  export let reportingAddress
  let temp;

  $: transferTierAddress = tierAddress;
  $: signer = tierAddress ? reportingAddress.toLowerCase() : undefined;

  $: transferTierQuery = queryStore({
    client: $client,
    query: `
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
      }`,
    variables: { transferTierAddress, signer },
    requestPolicy: "network-only",
    }
  );

  // handling table refresh
  const refresh = async() => {
    temp = tierAddress;
    tierAddress = undefined;
    if (await !$transferTierQuery.fetching){
      tierAddress = temp;
    }
  };

  $: _transferTier = $transferTierQuery?.data?.erc20TransferTiers[0];

  // $: tierQuery = $transferTierQuery?.data?.erc20TransferTier[0];
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
  {:else if _transferTier != undefined && _transferTier.tierChanges != undefined && _transferTier.tierChanges.length != undefined}
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
      
      {#each _transferTier.tierChanges as transaction}
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
</div> -->
