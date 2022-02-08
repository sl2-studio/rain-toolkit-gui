<script>
	import active from 'svelte-spa-router/active';
    import ArrowIcon from './ArrowIcon.svelte';
    export let label = ""
    export let url = ""

    let open = false
</script>

<div>
<div on:click={()=>{open = !open}} class="flex flex-row justify-between items-center mb-4 cursor-pointer hover:text-gray-300 text-gray-400 transition-all">
    <div use:active={{path: url}} >{label}</div>
    <div class="w-3 transform transition-all" class:open>
        <ArrowIcon fill="#999" />
    </div>
</div>
<div class="ml-5 flex flex-col gap-y-4">
    {#if open}
    <slot></slot>
    {/if}
</div>
</div>

<style global lang="postcss">
    .active {
        @apply text-white;
    }

    .open {
        @apply rotate-180;
    }
</style>