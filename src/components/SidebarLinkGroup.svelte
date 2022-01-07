<script>
	import active from 'svelte-spa-router/active';
    export let label = ""
    export let url = ""
</script>

<div>
<div class="mb-4 text-gray-400" use:active={{path: url}} >{label}</div>
<div class="ml-5 flex flex-col gap-y-4">
    <slot></slot>
</div>
</div>

<style global lang="postcss">
    .active {
        @apply text-white;
    }
</style>