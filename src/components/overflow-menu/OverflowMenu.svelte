<script lang="ts">
  import { fade } from "svelte/transition";
  import IconLibrary from "components/IconLibrary.svelte";
  import { setContext } from "svelte";

  let open, buttonRef, menuRef;

  const toggle = () => {
    open = !open;
  };

  setContext("overflow-menu", {
    toggle: toggle,
  });
</script>

<svelte:window
  on:click={({ target }) => {
    if (buttonRef && buttonRef.contains(target)) return;
    if (menuRef && !menuRef.contains(target)) {
      toggle();
    }
  }}
/>

<div class="relative inline-flex">
  <div
    class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-gray-700 transition-colors hover:bg-gray-600"
    on:click={toggle}
    bind:this={buttonRef}
  >
    <IconLibrary inline icon="options" height={13} color="font-gray-200" />
  </div>
  {#if open}
    <div
      transition:fade={{ duration: 70 }}
      bind:this={menuRef}
      class="absolute top-full right-0 z-10 mt-1 flex flex-col items-stretch overflow-hidden rounded-md bg-gray-700"
    >
      <slot />
    </div>
  {/if}
</div>
