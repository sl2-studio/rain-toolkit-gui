<script lang="ts">
import { connected } from 'svelte-ethers-store';
import Connect from './components/Connect.svelte';
import Deploy from './routes/deploy/Deploy.svelte';
import Contracts from './init-stores/Contracts.svelte';
import Router from 'svelte-spa-router'
import DeployBalanceTier from './routes/deploy/DeployBalanceTier.svelte';
import BalanceTierReport from './routes/balance-tier/BalanceTierReport.svelte';
import Home from './routes/Home.svelte';
import DeployGatedMinter from './routes/deploy/DeployGatedMinter.svelte';
import MintNft from './routes/gated-minter/MintNFT.svelte';
import Header from './layout/Header.svelte';
import Sidebar from './layout/Sidebar.svelte';
import ListBalanceTier from './routes/balance-tier/ListBalanceTier.svelte';

let routes = {}

routes = {
    // Using named parameters, with last being optional
	'/balancetier/deploy': DeployBalanceTier,
    '/balancetier/report/*': BalanceTierReport,
	'/balancetier/list': ListBalanceTier,

	'/gatededition/deploy/*': DeployGatedMinter,
	'/gatededition/mint/*': MintNft,

    '/': Home,

    // Catch-all
    // This is optional, but if present it must be the last
    // '*': NotFound,
}
</script>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>

<Header />
<main class="text-gray-50 flex relative">	
	<Sidebar />
	<div class="py-5 px-8">
		{#if $connected}
		<Router routes={routes} />
		{:else}
		Connect your wallet to get started.
		{/if}
	</div>
	
</main>

<Contracts />