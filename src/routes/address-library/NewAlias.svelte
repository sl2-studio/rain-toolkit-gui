<script>
  import Button from "src/components/Button.svelte";
  import FormPanel from "src/components/FormPanel.svelte";
  import Input from "src/components/Input.svelte";
  import Select from "src/components/Select.svelte";
  import { localLibrary, networkLibrary } from "src/localAddresses";
  import { getContext } from "svelte";

  const { close } = getContext("simple-modal");

  $: selectItems = [
    ...[...$networkLibrary.keys()].map((g) => {
      return { label: g };
    }),
    { label: "+ Add new group" },
  ];

  let selectGroup, groupField;
  let group, alias;
  export let address, type;

  const handleAdd = () => {
    const _group =
      selectGroup?.label == "+ Add new group" ? groupField : selectGroup.label;
    localLibrary.addAlias(_group, alias, address, type);
    close();
  };
</script>

<div class="flex w-96 flex-col gap-y-2">
  <span class="text-lg font-medium">Add alias</span>
  <Select items={selectItems} bind:value={selectGroup}>
    <span slot="label">Group</span>
  </Select>
  {#if selectGroup?.label == "+ Add new group"}
    <Input type="text" bind:value={groupField} />
  {/if}
  <Input type="text" bind:value={alias}>
    <span slot="label">Alias</span>
  </Input>
  <Input type="text" bind:value={address}>
    <span slot="label">Address</span>
  </Input>
  <Input type="text" bind:value={type}>
    <span slot="label">Type</span>
  </Input>
  <Button on:click={handleAdd}>Save</Button>
</div>
