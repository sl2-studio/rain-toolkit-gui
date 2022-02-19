<script lang="ts">
  import { fly } from "svelte/transition";
  let visible, timer;

  export let bgClass: string = "";
  export let light: Boolean = false;
  export let message: string;
  let _bgClass;

  export function flash() {
    visible = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      visible = false;
    }, 1800);
  }

  $: if (light && !bgClass) {
    _bgClass = "bg-gray-100 text-gray-800";
  } else if (!bgClass) {
    _bgClass = "bg-gray-800 text-gray-300";
  } else if (bgClass) {
    _bgClass = bgClass;
  }
</script>

<div class="relative">
  {#if visible}
    <div
      transition:fly={{ y: 10, duration: 500 }}
      class={`${_bgClass} absolute left-2/4 -top-2 z-10 max-w-sm -translate-x-1/2 -translate-y-full transform rounded-md px-3 py-2 text-xs`}
    >
      {message}
    </div>
  {/if}
  <slot />
</div>
