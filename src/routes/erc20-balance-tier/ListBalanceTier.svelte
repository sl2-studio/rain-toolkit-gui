<script>
import { ethers } from "ethers";

import { formatUnits } from "ethers/lib/utils";

import { onMount } from "svelte";
import { push } from "svelte-spa-router";
import Button from "../../components/Button.svelte";
import FormPanel from "../../components/FormPanel.svelte";
import { BALANCE_TIER_FACTORY_ADDRESS } from "../../constants";
import { decodeLogs, getLogs } from "../../queries";
import { initBalanceTier } from "./erc20-balance-tier";

let balanceTiers, initPromise

onMount(async () => {
    initPromise = init()
})

const init = async () => {
    try {
        const logs = await getLogs(BALANCE_TIER_FACTORY_ADDRESS)
    const decoded = await decodeLogs(logs, '0x7da70c4e5387d7038610b79ca7d304caaef815826e51e67cf247135387a79bce', ['address','address']) 
    balanceTiers = await Promise.all(decoded.map(async log=>{
        let balanceTier = await initBalanceTier(log.event[1])
        balanceTier = {...balanceTier, from: log.from}
        return balanceTier
    }))
    }
    catch(error) {
        console.log(error)
    }
}

</script>

{#if initPromise}
{#await initPromise}
Loading...
{:then}
{#if balanceTiers}
<div class="flex flex-col gap-y-3">
{#each balanceTiers as balanceTier}
<FormPanel>
    <div class="flex flex-col gap-y-2 mb-4">
        <span class="text-white">BalanceTier details</span>
        <div class="text-gray-400 flex flex-col">
            <span>Deployer: {balanceTier.from}</span>
            <span>Deployed: {Date(balanceTier.time).toLocaleString()}</span>
            <span>
                Token tiers: 
                {#each balanceTier.tierValues as tierValue}
                {#if !tierValue.eq(ethers.constants.MaxInt256)}
                    {formatUnits(tierValue, balanceTier.erc20Decimals)}, 
                {/if}
                {/each}
                
            </span>
        </div>
    </div>
    <div class="flex flex-col gap-y-2 mb-4">
        <span class="text-white">ERC20 details</span>
        <div class="text-gray-400 flex flex-col">
            <span>Name: {balanceTier.erc20Name}</span>
            <span>Symbol: {balanceTier.erc20Symbol}</span>
            <span>Address: {balanceTier.erc20Address}</span>
        </div>
    </div>
    <div class="flex flex-row gap-x-2">
        <Button on:click={push(`/balancetier/report/${balanceTier.balanceTierContract.address}`)}>Report</Button>
        <Button on:click={push(`/gatededition/deploy/${balanceTier.balanceTierContract.address}`)}>Gate an edition</Button>
    </div>
</FormPanel>
{/each}
</div>
{:else}
<span class="text-red-400">Something went wrong, try refreshing the page.</span>
{/if}
{/await}
{/if}