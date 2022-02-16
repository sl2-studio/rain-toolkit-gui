<script lang="ts">
  import { BigNumber, ethers } from 'ethers'
  import { formatUnits, parseUnits } from 'ethers/lib/utils'
  import { signerAddress } from 'svelte-ethers-store'
  import Button from 'components/Button.svelte'
  import FormPanel from 'components/FormPanel.svelte'
  import Input from 'components/Input.svelte'

  export let sale
  export let token
  export let reserve

  let units, showBuy, calcPricePromise, buyPromise, approvePromise

  const calculatePrice = async () => {
    const _units = parseUnits(units.toString(), token.erc20decimals.toString())
    return await sale.calculatePrice(_units)
  }

  const approve = async () => {
    const _units = BigNumber.from(units)
    const tx = await reserve.erc20Contract.approve(
      sale.address,
      _units.mul(await sale.calculatePrice(_units)),
    )
    await tx.wait()
  }

  const buy = async () => {
    const buyConfig = {
      feeRecipient: $signerAddress,
      fee: BigNumber.from(0),
      minimumUnits: parseUnits(
        units.toString(),
        token.erc20decimals.toString(),
      ),
      desiredUnits: parseUnits(
        units.toString(),
        token.erc20decimals.toString(),
      ),
      maximumPrice: ethers.constants.MaxUint256,
    }

    const tx = await sale.buy(buyConfig)
    await tx.wait()
  }
</script>

<FormPanel heading="Buy rTKN">
  {#if !showBuy}
    <Input type="number" bind:value={units}>
      <span slot="label">Enter the number of units to buy:</span>
    </Input>
    {#if calcPricePromise}
      <div>
        {#await calcPricePromise}
          Getting price...
        {:then price}
          Price will be {formatUnits(price, reserve.erc20decimals)} {reserve.erc20symbol}
          per {token.erc20symbol}
        {/await}
      </div>
    {/if}
    <div class="flex flex-row gap-x-2">
      <Button
        on:click={() => {
          calcPricePromise = calculatePrice()
        }}>
        Calculate price
      </Button>
      <Button
        on:click={() => {
          showBuy = !showBuy
        }}>
        Buy
      </Button>
    </div>
  {/if}

  {#if showBuy}
    <span>Buying: {units} {token.erc20symbol}</span>
    {#await calculatePrice()}
      <span>Calculating price...</span>
    {:then price}
      <span>
        Price: {formatUnits(price, reserve.erc20decimals)} {reserve.erc20symbol}
        per {token.erc20symbol}
      </span>
      <span>
        Total: {formatUnits(price.mul(BigNumber.from(units)), reserve.erc20decimals)}
        {reserve.erc20symbol}
      </span>
    {/await}
    {#if !approvePromise}
      <Button
        shrink
        on:click={() => {
          approvePromise = approve()
        }}>
        Approve
      </Button>
    {:else}
      {#await approvePromise}
        <span class="text-blue-400">Approving...</span>
      {:then}
        {#if !buyPromise}
          <Button
            shrink
            on:click={() => {
              buyPromise = buy()
            }}>
            Confirm Buy
          </Button>
        {:else}
          {#await buyPromise}
            <span class="text-blue-400">Confirming...</span>
          {:then}
            <span class="text-blue-400">
              Buy complete! Refresh to see your balance.
            </span>
          {/await}
        {/if}
      {/await}
    {/if}
  {/if}
</FormPanel>
