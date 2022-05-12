<script lang="ts">
  import { formatAddress } from "src/utils";
  import { query } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import IconLibrary from "../../../components/IconLibrary.svelte";
  import { allDepositQuery } from "./escrow-queries";
  import Switch from "src/components/Switch.svelte";
  import EscrowWithdrawModal from "./EscrowWithdrawModal.svelte";
  import { Contract } from "ethers";

  const { open } = getContext("simple-modal");
  export let salesContract, saleData, escrow: Contract;
  let checked = true;

  // $: txQuery = checked ? allDepositQuery : myDepositQuery;

  $: txQuery = allDepositQuery;
  // init the queries
  query(allDepositQuery);
  // query(myDepositQuery);

  // setting the query variables
  // $myDepositQuery.variables.saleAddress = salesContract.address.toLowerCase();
  // $myDepositQuery.variables.depositor = $signerAddress.toLowerCase();

  $allDepositQuery.variables.signerAddress = $signerAddress.toLowerCase();

  // handling table refresh
  const refresh = () => {
    $txQuery.reexecute();
  };
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    {console.log("deposit", txQuery)}
    <span class="text-lg font-semibold">Escrow Deposit History</span>
    <div class="flex flex-row items-center gap-x-4">
      <!-- <span class="text-sm"
        >Showing {#if !checked}only mine{:else}all transactions{/if}</span
      > -->
      <span class="text-sm">all transactions</span>
      <!-- <Switch bind:checked /> -->
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
  {:else if $txQuery?.data?.redeemableEscrowSupplyTokenWithdrawers.length}
    <table class="table-auto w-full space-y-2 text-sm">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Depositor</th>
        <th class="text-gray-400 text-left pb-2 font-light">Token Address</th>
        <th class="text-gray-400 text-left pb-2 font-light">Total Withdrawn</th>
        <th class="text-gray-400 text-left pb-2 font-light"
          >Claimable Balance</th
        >
        <th class="text-gray-400 text-left pb-2 font-light"
          >redeemable Balance</th
        >
        <!-- <th class="text-gray-400 text-left pb-2 font-light">Remaining</th> -->
      </tr>
      {#each $txQuery.data.redeemableEscrowSupplyTokenWithdrawers as data}
        <tr>
          <td> {formatAddress(data.withdrawerAddress)} </td>
          <td>
            {formatAddress(data.deposit.token.id)}
          </td>
          <!-- <td>
            {data.deposit.token.symbol}
          </td> -->
          <td class="py-2">
            {Number(
              (+formatUnits(
                data.totalWithdrawn,
                data.deposit.token.decimals
              )).toFixed(4)
            )}
            {data.deposit.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(
                data.claimable,
                data.deposit.token.decimals
              )).toFixed(4)
            )}
            {data.deposit.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(
                data.redeemableBalance,
                data.deposit.token.decimals
              )).toFixed(4)
            )}
            {data.deposit.token.symbol}
          </td>
          <td class="py-2 text-right">
            {#if data.claimable > "0"}
              <span
                class="underline cursor-pointer text-gray-400 mr-4"
                on:click={() => {
                  open(EscrowWithdrawModal, {
                    escrow,
                    data,
                    salesContract,
                    saleData,
                  });
                }}
              >
                Withdraw
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
