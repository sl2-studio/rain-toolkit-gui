<script>
  import { onMount, tick, onDestroy } from "svelte";
  import jazzicon from "@metamask/jazzicon";

  let avatar, icon;
  export let address;
  export let width = 35;

  $: if (address) {
    append();
  }

  async function append() {
    await tick();
    if (icon) {
      icon.remove();
    }
    icon = jazzicon(width, jsNumberForAddress(address));
    avatar.appendChild(icon);
  }

  function jsNumberForAddress(address) {
    const addr = address.slice(2, 10);
    const seed = parseInt(addr, 16);
    return seed;
  }

  $: show = address
    ? "transition-opacity duration-500 opacity-100"
    : "transition-opacity duration-500 opacity-0";
</script>

<div class="relative" style="height:{width}px; width:{width}px">
  <div style="height:{width}px" bind:this={avatar} class={show} />

  {#if !address}
    <div class="absolute inset-0 animate-pulse rounded-full bg-gray-200" />
  {/if}
</div>
