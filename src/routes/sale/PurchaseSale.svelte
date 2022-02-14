<script lang="ts">
import {
    BigNumber,
    ethers
} from 'ethers'
import {
    formatUnits,
    parseUnits
} from 'ethers/lib/utils'
import {
    signer,
    signerAddress
} from 'svelte-ethers-store'
import {
    push
} from 'svelte-spa-router'
import Button from '../../components/Button.svelte'
import FormPanel from '../../components/FormPanel.svelte'
import Input from '../../components/Input.svelte'
import MyBuys from './MyBuys.svelte'
import MyRefunds from './MyRefunds.svelte';
import {
    BuyConfig,
    initSaleContract
} from './sale'

export let params: {
    wild: string
}

let sale, reserve, token
let errorMsg, saleAddress
let units, totalPrice
let showBuy, initPromise, calcPricePromise, buyPromise, approvePromise, startPromise, endPromise

$: if (params.wild) {
    initPromise = initContract()
}

const initContract = async () => {
    if (ethers.utils.isAddress(params.wild || '')) {
        [sale, reserve, token] = await initSaleContract($signer, params.wild)
    } else if (params.wild) {
        errorMsg = 'Not a valid contract address'
    }
}

const calculatePrice = async () => {
    const _units = parseUnits(units.toString(), token.erc20decimals.toString())
    return await sale.calculatePrice(_units)
}

const startSale = async () => {
    const tx = await sale.start()
    await tx.wait()
}

const endSale = async () => {
    const tx = await sale.end()
    await tx.wait()
}

const approve = async () => {
    const _units = BigNumber.from(units)
    const tx = await reserve.erc20Contract.approve(sale.address, _units.mul(await sale.calculatePrice(_units)))
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

<div class="w-full max-w-prose flex flex-col gap-y-4">
    <div class="flex flex-col gap-y-2 mb-2">
        <span class="text-2xl">Purchase from a deployed Sale</span>
    </div>

    {#if !params.wild}
    <FormPanel>
        <span class="text-gray-400">Enter a Sale contract address below.</span>
        <Input
            bind:value={saleAddress}
            type="string"
            placeholder="Contract address" />
        <Button
            on:click={() => {
            push(`/sale/purchase/${saleAddress}`)
            }}>
            Load
        </Button>
    </FormPanel>
    {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
    {/if}

    {#if initPromise}
    {#await initPromise}
    Loading...
    {:then}
    <div class="grid grid-cols-2 gap-x-4">
        <FormPanel heading="rTKN">
            <div class="flex flex-col gap-y-2">
                <span>Name: {token.erc20name}</span>
                <span>Symbol: {token.erc20symbol}</span>
                <span>
                    Total supply: {formatUnits(token.erc20totalSupply, token.erc20decimals.toString())}
                </span>
                <span>
                    Your balance: {formatUnits(token.erc20balance, token.erc20decimals.toString())}
                </span>
            </div>
        </FormPanel>
        <FormPanel heading="Reserve">
            <div class="flex flex-col gap-y-2">
                <span>Name: {reserve.erc20name}</span>
                <span>Symbol: {reserve.erc20symbol}</span>
                <span>
                    Total supply: {formatUnits(reserve.erc20totalSupply, reserve.erc20decimals.toString())}
                </span>
                <span>
                    Your balance: {formatUnits(reserve.erc20balance, reserve.erc20decimals.toString())}
                </span>
            </div>
        </FormPanel>
    </div>
    <FormPanel>
        <div class="grid grid-cols-2 gap-x-2 w-full">
            <Button on:click={()=>{startPromise = startSale()}}>Start sale</Button>
            <Button on:click={()=>{endPromise = endSale()}}>End sale</Button>
        </div>
    </FormPanel>
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
            Price will be {formatUnits(price, reserve.erc20decimals)} {reserve.erc20symbol} per {token.erc20symbol}
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
        <span>
            Buying: {units} {token.erc20symbol}
        </span>
        {#await calculatePrice()}
        <span>Calculating price...</span>
        {:then price}
        <span>Price: {formatUnits(price, reserve.erc20decimals)} {reserve.erc20symbol} per {token.erc20symbol}</span>
        <span>Total: {formatUnits(price.mul(BigNumber.from(units)), reserve.erc20decimals)} {reserve.erc20symbol}</span>
        {/await}
        {#if !approvePromise}
        <Button shrink on:click={()=>{approvePromise = approve()}}>Approve</Button>
        {:else}
        {#await approvePromise}
        Approving...
        {:then}
        {#if !buyPromise}
        <Button shrink on:click={()=>{buyPromise = buy()}}>Confirm Buy</Button>
        {:else}
        {#await buyPromise}
        Confirming...
        {:then}
        Buy complete! Refresh to see your balance.
        {/await}
        {/if}
        {/await}
        {/if}
        {/if}
    </FormPanel>
    {/await}
    {#if sale}
    <FormPanel>
        <MyBuys saleContract={sale}/>
    </FormPanel>
    <FormPanel>
        <MyRefunds saleContract={sale}/>
    </FormPanel>
    {/if}
    {/if}
</div>
