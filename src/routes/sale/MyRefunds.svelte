<script lang="ts">
  import { signer } from 'svelte-ethers-store'
  import Button from '../../components/Button.svelte'
  import { operationStore, query } from '@urql/svelte'
  import { formatUnits, getAddress } from 'ethers/lib/utils'
  import { BigNumber, ethers } from 'ethers'
  import { BLOCK_EXPLORER } from '../../constants'
  import ReserveTokenArtifact from '../../abis/ReserveToken.json'

  export let saleContract

  let saleAddress, refundPromise, approvePromise

  const buysQuery = operationStore(
    `
query ($saleAddress: Bytes!) {
  sales (where: {id: $saleAddress}) {
    id
    deployer
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
    refunds {
      receipt {
        units
        price
        fee
      }
      fee
      totalOut
    }
    saleStatus
  }
}
`,
    {
      saleAddress,
    },
    {
      requestPolicy: 'network-only',
    },
  )

  $buysQuery.variables.saleAddress = saleContract.address.toLowerCase()
  query(buysQuery)

  $: reserve = $buysQuery.data?.sales[0].reserve
  $: token = $buysQuery.data?.sales[0].token

  $: console.log($buysQuery)
</script>

<div class="flex flex-col gap-y-4">
  <span class="text-lg font-semibold">Your refunds</span>
  {#if $buysQuery.fetching}
    Loading refunds...
  {:else if $buysQuery.error}
    Something went wrong.
  {:else if $buysQuery.data}
    {#each $buysQuery.data.sales[0].refunds as refund}
      <div class="flex flex-col gap-y-2 border border-gray-500 p-4 rounded-md w-full">
        <div class="grid grid-cols-2 gap-3">
          <span class="text-gray-400">Refunded:</span>
          <span>
            {formatUnits(refund.receipt.units, token.decimals)} {token.symbol}
          </span>
          <span class="text-gray-400">Price per rTKN:</span>
          <span>
            {formatUnits(refund.receipt.price, reserve.decimals)} {reserve.symbol}
          </span>
          <span class="text-gray-400">Fee:</span>
          <span>{formatUnits(refund.fee, reserve.decimals)} {reserve.symbol}</span>
          <span class="text-gray-400">Total refunded:</span>
          <span>
            {formatUnits(refund.totalOut, reserve.decimals)} {reserve.symbol}
          </span>
        </div>
      </div>
    {/each}
  {/if}
</div>
