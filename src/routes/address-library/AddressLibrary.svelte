<script lang="ts">
  import Button from "src/components/Button.svelte";
  import IconLibrary from "src/components/IconLibrary.svelte";
  import { localLibrary, networkLibrary } from "src/localAddresses";
  import { getContext } from "svelte";
  import NewAlias from "./NewAlias.svelte";

  const { open, close } = getContext("simple-modal");

  let selectedGroup, flyPanel;

  export let onSelectAddress = (address) => {};

  export let manage;

  const handleRemoveAlias = (group: string, alias: string) => {
    localLibrary.removeAlias(group, alias);
  };

  const handleRemoveGroup = (group: string) => {
    localLibrary.removeGroup(group);
    if ((selectedGroup = group)) {
      selectedGroup = [...$networkLibrary][0][0];
    }
  };

  const handleAdd = () => {
    open(NewAlias);
  };

  const handleSelectGroup = (group) => {
    selectedGroup = group;
    flyPanel = !flyPanel;
  };

  const handleSelectAddress = (address) => {
    close();
    onSelectAddress(address);
  };
</script>

<div class="w-96">
  <div class="relative h-96 w-full overflow-hidden">
    <div
      class="absolute flex h-full flex-row transition-transform"
      style="width: 200%;"
      class:flyPanel
    >
      <div class="flex w-1/2 flex-col">
        <div class="mb-5 text-lg">Choose address from library</div>
        <div class="rounded-md border border-gray-600 p-2">
          {#each [...$networkLibrary.keys()] as groupName}
            <div
              class="flex cursor-pointer flex-row items-center justify-between rounded-md p-4 transition-colors hover:bg-gray-700"
              on:click={() => {
                handleSelectGroup(groupName);
              }}
            >
              <div>
                {groupName}
              </div>
              {#if manage}
                <span
                  on:click={() => {
                    handleRemoveGroup(groupName);
                  }}>delete</span
                >
              {/if}
              <IconLibrary height={15} icon="forward" inline />
            </div>
          {/each}
        </div>
      </div>
      <div class="flex w-1/2 flex-col">
        <div
          on:click={() => {
            flyPanel = !flyPanel;
          }}
          class="bottom-1 mb-5 cursor-pointer items-center rounded-md border-gray-400 transition-colors"
        >
          <IconLibrary icon="back" color="font-gray-400" inline height={15} />
          <span class="font-gray-400">Back</span>
        </div>
        <div class="overflow-auto">
          <div class="flex flex-col gap-y-2 ">
            {#each [...$networkLibrary.get(selectedGroup || [...$networkLibrary][0][0])] as [alias, value]}
              <div
                class="flex cursor-pointer flex-col gap-y-2 rounded-md border border-gray-600 p-4 transition-colors hover:bg-gray-700"
                on:click={() => {
                  handleSelectAddress(value.address);
                }}
              >
                <div class="flex flex-row justify-between">
                  <div>
                    {alias}
                  </div>
                  {#if manage}
                    <span
                      on:click={() => {
                        handleRemoveAlias(selectedGroup, alias);
                      }}>delete</span
                    >
                  {/if}
                </div>
                <div class="flex flex-col gap-y-2 text-sm">
                  <div>
                    <span class="text-xs uppercase text-gray-400">Address</span>
                    <span class="text-xs text-gray-200">{value.address}</span>
                  </div>
                  <div>
                    <span class="text-xs uppercase text-gray-400">Type</span>
                    <span class="text-xs text-gray-200">{value.type}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
  {#if manage}
    <Button on:click={handleAdd}>Add Alias</Button>
  {/if}
</div>

<style lang="postcss">
  .flyPanel {
    transform: translateX(-50%);
  }
</style>
