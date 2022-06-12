<script lang="ts">
import { setContext } from "svelte";
import { BigNumber, ethers } from "ethers";
import { LayerCake, Svg, Html } from "layercake";
import { formatUnits, parseUnits } from "ethers/src.ts/utils";
import AxisX from "src/components/charts/AxisX.svelte";
import AxisY from "src/components/charts/AxisY.svelte";
import Line from "src/components/charts/Line.svelte";
import Scatter from "src/components/charts/Scatter.svelte";
import SharedTooltip from "src/components/charts/SharedTooltip.svelte";
import { timeFormat } from "d3-time-format";
import { writable } from "svelte/store";
import IconLibrary from "src/components/IconLibrary.svelte";
import { selectSale } from "./sale";
import { 
  ApplyOpFn,
  FixedPrice,
  IncreasingPrice,
  SaleJS,
  StateJS,
  vLBP
} from "rain-sdk";

export let saleType: selectSale;
export let saleVals;
export let reserveErc20;

let xKey = "timestamp";
let yKey = "price";
let data;
let simulSale: SaleJS;
let script;
let points;
let startTime;
let endTime;
let saleRange;
let spinner;
let max;
let min;


// a store for matching the hovered point with a scatter dot
const hoverItem = writable(null);
setContext("found", hoverItem);

const formatTickX = timeFormat("%b.%e. %X");


// setting the simulation variables
// setting up the custom timestamp function for js-vm BLOCK_TIMESTAMP opcode
let opcodeFn: ApplyOpFn = {
  [SaleJS.Opcodes.BLOCK_TIMESTAMP]: (
    state: StateJS,
    operand: number,
    data: any
  ) => {
    state.stack.push(BigNumber.from(data.timestamp))
  }
};

const now = Math.floor(Date.now() / 1000);

$: {
  // setting up the timestamps for simulation
  startTime = saleVals.startTimestamp ? saleVals.startTimestamp : now; // current timestamp as default
  endTime = saleVals.endTimestamp ? saleVals.endTimestamp : now + (60 * 60 * 24); // 24 hours from now as default
  saleRange = endTime - startTime;

  if (saleType == 0) {
    script = new FixedPrice(saleVals.startPrice, reserveErc20?.erc20decimals)
  }

  if (saleType == 1) {
    script = new vLBP(
      saleVals.startPrice,
      startTime,
      endTime,
      saleVals.minimumRaise,
      saleVals.initialSupply,
      reserveErc20?.erc20decimals
    );
    opcodeFn[SaleJS.Opcodes.REMAINING_UNITS] = (
      state: StateJS,
      operand: number,
      data: any
    ) => {
      state.stack.push(parseUnits(
        saleVals.initialSupply.toString(), reserveErc20?.erc20decimals
      ))
    };
    opcodeFn[SaleJS.Opcodes.TOTAL_RESERVE_IN] = (
      state: StateJS,
      operand: number,
      data: any
    ) => {
      state.stack.push(ethers.constants.Zero)
    };
  }

  if (saleType == 2) {
    script = new IncreasingPrice(
      saleVals.startPrice,
      saleVals.endPrice,
      startTime,
      endTime,
      reserveErc20?.erc20decimals
    )
  }

  // instantiating the SaleJS (ie.e Sale JS-VM)
  simulSale = new SaleJS(script, {applyOpFn: opcodeFn});

  // executing the simulation
  initSimul();

}

// refresh function
const refresh = () => {
  initSimul();  
};

// the simulation function
const initSimul = async() => {
  spinner = true;

  let length = Math.floor(saleRange / 50);
  points = [];

  for (let i = startTime; i < endTime; i += length) {
    points.push(
      {
        timestamp: i * 1000,
        price: (
          +formatUnits(
            await simulSale.run({timestamp: i}), reserveErc20?.erc20decimals
          )
        ).toFixed(4)
      }
    )
  }

  data = points;

  // consol the points for dev
  console.log(data)

  // min and max prices among points for dev
  min = points.reduce((e, m) => Number(e.price) < Number(m.price) ? Number(e.price) : Number(m.price))
  max = points.reduce((e, m) => Number(e.price) > Number(m.price) ? Number(e.price) : Number(m.price))

  spinner = false;

};

</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Price Chart Simulation</span>
    <span class:animate-spin={spinner} on:click={refresh}
      ><IconLibrary icon="reload" /></span
    >
  </div>
  <div class="chart-container">
    <LayerCake
      padding={{ right: 30, bottom: 20, left: 25 }}
      x={xKey}
      y={yKey}
      yDomain={[0, null]}
      {data}
    >
      <Svg>
        <AxisX gridlines={false} ticks={[startTime * 1000, endTime * 1000]} formatTick={formatTickX} />
        <AxisY
          gridlines={true}
          ticks={4}
          formatTick={(d) => `${d} ${reserveErc20?.erc20symbol ?? ""}`}
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
