<script>
export let state
export let step
</script>

{#if state == 'unfulfilled'}
<div class="flex-shrink-0 w-7 h-7 rounded-full bg-gray-400 flex justify-center items-center">
    <span class="leading-none text-center text-sm font-medium text-white">{step + 1}</span>
</div>
{:else}
<div class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex justify-center items-center">
    {#if state == 'fulfilled'}
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0984 3.02164L5.76921 15.2026L0.901611 9.969L3.09835 7.92588L5.76921 10.7976L14.9016 0.978516L17.0984 3.02164Z" fill="white"/>
    </svg>
    {:else if state == 'active'}
    <span class="leading-none text-center text-sm font-medium text-white">{step + 1}</span>
    {/if}
</div>
{/if}