<script lang="ts">
  import Button from "src/components/Button.svelte";
  import FormPanel from "src/components/FormPanel.svelte";
  import Input from "src/components/Input.svelte";
  import Select from "src/components/Select.svelte";
  import SimpleTransactionModal from "src/components/SimpleTransactionModal.svelte";
  import { getContext } from "svelte";
  import { roles } from "./verify";

  const { open } = getContext("simple-modal");

  export let verifyContract;

  let roleAddress, selectedRole;

  const handleClick = async () => {
    open(SimpleTransactionModal, {
      method: verifyContract.grantRole,
      args: [selectedRole.value, roleAddress],
      confirmationMsg: `${roleAddress} has been granted role '${selectedRole.label}'.`,
    });
  };
</script>

<FormPanel heading="Grant a role">
  <Input type="address" bind:value={roleAddress}>
    <span slot="label">Address to grant the role to:</span>
  </Input>
  <Select items={roles} bind:value={selectedRole}>
    <span slot="label">The role to grant:</span>
  </Select>
  <Button shrink on:click={handleClick}>Grant role</Button>
</FormPanel>
