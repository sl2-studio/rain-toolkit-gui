<script lang="ts">
  import { formatAddress } from "src/utils";
  import { query } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import IconLibrary from "../../../components/IconLibrary.svelte";
  import {
    allPendingDepositQuery,
    myPendingDepositQuery,
  } from "./escrow-queries";
  import Switch from "src/components/Switch.svelte";
  import { Contract } from "ethers";
  import { saleStatuses } from "../sale";
  import EscrowSweepPendingModal from "./EscrowSweepPendingModal.svelte";

  const { open } = getContext("simple-modal");

  export let salesContract, escrow: Contract;

  let checked = true;

  $: txQuery = checked ? allPendingDepositQuery : myPendingDepositQuery;

  // init the queries
  query(allPendingDepositQuery);
  query(myPendingDepositQuery);

  // setting the query variables
  $myPendingDepositQuery.variables.saleAddress =
    salesContract.address.toLowerCase();
  $myPendingDepositQuery.variables.depositor = $signerAddress.toLowerCase();

  $allPendingDepositQuery.variables.saleAddress =
    salesContract.address.toLowerCase();

  // handling table refresh
  const refresh = () => {
    $txQuery.reexecute();
  };

  // aliases for convenience
  $: saleStatus =
    saleStatuses[
      $txQuery?.data?.redeemableEscrowPendingDepositorTokens[0]?.iSale
        ?.saleStatus
    ];
  $: token = $txQuery?.data?.redeemableEscrowPendingDepositorTokens[0]?.token;
</script>

<div class="flex w-full flex-col gap-y-4">
  <!-- {console.log("txquery in pending deposit", txQuery)} -->
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Escrow Pending Deposit History</span>
    <div class="flex flex-row items-center gap-x-4">
      <span class="text-sm"
        >Showing {#if !checked}only mine{:else}all transactions{/if}</span
      >
      <Switch bind:checked />
      <span
        class:animate-spin={$txQuery.fetching}
        class="flex flex-col justify-center"
        on:click={refresh}><IconLibrary icon="reload" /></span
      >
    </div>
  </div>
  {#if $txQuery.fetching}
    Loading transactions...
  {:else if $txQuery.error}
    Something went wrong.
  {:else if $txQuery?.data?.redeemableEscrowPendingDepositorTokens.length}
    <table class="table-auto w-full space-y-2 text-sm">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Depositor</th>
        <th class="text-gray-400 text-left pb-2 font-light">Token Address</th>
        <th class="text-gray-400 text-left pb-2 font-light">Symbol</th>
        <th class="text-gray-400 text-left pb-2 font-light">Deposited Amount</th
        >
      </tr>
      {#each $txQuery.data.redeemableEscrowPendingDepositorTokens as data}
        <tr>
          <td> {formatAddress(data.depositorAddress)} </td>
          <td>
            {formatAddress(data.token.id)}
          </td>
          <td>
            {data.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(data.totalDeposited, data.token.decimals)).toFixed(
                4
              )
            )}
            {data.token.symbol}
          </td>
          <td class="py-2 text-right">
            {#if (saleStatus == "Success" || saleStatus == "Fail") && data.swept == false}
              <span
                class="underline cursor-pointer text-gray-400 mr-4"
                on:click={() => {
                  open(EscrowSweepPendingModal, {
                    escrow,
                    data,
                  });
                }}
              >
                Sweeping
              </span>
            {/if}
          </td>
        </tr>
      {/each}
    </table>
  {:else}
    You haven't made any transactions.
  {/if}
</div>
