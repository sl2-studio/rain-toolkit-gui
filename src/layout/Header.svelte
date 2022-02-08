<script>
import { signerAddress } from 'svelte-ethers-store';
import Connect from '../components/Connect.svelte';
import User from '../components/User.svelte';
</script>
<div class="border-b border-gray-700 w-full flex flex-row justify-between items-center h-16 px-5 sticky bg-gray-900 top-0 z-40">
    <span class="text-xl text-gray-50 font-light">Rain UI Toolkit</span>
    <span class="text-gray-400">
        {#if $signerAddress}
        <User address="{$signerAddress}" />
        {:else}
        <Connect />
        {/if}
    </span>
</div> 