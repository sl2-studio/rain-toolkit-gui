<script lang="ts">
  import { setContext } from "svelte";
  import { queryStore } from "@urql/svelte";
  import { BigNumber, Contract } from "ethers";
  import { LayerCake, Svg, Html } from "layercake";
  import { formatUnits } from "ethers/src.ts/utils";
  import AxisX from "src/components/charts/AxisX.svelte";
  import AxisY from "src/components/charts/AxisY.svelte";
  import Line from "src/components/charts/Line.svelte";
  import Scatter from "src/components/charts/Scatter.svelte";
  import SharedTooltip from "src/components/charts/SharedTooltip.svelte";
  import { timeFormat } from "d3-time-format";
  import { formatAddress } from "src/utils";
  import { writable } from "svelte/store";
  import IconLibrary from "src/components/IconLibrary.svelte";
  import { client } from "src/stores";

  export let saleContract: Contract;
  export let reserve, token;

  let data,
    dataset,
    xKey = "timestamp",
    yKey = "price";

  let temp;

  // a store for matching the hovered point with a scatter dot
  const hoverItem = writable(null);
  setContext("found", hoverItem);

  const formatTickX = timeFormat("%b. %e. %X");

  let saleContractAddress = saleContract ? saleContract.address.toLowerCase() : undefined;

  $: saleBuysQuery = queryStore({
      client: $client,
      query: `
        query ($saleContractAddress: Bytes!) {
          saleBuys (where: {saleContractAddress: $saleContractAddress, refunded: false}, orderBy: timestamp, orderDirection: asc) {
            id
            __typename
            timestamp
            transactionHash
            saleContractAddress
            totalIn
            sender
            refunded
            receipt {
              id
              receiptId
              fee
              units
              price
              feeRecipient
            }
          }
        }`,
      variables: { saleContractAddress },
      requestPolicy: "network-only"
    }
  );

  const refresh = async() => {
    if (!$saleBuysQuery.fetching) {
      temp = saleContractAddress;
      saleContractAddress = undefined;
      if (await !$saleBuysQuery.fetching) {
        saleContractAddress = temp;
      }
    }
  };

  // mapping data from the subgraph query into a format for the chart
  $: {if ($saleBuysQuery?.data?.saleBuys.length) {
      const _data = $saleBuysQuery.data.saleBuys.map((buy) => {
        return {
          timestamp: buy.timestamp * 1000,
          price: (+formatUnits(
            BigNumber.from(buy.receipt.price),
            reserve.decimals
          )).toFixed(4),
          units: (+formatUnits(
            BigNumber.from(buy.receipt.units),
            token.decimals
          )).toFixed(4),
          sender: formatAddress(buy.sender),
          total: (+formatUnits(
            BigNumber.from(buy.totalIn),
            reserve.decimals
          )).toFixed(4),
        };
      });

      const _dataset = $saleBuysQuery.data.saleBuys.map((buy) => {
        return {
          x: buy.timestamp,
          y: formatUnits(BigNumber.from(buy.receipt.price), reserve.decimals),
        };
      });
      dataset = _dataset;
      data = _data;
    }
  };
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Price history</span>
    <span class:animate-spin={$saleBuysQuery.fetching} on:click={refresh}
      ><IconLibrary icon="reload" /></span
    >
  </div>
  <div class="chart-container">
    <LayerCake
      padding={{ right: 10, bottom: 20, left: 25 }}
      x={xKey}
      y={yKey}
      yDomain={[0, null]}
      {data}
    >
      <Svg>
        <AxisX gridlines={false} ticks={5} formatTick={formatTickX} />
        <AxisY
          gridlines={true}
          ticks={4}
          formatTick={(d) => `${d} ${reserve.symbol}`}
        />
        <Line stroke="rgba(59, 130, 246)" />
        <Scatter />
      </Svg>

      <Html>
        <SharedTooltip formatTitle={formatTickX} formatValue={(d) => d} />
      </Html>
    </LayerCake>
  </div>
</div>

<style>
  /*
      The wrapper div needs to have an explicit width and height in CSS.
      It can also be a flexbox child or CSS grid element.
      The point being it needs dimensions since the <LayerCake> element will
      expand to fill it.
    */
  .chart-container {
    width: 100%;
    height: 300px;
  }
</style>
