<script lang="ts">
  import { signer } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import Button from "src/components/Button.svelte";
  import FormPanel from "src/components/FormPanel.svelte";
  import Input from "src/components/Input.svelte";
  import Select from "src/components/Select.svelte";
  import { push } from "svelte-spa-router";
  import VerifyContractArtifact from "abis/Verify.json";
  import { roles } from "./verify";
  import { BLOCK_EXPLORER } from "src/constants";

  export let params: {
    wild: string;
  };

  let errorMsg,
    verifyAddressInput,
    verifyContract,
    roleAddress,
    selectedRole,
    grantRolePromise;

  const initContract = async (address) => {
    verifyContract = new ethers.Contract(
      address,
      VerifyContractArtifact.abi,
      $signer
    );
  };

  if (ethers.utils.isAddress(params.wild)) {
    console.log("queried");
    initContract(params.wild);
    // $saleQuery.variables.saleAddress = params.wild.toLowerCase();
    // query(saleQuery);
  } else if (params.wild) {
    errorMsg = "Not a valid contract address";
  }

  $: console.log(selectedRole);

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

<div class="flex w-900 flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl">Administer a Verify</span>
  </div>

  {#if !params.wild}
    <FormPanel>
      <span class="text-gray-400">Enter a Verify contract address below.</span>
      <Input
        bind:value={verifyAddressInput}
        type="string"
        placeholder="Contract address"
      />
      <Button
        on:click={() => {
          push(`/verify/administer/${verifyAddressInput}`);
        }}
      >
        Load
      </Button>
    </FormPanel>
  {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
  {/if}
</div>

{#if verifyContract}
  <FormPanel heading="Grant a role">
    <Input type="text" bind:value={roleAddress}>
      <span slot="label">Address to grant this role to:</span>
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
              href={`${BLOCK_EXPLORER}/tx/${receipt.transactionHash}`}
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
{/if}
