<script lang="ts">
import {
    signer,
    signerAddress
} from 'svelte-ethers-store'
import {
    ethers,
    utils
} from 'ethers'
import {
    formatUnits,
    isAddress
} from 'ethers/lib/utils'
import {
    onMount
} from 'svelte'
import FormPanel from '../../components/FormPanel.svelte'
import BalanceTierAbi from '../../abis/ERC20BalanceTier.json'
import ERC20Abi from '../../abis/ReserveToken.json'
import Input from '../../components/Input.svelte'
import Button from '../../components/Button.svelte'
import {
    tierReport
} from '../../utils'
import {
    push
} from 'svelte-spa-router'
import { initBalanceTier } from './balance-tier';

export let params

$: console.log('signer address', $signerAddress)
$: console.log('params', params)

let balanceTierContract,
    erc20Contract,
    erc20Name,
    erc20Address,
    erc20Symbol,
    erc20Decimals,
    errorMsg,
    addressToReport,
    parsedReport,
    tierValues,
    addressBalance,
    balanceTierAddress

$: if (params.wild) {
    initContract()
}
$: console.log('updated errors', errorMsg)
const initContract = async () => {
    if (ethers.utils.isAddress(params.wild)) {
        // setting up the balance tier contract
        ({
            balanceTierContract,
            tierValues,
            errorMsg,
            erc20Contract,
            erc20Name,
            erc20Decimals,
            erc20Address,
            erc20Symbol
        } = await initBalanceTier(params.wild))
    } else if (params.wild) {
        errorMsg = 'Not a valid BalanceTier address'
    }
}

const report = async () => {
    if (ethers.utils.isAddress(addressToReport)) {
        const report = await balanceTierContract.report(addressToReport)
        parsedReport = tierReport(report)
        addressBalance = await erc20Contract.balanceOf(addressToReport)
    } else {
        errorMsg = 'Not a valid Ethereum address'
    }
}

const reportMyAddress = () => {
    addressToReport = $signerAddress
    report()
}
</script>
<div class="w-full max-w-prose flex flex-col gap-y-4">
    <div class="flex flex-col gap-y-2 mb-2">
        <span class="text-2xl">
            Get a BalanceTier report.
        </span>
        <span class="text-gray-400">
            BalanceTier checks the amount of a specific ERC20 held in a wallet.
        </span>
        {#if !params.wild}
        <span class="text-gray-400">
            Enter a BalanceTier contract address below, or <span class="underline cursor-pointer" on:click={()=>{push('/balancetier/list')}}>browse all deployed BalanceTier contracts.</span>
        </span>
        {/if}
    </div>
    {#if ethers.utils.isAddress(params.wild) && params.wild && !errorMsg}
    <FormPanel heading="ERC20 used for this BalanceTier">
        <div class="flex flex-col gap-y-2 mb-4">
            <div class="text-gray-400 flex flex-col">
                <span>Name: {erc20Name}</span>
                <span>Symbol: {erc20Symbol}</span>
                <span>Address: {erc20Address}</span>
            </div>
        </div>
    </FormPanel>
    <FormPanel heading="Get a report on an address">
        <Input
            bind:value={addressToReport}
            type="text"
            placeholder="Enter an Ethereum address" />
        <div class="flex flex-row gap-x-2">
            <Button shrink on:click={report}>Get a report</Button>
            <Button shrink on:click={reportMyAddress}>Report my address</Button>
        </div>
        {#if tierValues}
        <div class="flex flex-col gap-y-2">
            <span class="text-lg">Token values for this BalanceTier:</span>
            {#each tierValues as value, i}
            <span class="text-gray-400">
                Tier 1: {ethers.utils.formatUnits(value, erc20Decimals)}
                {#if parsedReport?.[i] == 0}
                ✅
                {:else if parsedReport?.[i] > 0}
                ❌
                {/if}
            </span>
            {/each}
        </div>
        {#if addressBalance}
        <span>Balance for {addressToReport}: {ethers.utils.formatUnits(addressBalance, erc20Decimals)} {erc20Symbol}</span>
        {/if}
        {/if}
    </FormPanel>
    {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
    {:else if !params.wild}
    <FormPanel>
        <Input bind:value={balanceTierAddress} type="string" placeholder="Contract address" />
        <Button on:click={()=>{push(`/balancetier/report/${balanceTierAddress}`)}}>
            Load
        </Button>
    </FormPanel>
    {/if}
</div>
