<script>
  import active from "svelte-spa-router/active";
  import ArrowIcon from "./ArrowIcon.svelte";
  export let label = "";
  export let url = "";

  let open = false;
</script>

<div>
  <div
    on:click={() => {
      open = !open;
    }}
    class="mb-4 flex cursor-pointer flex-row items-center justify-between text-gray-400 transition-all hover:text-gray-300"
  >
    <div use:active={{ path: url }}>{label}</div>
    <div class="w-3 transform transition-all" class:open>
      <ArrowIcon fill="#999" />
    </div>
  </div>
  <div class="ml-5 flex flex-col gap-y-4">
    {#if open}
      <slot />
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
