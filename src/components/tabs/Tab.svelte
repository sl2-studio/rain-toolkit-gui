<script>
  import { getContext } from "svelte";
  import { TABS } from "./Tabs.svelte";

  const tab = {};
  const { registerTab, selectTab, selectedTab } = getContext(TABS);

  registerTab(tab);
</script>

<a
  class="cursor-pointer border-b border-gray-600 pb-2 text-sm font-medium text-gray-600"
  class:selected={$selectedTab === tab}
  on:click={() => selectTab(tab)}
>
  <slot />
</a>
<div class="w-5 border-b border-gray-600" />

<style>
  .selected {
    @apply border-b border-gray-200 text-gray-100;
  }
</style>
