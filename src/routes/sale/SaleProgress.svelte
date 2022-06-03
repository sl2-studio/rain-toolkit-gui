<script lang="ts">
  import { operationStore, query } from "@urql/svelte";
  import { formatUnits, parseUnits } from "ethers/lib/utils";
  import { onDestroy } from "svelte";
  import ProgressBar from "components/ProgressBar.svelte";
  import { timeString } from "src/utils";
  import {
    getAfterTimestamp,
    getAfterTimestampDate,
    saleStatuses,
  } from "./sale";
  import dayjs from "dayjs";

  export let saleContract;

  let saleAddress, updateTime, timeRemaining, timeElapsed, queryTimeout;

  const buysQuery = operationStore(
    `
query ($saleAddress: Bytes!) {
  sales (where: {id: $saleAddress}) {
    id
    deployer
    canEndStateConfig {
      sources
      constants
      stackLength
      argumentsLength
    }
    canStartStateConfig {
      sources
      constants
      stackLength
      argumentsLength
    }
    startEvent {
        timestamp
    }
    endEvent {
      timestamp
    }
    token {
      symbol
      name
      decimals
    }
    reserve {
      symbol
      name
      decimals
    }
    minimumRaise
    unitsAvailable
    totalRaised
    percentRaised
    saleStatus
  }
}
`,
    {
      saleAddress,
    },
    {
      requestPolicy: "cache-and-network",
    }
  );

  // set variables for the query
  $buysQuery.variables.saleAddress = saleContract.address.toLowerCase();

  // init the query
  query(buysQuery);

  // re-execute the query every 3 seconds, unless a current fetch is in already progress
  const queryLoop = () => {
    if (!$buysQuery.fetching) {
      buysQuery.reexecute();
    }
    queryTimeout = setTimeout(queryLoop, 3000);
  };

  // alias the sale for convenience
  $: sale = $buysQuery.data?.sales[0];

  // the first time we get data, start a loop that updates the timer every 3 seconds
  $: if (!$buysQuery.fetching) {
    if (!updateTime) {
      updateTime = setInterval(getTime, 1000);
    }
  }

  // start the query polling loop
  queryLoop();

  // update the time elapse/remaining
  const getTime = () => {
    const now = Math.floor(Date.now() / 1000);
    const end = 
      (
        (sale.canEndStateConfig.sources[0] === "0x060001001f002f0001021e002002060001011f002102" ||
        sale.canEndStateConfig.sources[0] === "0x010307001d00060001001f002f0001021e002002060001011f00210201041c00") &&
        Number(+formatUnits(sale.totalRaised, sale.reserve.decimals)) >= Number(+formatUnits(sale.canEndStateConfig.constants[2]))
      )
        ? getAfterTimestampDate(sale.canEndStateConfig, 1).getTime() / 1000
        : getAfterTimestampDate(sale.canEndStateConfig, 0).getTime() / 1000;

    if (sale?.saleStatus == 1) {
      const start = parseInt(sale.startEvent.timestamp);
      timeRemaining =
        end - now > 0 ? timeString((end - now) * 1000) : "Can end";
      timeElapsed = timeString((now - start) * 1000);
    }
  };

  // clear both loops on component destroy
  onDestroy(() => {
    clearInterval(updateTime);
    clearTimeout(queryTimeout);
  });
</script>

{#if sale}
  {
    #if (
      sale.canEndStateConfig.sources[0] === "0x060001001f002f0001021e002002060001011f002102" || 
      sale.canEndStateConfig.sources[0] === "0x010307001d00060001001f002f0001021e002002060001011f00210201041c00"
    )
  }
    <div class="mb-2 flex flex-col gap-y-2">
      <span class="text-xl"
        ><span class="text-gray-400">Sale Duration Mode:</span> Extra Time</span
      >
    </div>
  {:else}
    <div class="mb-2 flex flex-col gap-y-2">
      <span class="text-xl"
        ><span class="text-gray-400">Sale Duration Mode:</span> Normal</span
      >
    </div>
  {/if}
  <div class="grid w-full grid-cols-2 items-start">
    <table class="table-auto">
      <tr>
        <td class="text-gray-400">Sale status:</td>
        <td>{saleStatuses[sale.saleStatus]}</td>
      </tr>
      <tr>
        <td class="text-gray-400">Minimum raise:</td>
        <td
          >{Number(
            +formatUnits(sale.minimumRaise, sale.reserve.decimals)
          ).toFixed(4)}</td
        >
      </tr>
      <tr>
        <td class="text-gray-400">rTKN available:</td>
        <td
          >{Number(
            (+formatUnits(sale.unitsAvailable, sale.token.decimals)).toFixed(4)
          )}</td
        >
      </tr>
      {#if !(sale?.saleStatus == 0)}
        <tr>
          <td class="text-gray-400">Total raised:</td>
          <td
            >{Number(
              (+formatUnits(sale.totalRaised, sale.reserve.decimals)).toFixed(4)
            )}</td
          >
        </tr>
        <tr>
          <td class="text-gray-400">Percent raised:</td>
          <td>{(+sale.percentRaised).toFixed(4)}%</td>
        </tr>
      {/if}
    </table>
    <table class="table-fixed">
      <tr>
        <td class="text-gray-400">Could start:</td>
        <td
          >{dayjs
            .unix(getAfterTimestamp(sale.canStartStateConfig, 0))
            .format("MMM D h:mm:ssa")}
          {#if sale.canStartStateConfig.sources[0] === "0x010107001d00060001001f0001021c00"}
            <span class="text-small text-gray-400">(Only by the creator)</span>
          {/if}
        </td>
      </tr>
      {
        #if (
          (sale.canEndStateConfig.sources[0] === "0x060001001f002f0001021e002002060001011f002102" || 
          sale.canEndStateConfig.sources[0] === "0x010307001d00060001001f002f0001021e002002060001011f00210201041c00") && 
          Number(+formatUnits(sale.totalRaised, sale.reserve.decimals)) >= Number(+formatUnits(sale.canEndStateConfig.constants[2]))
        )
      }
        <tr>
          <td class="text-gray-400">Can end:</td>
          <td
            >{dayjs
              .unix(getAfterTimestamp(sale.canEndStateConfig, 1))
              .format("MMM D h:mm:ssa")}
            {#if sale.canStartStateConfig.sources[0] === "0x010107001d00060001001f0001021c00"}
              <span class="text-small text-gray-400">(Only by the creator)</span
              >
            {/if}
          </td>
        </tr>
      {:else}
        <tr>
          <td class="text-gray-400">Can end:</td>
          <td
            >{dayjs
              .unix(getAfterTimestamp(sale.canEndStateConfig, 0))
              .format("MMM D h:mm:ssa")}
            {#if sale.canStartStateConfig.sources[0] === "0x010107001d00060001001f0001021c00"}
              <span class="text-gray-400 text-small">(Only by the creator)</span
              >
            {/if}
          </td>
        </tr>
      {/if}
      {#if !(sale?.saleStatus == 0)}
        <tr>
          <td class="text-gray-400">Started at:</td>
          <td
            >{dayjs.unix(sale.startEvent.timestamp).format("MMM D h:mm:ssa")}
          </td>
        </tr>
      {/if}
      {#if sale?.saleStatus == 1}
        {
          #if (
            (sale.canEndStateConfig.sources[0] === "0x060001001f002f0001021e002002060001011f002102" || 
            sale.canEndStateConfig.sources[0] === "0x010307001d00060001001f002f0001021e002002060001011f00210201041c00") && 
            Number(+formatUnits(sale.totalRaised, sale.reserve.decimals)) >= Number(+formatUnits(sale.canEndStateConfig.constants[2]))
          )
        }
          <tr>
            <td class="text-gray-400">Time remaining (Extra Time):</td>
            <td>{timeRemaining}</td>
          </tr>
        {:else}
          <tr>
            <td class="text-gray-400">Time remaining:</td>
            <td>{timeRemaining}</td>
          </tr>
        {/if}
        <tr>
          <td class="text-gray-400">Time elapsed:</td>
          <td>{timeElapsed}</td>
        </tr>
      {/if}
      {#if sale?.saleStatus == 2}
        <tr>
          <td class="text-gray-400">Ended at:</td>
          <td>{dayjs.unix(sale.endEvent.timestamp).format("MMM D h:mm:ssa")}</td>
        </tr>
    {/if}
    </table>
  </div>
  {
    #if (
      (sale.canEndStateConfig.sources[0] === "0x060001001f002f0001021e002002060001011f002102" || 
      sale.canEndStateConfig.sources[0] === "0x010307001d00060001001f002f0001021e002002060001011f00210201041c00") && 
      Number(+formatUnits(sale.totalRaised, sale.reserve.decimals)) >= Number(+formatUnits(sale.canEndStateConfig.constants[2]))
    )
  }
    {#if sale?.saleStatus == 1}
      <span style="font-size:medium"
        >*The threshold of {Number(
          +formatUnits(sale.canEndStateConfig.constants[2])
        )}
        {sale.reserve.symbol} has been reached and raise can now continue for
        {(getAfterTimestamp(sale.canEndStateConfig, 1) -
          getAfterTimestamp(sale.canEndStateConfig, 0)) /
          60} more minutes in extra time
      </span>
    {:else}
      <span style="font-size:medium"
      >*This sale had
      {(getAfterTimestamp(sale.canEndStateConfig, 1) -
        getAfterTimestamp(sale.canEndStateConfig, 0)) /
        60} minutes of extra time
      </span>
    {/if}
  {/if}
  {#if sale?.saleStatus == 1 || 2}
    <ProgressBar color="blue" total={100} progress={sale.percentRaised} />
  {/if}
{/if}
