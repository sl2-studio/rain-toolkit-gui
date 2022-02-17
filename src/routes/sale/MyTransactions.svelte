<script lang="ts">
  import Button from "components/Button.svelte";
  import RefundModal from "./RefundModal.svelte";
  import { operationStore, query } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress } from "svelte-ethers-store";
  import { getContext, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import IconLibrary from "components/IconLibrary.svelte";
  import { BLOCK_EXPLORER } from "src/constants";
  import dayjs from "dayjs";

  const { open } = getContext("simple-modal");
  export let saleContract;

  let saleContractAddress, sender, queryTimeout;

  const myTxQuery = operationStore(
    `
      query ($saleContractAddress: Bytes!, $sender: Bytes!) {
        saleTransactions (where: {saleContractAddress: $saleContractAddress, sender: $sender}, orderBy: timestamp, orderDirection: asc) {
          id
          __typename
          timestamp
          transactionHash
          saleContractAddress
          saleContract {
            cooldownDuration
            token {
              id
              name
              symbol
              decimals
            }
            reserve {
              id
              name
              symbol
              decimals
            }
          }
          receipt {
            id
            receiptId
            fee
            units
            price
            feeRecipient
          }
          ... on SaleBuy {
            refunded
            totalIn
          }
          ... on SaleRefund {
            totalOut
          }
        }
      }
    `,
    {
      saleContractAddress,
      sender,
    },
    {
      requestPolicy: "cache-and-network",
    }
  );

  // setting the query variables
  $myTxQuery.variables.saleContractAddress = saleContract.address.toLowerCase();
  $myTxQuery.variables.sender = $signerAddress.toLowerCase();

  // init the query
  query(myTxQuery);

  // re-execute the query every 3 seconds, unless a current fetch is in already progress
  const queryLoop = () => {
    if (!$myTxQuery.fetching) {
      myTxQuery.reexecute();
    }
    queryTimeout = setTimeout(queryLoop, 3000);
  };

  // start the query polling loop
  queryLoop();

  // clear the query loop on component destroy
  onDestroy(() => {
    clearTimeout(queryTimeout);
  });

  // aliases for convenience
  $: reserve = $myTxQuery.data?.saleTransactions[0]?.saleContract.reserve;
  $: token = $myTxQuery.data?.saleTransactions[0]?.saleContract.token;
  $: sale = $myTxQuery.data?.saleTransactions[0]?.saleContract;

  // mapping transaction type to a readable version
  const typeMap = new Map([
    ["SaleBuy", "Buy"],
    ["SaleRefund", "Refund"],
  ]);
</script>

<div class="flex w-full flex-col gap-y-4">
  <span class="text-lg font-semibold">Your transactions</span>
  {#if $myTxQuery.fetching}
    Loading transactions...
  {:else if $myTxQuery.error}
    Something went wrong.
  {:else if $myTxQuery.data.saleTransactions.length}
    <table class="table-auto w-full space-y-2">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Type</th>
        <th class="text-gray-400 text-left pb-2 font-light">Time</th>
        <th class="text-gray-400 text-left pb-2 font-light">Units</th>
        <th class="text-gray-400 text-left pb-2 font-light">Price/rTKN</th>
        <th class="text-gray-400 text-left pb-2 font-light">Fee</th>
        <th class="text-gray-400 text-left pb-2 font-light">Total</th>
        <th />
      </tr>
      {#each $myTxQuery.data.saleTransactions as transaction}
        <tr>
          <td>
            {typeMap.get(transaction.__typename)}
          </td>
          <td>
            {dayjs.unix(transaction.timestamp).format("D/M/YYYY hh:mm:ss")}
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
          <td class="py-2 text-right w-36">
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
              href={`${BLOCK_EXPLORER}/tx/${transaction.transactionHash}`}
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
