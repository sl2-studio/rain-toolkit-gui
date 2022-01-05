<script>
export let heading
</script>

<div class="p-10 bg-gray-800 space-y-2 filter drop-shadow-sm rounded-xl space-y-10 flex flex-col items-start">
    <span class="text-xl font-semibold font-gray-900">{heading}</span>
    <slot name="description"></slot>
    <slot></slot>
</div>

