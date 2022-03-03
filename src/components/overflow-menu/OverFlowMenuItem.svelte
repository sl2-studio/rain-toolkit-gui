<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";

  const { toggle } = getContext("overflow-menu");
  const dispatch = createEventDispatcher();

  const handleClick = () => {
    dispatch("click");
    toggle();
  };
</script>

<div
  class="flex cursor-pointer flex-col items-center py-1 px-4 transition-colors hover:bg-gray-600"
  on:click={handleClick}
>
  <slot />
</div>
