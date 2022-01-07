<script>
export let heading = null
</script>

<div class="p-8 bg-gray-800 gap-y-4 filter drop-shadow-sm rounded-xl flex flex-col items-start">
    {#if heading}
    <span class="text-lg font-white font-semibold mb-2">{heading}</span>
    {/if}
    <slot name="description"></slot>
    <slot></slot>
</div>

