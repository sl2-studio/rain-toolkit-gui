<script>
  export let value
  export let items = []
</script>

<div class="gap-y-2 flex flex-col w-full">
  {#if $$slots.label}
    <div class="font-light text-gray-100">
      <slot name="label" />
    </div>
  {/if}
  {#if $$slots.description}
    <span class="text-gray-400">
      <slot name="description" />
    </span>
  {/if}
  <div class="rounded-md border text-white border-gray-500 self-start">
    <select
      class="text-light text-gray-400 px-4 py-2 outline-none border-none
      bg-transparent"
      bind:value>
      {#each items as item}
        <option class="text-white" value={item}>{item.label}</option>
      {/each}
    </select>
  </div>
</div>
