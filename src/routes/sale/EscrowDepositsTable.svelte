<script lang="ts">
  import { formatAddress } from "src/utils";
  import { query } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import IconLibrary from "../../components/IconLibrary.svelte";
  import { allDepositQuery, myDepositQuery } from "./escrow-queries";
  import Switch from "src/components/Switch.svelte";
  import EscrowWithdrawModal from "./EscrowWithdrawModal.svelte";
  import { Contract } from "ethers";

  const { open } = getContext("simple-modal");
  export let salesContract, saleData, escrow: Contract;
  let checked = true;

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
  };

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
  {:else if $txQuery?.data?.redeemableEscrowSupplyTokenDeposits.length}
    <table class="table-auto w-full space-y-2 text-sm">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Depositor</th>
        <th class="text-gray-400 text-left pb-2 font-light">Token Address</th>
        <th class="text-gray-400 text-left pb-2 font-light">Symbol</th>
        <th class="text-gray-400 text-left pb-2 font-light">Deposited</th>
        <th class="text-gray-400 text-left pb-2 font-light">Total Deposited</th>
        <th class="text-gray-400 text-left pb-2 font-light">Remaining</th
>
      </tr>
      <!-- {#each $txQuery.data.redeemableEscrowSupplyTokenDeposits as deposit}
        <tr class:expanded={isExpanded}>
          <td class="flex flex-row items-center space-y-2 space-x-2">
            {#if deposit.depositorAddress.length > 1}
              <span
                class="flex flex-row items-center space-y-2 space-x-2"
                aria-expanded="false"
                on:click={() => (isExpanded = !isExpanded)}
              >
                <IconLibrary
                  icon="down-arrow"
                  color="font-gray-100"
                  width={10}
                />
                {#if isExpanded}
                  <table class="space-y-2">
                    {#each deposit.depositorAddress as address}
                      <tr>
                        {formatAddress(address)}
                      </tr>
                    {/each}
                  </table>
                {/if}
              </span>
              <span>
                {!isExpanded ? formatAddress(deposit.depositorAddress[0]) : ""}
              </span>
            {:else}
              <span class="mt-2">
                {formatAddress(deposit.depositorAddress[0])}
              </span>
            {/if}
          </td>
          <td>
            {formatAddress(deposit.token.id)}
          </td>
          <td>
            {deposit.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(
                deposit.totalDeposited,
                salesContract.reserve.decimals
              )).toFixed(4)
            )}
            {deposit.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(
                deposit.totalRemaining,
                salesContract.reserve.decimals
              )).toFixed(4)
            )}
            {deposit.token.symbol}
          </td>
          <td class="py-2 text-right">
            {#if deposit.depositorAddress.includes($signerAddress.toLowerCase())}
              <span
                class="underline cursor-pointer text-gray-400 mr-4"
                on:click={() => {
                  open(EscrowWithdrawModal, {
                    escrow,
                    deposit,
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
      {/each} -->

      {#each $txQuery.data.redeemableEscrowSupplyTokenDeposits as data}
        {#if data.deposits.length > 1}
          {#each data.deposits as deposit}
            <tr>
              <td>
                {formatAddress(deposit.depositorAddress)}
              </td>
              <td>
                {formatAddress(data.token.id)}
              </td>
              <td>
                {data.token.symbol}
              </td>
              <td class="py-2">
                {Number(
                  (+formatUnits(
                    deposit.tokenAmount,
                    data.token.decimals
                  )).toFixed(4)
                )}
                {data.token.symbol}
              </td>
              <td class="py-2">
                {Number(
                  (+formatUnits(
                    data.totalDeposited,
                    data.token.decimals
                  )).toFixed(4)
                )}
                {data.token.symbol}
              </td>
              <td class="py-2">
                {Number(
                  (+formatUnits(
                    data.totalRemaining,
                    data.token.decimals
                  )).toFixed(4)
                )}
                {data.token.symbol}
              </td>
              <td class="py-2 text-right">
                {#if deposit.depositorAddress == $signerAddress.toLowerCase()}
                  <span
                    class="underline cursor-pointer text-gray-400 mr-4"
                    on:click={() => {
                      open(EscrowWithdrawModal, {
                        escrow,
                        data,
                        salesContract
                      });
                    }}
                  >
                    Withdraw
                  </span>
                {/if}
              </td>
            </tr>
          {/each}
        {:else}
          <tr>
            <td>
              {formatAddress(data.deposits[0].depositorAddress)}
            </td>
            <td>
              {formatAddress(data.token.id)}
            </td>
            <td>
              {data.token.symbol}
            </td>
            <td class="py-2">
              {Number(
                (+formatUnits(
                  data.deposits[0].tokenAmount,
                  data.token.decimals
                )).toFixed(4)
              )}
              {data.token.symbol}
            </td>
            <td class="py-2">
              {Number(
                (+formatUnits(
                  data.totalDeposited,
                  data.token.decimals
                )).toFixed(4)
              )}
              {data.token.symbol}
            </td>
            <td class="py-2">
              {Number(
                (+formatUnits(
                  data.totalRemaining,
                  data.token.decimals
                )).toFixed(4)
              )}
              {data.token.symbol}
            </td>
            <td class="py-2 text-right">
              {#if data.deposits[0].depositorAddress == $signerAddress.toLowerCase()}
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
        {/if}
      {/each}
    </table>
  {:else}
    You haven't made any transactions.
  {/if}
</div>


<!-- {#each $txQuery.data.redeemableEscrowSupplyTokenDeposits as data}
        <tr>
          <td class="flex flex-row items-center space-y-2 space-x-2">
            {formatAddress(data.depositorAddress)}
          </td>
          <td>
            {formatAddress(data.token.id)}
          </td>
          <td>
            {data.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(
                data.totalDeposited,
                data.token.decimals
              )).toFixed(4)
            )}
            {data.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(
                data.totalRemaining,
                data.token.decimals
              )).toFixed(4)
            )}
            {data.token.symbol}
          </td>
          <td class="py-2 text-right">
            {#if data.depositorAddress.includes($signerAddress.toLowerCase())}
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
{/each} -->