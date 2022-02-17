<script lang="ts">
  import Button from "components/Button.svelte";
  import Refund from "./Refund.svelte";
  import { operationStore, query } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import { fade } from "svelte/transition";
  import IconLibrary from "components/IconLibrary.svelte";
  import { BLOCK_EXPLORER } from "src/constants";
  import dayjs from "dayjs";

  const { open } = getContext("simple-modal");
  export let saleContract;

  let saleContractAddress, sender;

  const buysQuery = operationStore(
    `
query ($saleContractAddress: Bytes!, $sender: Bytes!) {
  saleBuys (where: {saleContractAddress: $saleContractAddress, sender: $sender}, orderBy: timestamp, orderDirection: asc) {
      timestamp
      refunded
      transactionHash
      sender
      saleContractAddress
      saleContract {
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
          cooldownDuration
      }
      minimumUnits
      desiredUnits
      maximumPrice
      totalIn
      fee
      receipt {
        id
        receiptId
        feeRecipient
        fee
        units
        price
      }
    }
}
`,
    {
      saleContractAddress,
      sender,
    },
    {
      requestPolicy: "network-only",
    }
  );

  $buysQuery.variables.saleContractAddress = saleContract.address.toLowerCase();
  $buysQuery.variables.sender = $signerAddress.toLowerCase();
  query(buysQuery);

  $: reserve = $buysQuery.data?.saleBuys[0]?.saleContract.reserve;
  $: token = $buysQuery.data?.saleBuys[0]?.saleContract.token;
  $: sale = $buysQuery.data?.saleBuys[0]?.saleContract;
</script>

<div class="flex w-full flex-col gap-y-4">
  <span class="text-lg font-semibold">Your buys</span>
  {#if $buysQuery.fetching}
    Loading buys...
  {:else if $buysQuery.error}
    Something went wrong.
  {:else if $buysQuery.data.saleBuys.length}
    <table class="table-auto w-full space-y-2">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Time</th>
        <th class="text-gray-400 text-left pb-2 font-light">Purchased</th>
        <th class="text-gray-400 text-left pb-2 font-light">Price/rTKN</th>
        <th class="text-gray-400 text-left pb-2 font-light">Fee</th>
        <th class="text-gray-400 text-left pb-2 font-light">Total paid</th>
        <th />
      </tr>
      {#each $buysQuery.data.saleBuys as buy}
        <tr>
          <td>
            {dayjs.unix(buy.timestamp).format("D/M/YYYY hh:mm:ss")}
          </td>
          <td>
            {formatUnits(buy.receipt.units, token.decimals)}
            {token.symbol}
          </td>
          <td>
            {formatUnits(buy.receipt.price, reserve.decimals)}
            {reserve.symbol}
          </td>
          <td>{formatUnits(buy.fee, reserve.decimals)} {reserve.symbol}</td>
          <td>{formatUnits(buy.totalIn, reserve.decimals)} {reserve.symbol}</td>
          <td class="py-2 text-right w-36">
            {#if !buy.refunded}
              <span
                class="underline cursor-pointer text-gray-400 mr-4"
                on:click={() => {
                  open(Refund, { saleContract, token, reserve, buy, sale });
                }}
              >
                Refund
              </span>
            {:else}
              <span class="text-gray-400 mr-4">Refunded</span>
            {/if}
            <a
              href={`${BLOCK_EXPLORER}/tx/${buy.transactionHash}`}
              target="_blank"
            >
              <IconLibrary icon="link" color="font-gray-100" width="10" />
            </a>
          </td>
        </tr>
      {/each}
    </table>
  {:else}
    You haven't made any purchases.
  {/if}
</div>
