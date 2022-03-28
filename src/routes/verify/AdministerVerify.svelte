<script lang="ts">
  import { signer } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import Button from "src/components/Button.svelte";
  import FormPanel from "src/components/FormPanel.svelte";
  import Input from "src/components/Input.svelte";
  import { push } from "svelte-spa-router";
  import VerifyContractArtifact from "abis/Verify.json";
  import AdministerRolesTab from "./AdministerRolesTab.svelte";
  import { Tabs, TabList, TabPanel, Tab } from "src/components/tabs/tabs";
  import AccountsTable from "./AccountsTable.svelte";
  import ApproveAddress from "./ApproveAddress.svelte";

  export let params: {
    wild: string;
  };

  let errorMsg, verifyAddressInput, verifyContract, selectedRole;

  const initContract = async (address) => {
    verifyContract = new ethers.Contract(
      address,
      VerifyContractArtifact.abi,
      $signer
    );
  };

  $: if (ethers.utils.isAddress(params.wild)) {
    initContract(params.wild);
  } else if (params.wild) {
    errorMsg = "Not a valid contract address";
  }
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
        type="address"
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
  <div class="mt-8">
    <Tabs>
      <TabList>
        <Tab>Users</Tab>
        <Tab>Admins</Tab>
      </TabList>
      <TabPanel>
        <div class="flex flex-col gap-y-4">
          <ApproveAddress {verifyContract} />
          <AccountsTable {verifyContract} />
        </div>
      </TabPanel>
      <TabPanel>
        <AdministerRolesTab {verifyContract} />
      </TabPanel>
    </Tabs>
  </div>
{/if}
