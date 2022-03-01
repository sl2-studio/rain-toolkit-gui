<script lang="ts">
  import Button from "src/components/Button.svelte";
  import FormPanel from "src/components/FormPanel.svelte";
  import Input from "src/components/Input.svelte";
  import Select from "src/components/Select.svelte";
  import { selectedNetwork } from "src/stores";
  import { roles } from "./verify";

  export let verifyContract;

  let roleAddress, selectedRole, grantRolePromise;

  const grantRole = async (address, role, verifyContract) => {
    let receipt;
    try {
      const tx = await verifyContract.grantRole(role, address);
      receipt = await tx.wait();
    } catch (error) {
      throw error;
    }
    return receipt;
  };
</script>

<FormPanel heading="Grant a role">
  <Input type="text" bind:value={roleAddress}>
    <span slot="label">Address to grant the role to:</span>
  </Input>
  <Select items={roles} bind:value={selectedRole}>
    <span slot="label">The role to grant:</span>
  </Select>
  <Button
    shrink
    on:click={() => {
      grantRolePromise = grantRole(
        roleAddress,
        selectedRole.value,
        verifyContract
      );
    }}>Grant role</Button
  >
  {#if grantRolePromise}
    {#await grantRolePromise}
      <span class="text-blue-400">Granting role...</span>
    {:then receipt}
      <div class="text-blue-400">
        <span> Role granted! </span>
        <span>
          <a
            target="_blank"
            class="underline"
            href={`${$selectedNetwork.blockExplorer}/tx/${receipt.transactionHash}`}
            >See transaction.</a
          >
        </span>
      </div>
    {:catch error}
      <span class="text-red-400">
        {#if error.message}
          {error.message}
        {:else}
          {error}
        {/if}
      </span>
    {/await}
  {/if}
</FormPanel>
