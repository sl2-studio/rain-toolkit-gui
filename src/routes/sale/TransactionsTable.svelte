<script lang="ts">
  import { formatAddress } from "src/utils";
  import RefundModal from "./RefundModal.svelte";
  import { query } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress, chainId } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import IconLibrary from "components/IconLibrary.svelte";
  import dayjs from "dayjs";
  import { selectedNetwork } from "src/stores";
  import { allTxQuery, myTxQuery } from "./sale-queries";
  import Switch from "src/components/Switch.svelte";
  import { AddressBook } from "rain-sdk";

  const { open } = getContext("simple-modal");
  export let saleContract;

  let checked = true;

  $: txQuery = checked ? allTxQuery : myTxQuery;

  // init the queries
  query(allTxQuery);
  query(myTxQuery);

  // setting the query variables
  $myTxQuery.variables.saleContractAddress = saleContract.address.toLowerCase();
  $myTxQuery.variables.sender = $signerAddress.toLowerCase();

  $allTxQuery.variables.saleContractAddress =
    saleContract.address.toLowerCase();

  // handling table refresh
  const refresh = () => {
    $txQuery.reexecute();
  };

  // $: if (parseInt($selectedNetwork.config.chainId, 16) == $chainId) {
  //   $txQuery.reexecute({
  //     requestPolicy: "network-only",
  //     url: AddressBook.getSubgraphEndpoint(
  //       parseInt($selectedNetwork.config.chainId, 16)
  //     ),
  //   });
  // }

  // aliases for convenience
  $: reserve = $txQuery?.data?.saleTransactions[0]?.saleContract.reserve;
  $: token = $txQuery?.data?.saleTransactions[0]?.saleContract.token;
  $: sale = $txQuery?.data?.saleTransactions[0]?.saleContract;

  // mapping transaction type to a readable version
  const typeMap = new Map([
    ["SaleBuy", "Buy"],
    ["SaleRefund", "Refund"],
  ]);
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Transaction history</span>
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
  {:else if $txQuery?.data?.saleTransactions.length}
    <table class="table-auto w-full space-y-2 text-sm">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Sender</th>
        <th class="text-gray-400 text-left pb-2 font-light">Type</th>
        <th class="text-gray-400 text-left pb-2 font-light">Time</th>
        <th class="text-gray-400 text-left pb-2 font-light">Units</th>
        <th class="text-gray-400 text-left pb-2 font-light">Price/rTKN</th>
        <th class="text-gray-400 text-left pb-2 font-light">Fee</th>
        <th class="text-gray-400 text-left pb-2 font-light">Total</th>
        <th />
      </tr>
      {#each $txQuery.data.saleTransactions as transaction}
        <tr>
          <td> {formatAddress(transaction.sender)} </td>
          <td>
            {typeMap.get(transaction.__typename)}
          </td>
          <td>
            {dayjs.unix(transaction.timestamp).format("MMM D h:mm:sa")}
          </td>
          <td>
            {Number(
              (+formatUnits(transaction.receipt.units, token.decimals)).toFixed(
                4
              )
            )}
            {token.symbol}
          </td>
          <td>
            {Number(
              (+formatUnits(
                transaction.receipt.price,
                reserve.decimals
              )).toFixed(4)
            )}
            {reserve.symbol}
          </td>
          <td
            >{Number(
              (+formatUnits(transaction.receipt.fee, reserve.decimals)).toFixed(
                4
              )
            )}
            {reserve.symbol}</td
          >
          {#if transaction.__typename == "SaleBuy"}
            <td
              >{Number(
                (+formatUnits(transaction.totalIn, reserve.decimals)).toFixed(4)
              )}
              {reserve.symbol}</td
            >
          {:else}
            <td
              >{Number(
                (+formatUnits(transaction.totalOut, reserve.decimals)).toFixed(
                  4
                )
              )}
              {reserve.symbol}</td
            >
          {/if}
          <td class="py-2 text-right">
            {#if transaction.__typename == "SaleBuy"}
              {#if !transaction.refunded}
                <span
                  class="underline cursor-pointer text-gray-400 mr-4"
                  on:click={() => {
                    open(RefundModal, {
                      saleContract,
                      token,
                      reserve,
                      transaction,
                      sale,
                    });
                  }}
                >
                  Refund
                </span>
              {:else}
                <span class="text-gray-400 mr-4">Refunded</span>
              {/if}
            {/if}
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
