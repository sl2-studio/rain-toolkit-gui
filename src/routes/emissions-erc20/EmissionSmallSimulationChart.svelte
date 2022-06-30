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

  import {
    ApplyOpFn,
    EmissionsERC20JS,
    StateJS,
    LinearEmissions,
    SequentialEmissions,
    EmissionsConfig,
  } from "rain-sdk";

  export let FriendlySource;

  let xKey = "blockNumber";
  let yKey = "price";
  let data;
  let simulSale: EmissionsERC20JS;
  let script;
  let points;
  let startTime;
  let endTime;
  let saleRange;
  let spinner;
  let max;
  let min;
  let emissionsType;
  let emissionsConfig: EmissionsConfig;

  // a store for matching the hovered point with a scatter dot
  const hoverItem = writable(null);
  setContext("found", hoverItem);

  const formatTickX = timeFormat("%b.%e. %X");

  // setting the simulation variables
  // setting up the custom timestamp function for js-vm BLOCK_TIMESTAMP opcode
  let opcodeFn: ApplyOpFn = {
    [EmissionsERC20JS.Opcodes.BLOCK_NUMBER]: (
      state: StateJS,
      operand: number,
      data: any
    ) => {
      state.stack.push(BigNumber.from(data.blockNumber));
    },
    [EmissionsERC20JS.Opcodes.REPORT]: (
      state: StateJS,
      operand: number,
      data: any
    ) => {
      let a = state.stack.pop();
      if (a == BigNumber.from("15"))
        state.stack.push(BigNumber.from(ethers.constants.Zero));
      else state.stack.push(BigNumber.from(data.blockNumber));
    },
    [EmissionsERC20JS.Opcodes.CLAIMANT_ACCOUNT]: (
      state: StateJS,
      operand: number,
      data: any
    ) => {},
    [EmissionsERC20JS.Opcodes.THIS_ADDRESS]: (
      state: StateJS,
      operand: number,
      data: any
    ) => {
      state.stack.push(BigNumber.from("15"));
    },
  };

  const now = Math.floor(Date.now() / 1000);

  $: {
    // setting up the timestamps for simulation
    if (FriendlySource.emissionsType) {
      emissionsType = FriendlySource.emissionsType;
      emissionsConfig = emissionsType.value
        ? {
            tierAddress: FriendlySource.tierAddress,
            blockTime: FriendlySource.blockTime,
            period: FriendlySource.period,
            periodicRewards: {
              tier1: FriendlySource.tier1,
              tier2: FriendlySource.tier2,
              tier3: FriendlySource.tier3,
              tier4: FriendlySource.tier4,
              tier5: FriendlySource.tier6,
              tier6: FriendlySource.tier6,
              tier7: FriendlySource.tier7,
              tier8: FriendlySource.tier8,
            },
            maxPeriodicRewards: {
              tier1: FriendlySource.maxTier1,
              tier2: FriendlySource.maxTier2,
              tier3: FriendlySource.maxTier3,
              tier4: FriendlySource.maxTier4,
              tier5: FriendlySource.maxTier6,
              tier6: FriendlySource.maxTier6,
              tier7: FriendlySource.maxTier7,
              tier8: FriendlySource.maxTier8,
            },
            numberOfIncrements: FriendlySource.numberOfIncrements,
          }
        : {
            tierAddress: FriendlySource.tierAddress,
            blockTime: FriendlySource.blockTime,
            period: FriendlySource.period,
            periodicRewards: {
              tier1: FriendlySource.tier1,
              tier2: FriendlySource.tier2,
              tier3: FriendlySource.tier3,
              tier4: FriendlySource.tier4,
              tier5: FriendlySource.tier6,
              tier6: FriendlySource.tier6,
              tier7: FriendlySource.tier7,
              tier8: FriendlySource.tier8,
            },
          };
    }
    if (emissionsType.value == 0) {
      script = new LinearEmissions(emissionsConfig);
    }

    if (emissionsType.value == 1) {
      script = new SequentialEmissions(emissionsConfig);
    }

    // instantiating the SaleJS (ie.e Sale JS-VM)
    simulSale = new EmissionsERC20JS(script, { applyOpFn: opcodeFn });

    // executing the simulation
    initSimul();
  }
  // refresh function
  const refresh = () => {
    initSimul();
  };

  // the simulation function
  const initSimul = async () => {
    spinner = true;

    let length = Math.floor(FriendlySource.period / 50);
    points = [];

    for (let i = now; i < now + FriendlySource.period; i += length) {
      points.push({
        blockNumber: i * 1000,
        price: (+formatUnits(
          await simulSale.run({ blockNumber: i }),
          18
        )).toFixed(4),
      });
    }

    data = points;

    // consol the points for dev
    console.log(data);

    // min and max prices among points for dev
    min = points.reduce((e, m) =>
      Number(e.price) < Number(m.price) ? Number(e.price) : Number(m.price)
    );
    max = points.reduce((e, m) =>
      Number(e.price) > Number(m.price) ? Number(e.price) : Number(m.price)
    );

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
        <AxisX
          gridlines={false}
          ticks={[now * 1000, (now + FriendlySource.period) * 1000]}
          formatTick={formatTickX}
        />
        <AxisY
          gridlines={true}
          ticks={5}
          formatTick={(d) => `${d} ${FriendlySource.erc20symbol ?? ""}`}
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
