<script lang="ts" type="module">
import ERC721BalanceTierReport from './routes/erc721-balance-tier/ERC721BalanceTierReport.svelte';
import { connected } from 'svelte-ethers-store';
import Contracts from './init-stores/Contracts.svelte';
import Router from 'svelte-spa-router'
import DeployBalanceTier from './routes/erc20-balance-tier/DeployBalanceTier.svelte';
import BalanceTierReport from './routes/erc20-balance-tier/BalanceTierReport.svelte';
import Home from './routes/Home.svelte';
import DeployGatedMinter from './routes/gated-minter/DeployGatedMinter.svelte';
import MintNft from './routes/gated-minter/MintNFT.svelte';
import Header from './layout/Header.svelte';
import Sidebar from './layout/Sidebar.svelte';
import ListBalanceTier from './routes/erc20-balance-tier/ListBalanceTier.svelte';
import DeployCombineTier from './routes/combine-tier/DeployCombineTier.svelte';
import CombineTierReport from './routes/combine-tier/CombineTierReport.svelte';
import Deploy721BalanceTier from './routes/erc721-balance-tier/Deploy721BalanceTier.svelte';
import DeploySale from './routes/sale/DeploySale.svelte';
import PurchaseSale from './routes/sale/PurchaseSale.svelte';
import DeployEmissions from './routes/emissions-erc20/DeployEmissions.svelte';
import ClaimEmissions from './routes/emissions-erc20/ClaimEmissions.svelte';

let routes = {}

routes = {
    // Using named parameters, with last being optional
	'/balancetier/deploy': DeployBalanceTier,
    '/balancetier/report/*': BalanceTierReport,
	'/balancetier/list': ListBalanceTier,

	'/721balancetier/deploy': Deploy721BalanceTier,
    '/721balancetier/report/*': ERC721BalanceTierReport,
	'/721balancetier/list': ListBalanceTier,

	'/combinetier/deploy': DeployCombineTier,
	'/combinetier/report/*': CombineTierReport,

	'/gatededition/deploy/*': DeployGatedMinter,
	'/gatededition/mint/*': MintNft,

	'/sale/deploy': DeploySale,
	'/sale/purchase/*': PurchaseSale,

	'/emissions/deploy': DeployEmissions,
	'/emissions/claim/*': ClaimEmissions,

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
	<div class="py-5 px-8 w-full">
		{#if $connected}
		<Router routes={routes} />
		{:else}
		Connect your wallet to get started.
		{/if}
	</div>
	
</main>

<Contracts />