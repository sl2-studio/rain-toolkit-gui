<script lang="ts">
  export let heading = null as null | string;
</script>

<div
  class="flex flex-col items-start gap-y-4 rounded-xl bg-gray-800 p-8 drop-shadow-sm filter"
>
  {#if heading}
    <span class="font-white mb-2 text-lg font-semibold">{heading}</span>
  {/if}
  <slot name="description" />
  <slot />
</div>
