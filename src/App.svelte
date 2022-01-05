<script lang="ts">
import { connected } from 'svelte-ethers-store';
import Connect from './components/Connect.svelte';
import Deploy from './routes/deploy/Deploy.svelte';
import Contracts from './init-stores/Contracts.svelte';
</script>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>

<main class="text-gray-50 p-10">	
	{#if $connected}
	<Deploy />
	{:else}
	<Connect />
	{/if}
</main>

<Contracts />