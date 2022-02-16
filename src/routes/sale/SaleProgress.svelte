<script lang="ts">
import { operationStore, query } from '@urql/svelte'
import { formatUnits } from 'ethers/lib/utils';
import { onDestroy } from 'svelte';
import ProgressBar from 'components/ProgressBar.svelte'
import { timeString } from 'src/utils';
import { getAfterTimestampDate, saleStatuses } from './sale'

export let saleContract

let saleAddress, polling, timeRemaining, timeElapsed

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
      requestPolicy: 'cache-and-network',
    },
  )

  $buysQuery.variables.saleAddress = saleContract.address.toLowerCase()
  query(buysQuery)

  $: sale = $buysQuery.data?.sales[0]
  $: if (!$buysQuery.fetching) {
    polling = setTimeout(poll, 1000)
  }

  const poll = () => {
    getTime()
    buysQuery.reexecute()
  }

  const getTime = () => {
      const now = Math.floor(Date.now()/1000)
      const end = getAfterTimestampDate(sale.canEndStateConfig).getTime()/1000
      const start = parseInt(sale.startEvent.timestamp)
      timeRemaining = timeString((end - now)*1000) 
      timeElapsed = timeString((now - start)*1000) 
  }

  onDestroy(()=>{
      clearTimeout(polling)
  })
</script>

{#if sale}
<div class="w-full grid grid-cols-2 items-start">
<table class="table-auto">
    <tr>
        <td class="text-gray-400">Sale status:</td>
        <td>{saleStatuses[sale.saleStatus]}</td>
    </tr>
    <tr>
        <td class="text-gray-400">Minimum raise:</td>
        <td>{formatUnits(sale.minimumRaise, sale.reserve.decimals)}</td>
    </tr>
    <tr>
        <td class="text-gray-400">rTKN available:</td>
        <td>{formatUnits(sale.unitsAvailable, sale.token.decimals)}</td>
    </tr>
    {#if !(sale?.saleStatus == 0)}
    <tr>
        <td class="text-gray-400">Total raised:</td>
        <td>{formatUnits(sale.totalRaised, sale.reserve.decimals)}</td>
    </tr>
    <tr>
        <td class="text-gray-400">Percent raised:</td>
        <td>{sale.percentRaised}%</td>
    </tr>
    {/if}
</table>
<table class="table-fixed">
    <tr>
        <td class="text-gray-400">Could start:</td>
        <td>{getAfterTimestampDate(sale.canStartStateConfig).toLocaleString()}</td>
    </tr>  
    <tr>
        <td class="text-gray-400">Can end:</td>
        <td>{getAfterTimestampDate(sale.canEndStateConfig).toLocaleString()}</td>
    </tr> 
    {#if !(sale?.saleStatus == 0)}
    <tr>
        <td class="text-gray-400">Started:</td>
        <td>{new Date(parseInt(sale.startEvent.timestamp)*1000).toLocaleString()}</td>
    </tr>
    {/if}
    {#if sale?.saleStatus == 1}
    <tr>
        <td class="text-gray-400">Time remaining:</td>
        <td>{timeRemaining}</td>
    </tr>
    <tr>
        <td class="text-gray-400">Time elapsed:</td>
        <td>{timeElapsed}</td>
    </tr>
    {/if}
</table>
</div>
{#if sale?.saleStatus == 1}
    <ProgressBar color="blue" total={100} progress={sale.percentRaised} />
{/if}
{/if}