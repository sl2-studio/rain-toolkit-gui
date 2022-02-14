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
        id
      symbol
      name
      decimals
    }
    reserve {
      id
      symbol
      name
      decimals
    }
    buys {
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

  const approve = async (receipt) => {
    const rTKN = new ethers.Contract(
      $buysQuery.data.sales[0].token.id,
      ReserveTokenArtifact.abi,
      $signer,
    )
    const tx = await rTKN.approve(
      saleContract.address,
      BigNumber.from(receipt.units),
    )
    const txReceipt = await tx.wait()
    return txReceipt
  }

  const refund = async (receipt) => {
    const tx = await saleContract.refund({
      id: BigNumber.from(receipt.receiptId),
      feeRecipient: receipt.feeRecipient,
      fee: BigNumber.from(receipt.fee),
      units: BigNumber.from(receipt.units),
      price: BigNumber.from(receipt.price),
    })
    const txReceipt = await tx.wait()
    return txReceipt
  }
</script>

<div class="flex flex-col gap-y-4">
  <span class="text-lg font-semibold">Your buys</span>
  {#if $buysQuery.fetching}
    Loading buys...
  {:else if $buysQuery.error}
    Something went wrong.
  {:else if $buysQuery.data}
    {#each $buysQuery.data.sales[0].buys as buy}
      <div class="flex flex-col gap-y-4 border border-gray-500 p-4 rounded-md w-full">
        <div class="grid grid-cols-2 gap-3">
          <span class="text-gray-400">Purchased:</span>
          <span>
            {formatUnits(buy.receipt.units, token.decimals)} {token.symbol}
          </span>
          <span class="text-gray-400">Price per rTKN:</span>
          <span>
            {formatUnits(buy.receipt.price, reserve.decimals)} {reserve.symbol}
          </span>
          <span class="text-gray-400">Fee:</span>
          <span>{formatUnits(buy.fee, reserve.decimals)} {reserve.symbol}</span>
          <span class="text-gray-400">Total paid:</span>
          <span>
            {formatUnits(buy.totalIn, reserve.decimals)} {reserve.symbol}
          </span>
        </div>
        <Button
          on:click={() => {
            approvePromise = approve(buy.receipt)
          }}>
          Approve rTKN for refund
        </Button>
        {#if approvePromise}
          {#await approvePromise}
            <span class="text-blue-400">Waiting on confirmation...</span>
          {:then}
            <Button
              on:click={() => {
                refundPromise = refund(buy.receipt)
              }}>
              Refund
            </Button>
            {#if refundPromise}
              {#await refundPromise}
                <span class="text-blue-400">Waiting on confirmation...</span>
              {:then receipt}
                <span class="text-blue-400">Refund confirmed!</span>
                <a
                  class="text-blue-400 underline"
                  target="_blank"
                  href={`${BLOCK_EXPLORER}/tx/${receipt.transactionHash}`}>
                  See transaction.
                </a>
              {/await}
            {/if}
          {/await}
        {/if}
      </div>
    {/each}
  {/if}
</div>
