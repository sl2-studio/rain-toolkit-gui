<script lang="ts">
  import { formatAddress } from "src/utils";
  import { query } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signer, signerAddress } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import IconLibrary from "../../../components/IconLibrary.svelte";
  import { allDepositQuery, myDepositQuery } from "./escrow-queries";
  import Switch from "src/components/Switch.svelte";
  import EscrowWithdrawModal from "./EscrowWithdrawModal.svelte";
  import { getERC20 } from "src/utils";
  import { onMount } from "svelte/internal";

  const { open } = getContext("simple-modal");
  export let salesContract, saleData, token;
  let checked = true;
  let signerBalance, decimals, symbol;

  $: txQuery = checked ? allDepositQuery : myDepositQuery;

  // init the queries
  query(allDepositQuery);
  query(myDepositQuery);

  // setting the query variables
  $myDepositQuery.variables.saleAddress = salesContract.address.toLowerCase();
  $myDepositQuery.variables.depositor = $signerAddress.toLowerCase();

  $allDepositQuery.variables.saleAddress = salesContract.address.toLowerCase();

  // handling table refresh
  const refresh = () => {
    $txQuery.reexecute();
    tokenDetails();
  };

  const tokenDetails = async () => {
    signerBalance = await token.balanceOf($signerAddress.toLowerCase());
    decimals = await token.decimals();
    symbol = await token.symbol();
  };

  onMount(() => {
    tokenDetails();
  });
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Escrow Deposit History</span>

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
  {:else if $txQuery?.data?.redeemableEscrowSupplyTokenWithdrawers.length}
    <table class="table-auto w-full space-y-2 text-sm">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Depositor</th>
        <th class="text-gray-400 text-left pb-2 font-light">Token Address</th>
        <th class="text-gray-400 text-left pb-2 font-light"
          >Claimable Balance</th
        >
        <th class="text-gray-400 text-left pb-2 font-light"
          >Raise Token Supply</th
        >
        <th class="text-gray-400 text-left pb-2 font-light">Total Withdrawn</th>
      </tr>
      {#each $txQuery.data.redeemableEscrowSupplyTokenWithdrawers as data}
        <tr>
          <td> {formatAddress(data.withdrawerAddress)} </td>
          <td>
            {formatAddress(data.deposit.token.id)}
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
                data.deposit.redeemableSupply,
                data.deposit.token.decimals
              )).toFixed(4)
            )}
            {symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(
                data.totalWithdrawn,
                data.deposit.token.decimals
              )).toFixed(4)
            )}
            {data.deposit.token.symbol}
          </td>
          <td class="py-2 text-right">
            {#if formatUnits(signerBalance, decimals) !== "0.0" && data.deposit.totalRemaining !== "0"}
              <span
                class="underline cursor-pointer text-gray-400 mr-4"
                on:click={() => {
                  open(EscrowWithdrawModal, {
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
