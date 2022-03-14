<script lang="ts">
  import { setContext } from "svelte";
  import { query } from "@urql/svelte";
  import { BigNumber, Contract } from "ethers";
  import { saleBuysQuery } from "./sale-queries";
  import { LayerCake, Svg, Html } from "layercake";
  import { formatUnits, parseUnits } from "ethers/src.ts/utils";
  import AxisX from "src/components/charts/AxisX.svelte";
  import AxisY from "src/components/charts/AxisY.svelte";
  import Line from "src/components/charts/Line.svelte";
  import Scatter from "src/components/charts/Scatter.svelte";
  import SharedTooltip from "src/components/charts/SharedTooltip.svelte";
  import { timeFormat } from "d3-time-format";
  import { formatAddress } from "src/utils";
  import { writable } from "svelte/store";
  export let saleContract: Contract;
  export let reserve, token;

  // setting the variables
  $saleBuysQuery.variables.saleContractAddress =
    saleContract.address.toLowerCase();

  query(saleBuysQuery);

  let data,
    dataset,
    xKey = "timestamp",
    yKey = "price";

  const hoverItem = writable(null);

  setContext("found", hoverItem);

  const formatTickX = timeFormat("%b. %e. %X");

  saleBuysQuery.subscribe((query) => {
    console.log(query);
    if (query?.data?.saleBuys.length) {
      const _data = query.data.saleBuys.map((buy) => {
        console.log(buy);
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

      const _dataset = query.data.saleBuys.map((buy) => {
        return {
          x: buy.timestamp,
          y: formatUnits(BigNumber.from(buy.receipt.price), reserve.decimals),
        };
      });
      console.log(_data);
      dataset = _dataset;
      data = _data;
    }
  });
</script>

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
      <AxisY gridlines={true} ticks={4} />
      <Line stroke="#FFFFFF" />
      <Scatter />
    </Svg>

    <Html>
      <SharedTooltip formatTitle={formatTickX} formatValue={(d) => d} />
    </Html>
  </LayerCake>
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
