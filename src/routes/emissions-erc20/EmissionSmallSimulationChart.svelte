<script lang="ts">
  import { setContext } from "svelte";
  import { BigNumber, ethers } from "ethers";
  import { LayerCake, Svg, Html } from "layercake";
  import { formatUnits } from "ethers/src.ts/utils";
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
  // setting up the custom opcodes function
  // this simulation is considering Tier1 as default for simulating
  let opcodeFn: ApplyOpFn = {
    [EmissionsERC20JS.Opcodes.BLOCK_NUMBER]: (
      state: StateJS,
      operand: number,
      data: any
    ) => {
      state.stack.push(BigNumber.from(data.blockNumber));
    },
    // REPORT opcode either stacking Zero for any other accounts/contract and report of tier1 blockNumber for THIS_ADDRESS
    [EmissionsERC20JS.Opcodes.REPORT]: (
      state: StateJS,
      operand: number,
      data: any
    ) => {
      let a = state.stack.pop();
      if (a == BigNumber.from("15"))
        state.stack.push(BigNumber.from(ethers.constants.Zero));
      else state.stack.push(BigNumber.from("0xffffffffffffffffffffffff0000000000000000000000000000000000000000"));
    },
    // skip the CLAIMANT_ACCOUNT opcode
    [EmissionsERC20JS.Opcodes.CLAIMANT_ACCOUNT]: (
      state: StateJS,
      operand: number,
      data: any
    ) => {},
    // a simple identifier for THIS_ADDRESS opcode to differentiate it for REPORT opcode
    [EmissionsERC20JS.Opcodes.THIS_ADDRESS]: (
      state: StateJS,
      operand: number,
      data: any
    ) => {
      state.stack.push(BigNumber.from("15"));
    },
  };

  // current timestamp
  const now = Math.floor(Date.now() / 1000);

  // defining the parameters, building the script and initiating the JSVM object
  $: {
      // EmissionERC20 parameters
      emissionsType = FriendlySource.emissionsType;
      emissionsConfig = {
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
        numberOfIncrements: FriendlySource.numberOfIncrements
      }
    
    // building the script
    if (emissionsType.value == 0) {
      script = new LinearEmissions(emissionsConfig);
    }
    if (emissionsType.value == 1) {
      script = new SequentialEmissions(emissionsConfig);
    }

    // instantiating the EmissioinJS (ie.e EmissionsERC20 JSVM)
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

    //chart length
    let length = Math.floor(FriendlySource.period / FriendlySource.blockTime);
    points = [];

    // executing the JSVM and mapping the results with timestamp for building the chart
    for (let i = 0; i < length * FriendlySource.numberOfIncrements; i += length) {
      points.push({
        blockNumber: (now + (i * FriendlySource.blockTime)) * 1000,
        price: (+formatUnits(
          await simulSale.run({ blockNumber: i }),
          18
        )).toFixed(4),
      });
      points.push({
        blockNumber: (now + ((i + length - 1) * FriendlySource.blockTime)) * 1000,
        price: (+formatUnits(
          await simulSale.run({ blockNumber: (i + length - 1) }),
          18
        )).toFixed(4),
      });
    }

    data = points;

    // log the chart points for dev purpose
    console.log(data);

    // min and max mintable amounts among points for dev purpose
    min = (FriendlySource.blockTime && FriendlySource.period && FriendlySource.numberOfIncrements) 
    ? points.reduce((e, m) => Number(e.price) < Number(m.price) ? Number(e.price) : Number(m.price))
    : 0;
    max = (FriendlySource.blockTime && FriendlySource.period && FriendlySource.numberOfIncrements)
    ? points.reduce((e, m) => Number(e.price) > Number(m.price) ? Number(e.price) : Number(m.price))
    : 0;

    spinner = false;
  };
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Claimable Units Simulation Chart</span>
    <span class:animate-spin={spinner} on:click={refresh}
      ><IconLibrary icon="reload" /></span
    >
  </div>
  <div class="chart-container">
    <LayerCake
      padding={{ right: 30, bottom: 20, left: 25 }}
      x={xKey}
      y={yKey}
      yDomain={[0, max]}
      {data}
    >
      <Svg>
        <AxisX
          gridlines={false}
          ticks={[now * 1000, (now + (FriendlySource.period * FriendlySource.numberOfIncrements)) * 1000]}
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
