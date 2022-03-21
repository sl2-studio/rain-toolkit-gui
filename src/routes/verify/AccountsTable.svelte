<script lang="ts">
  import { query } from "@urql/svelte";
  import { Contract } from "ethers";
  import FormPanel from "src/components/FormPanel.svelte";
  import IconLibrary from "src/components/IconLibrary.svelte";
  import OverflowMenu from "src/components/overflow-menu/OverflowMenu.svelte";
  import OverFlowMenuItem from "src/components/overflow-menu/OverFlowMenuItem.svelte";
  import { getContext } from "svelte";
  import AccountHistoryModal from "./AccountHistoryModal.svelte";
  import ActionsModal from "./ActionsModal.svelte";

  import {
    verifyAddresses,
    verifyAddressQuery,
    verifyRequestStatusNames,
    VerifyStatuses,
    verifyStatusNames,
  } from "./verify";

  const { open } = getContext("simple-modal");

  export let verifyContract: Contract;

  verifyAddresses.variables.verifyAddress =
    verifyContract.address.toLowerCase();

  query(verifyAddresses);
  query(verifyAddressQuery);

  const refresh = () => {
    $verifyAddresses.reexecute();
  };

  const handleApprove = (address: string) => {
    open(ActionsModal, {
      method: verifyContract.approve,
      account: address,
      action: "Approve",
      confirmationMsg: `${address} has been approved.`,
    });
  };

  const handleBan = (address: string) => {
    open(ActionsModal, {
      method: verifyContract.ban,
      account: address,
      action: "Ban",
      confirmationMsg: `${address} has been banned.`,
    });
  };

  const handleRemove = (address: string) => {
    open(ActionsModal, {
      method: verifyContract.remove,
      account: address,
      action: "Remove",
      confirmationMsg: `${address} has been removed.`,
    });
  };

  const handleEvidence = (address: string) => {
    verifyAddressQuery.variables.verifyAddress = address.toLowerCase();
    verifyAddressQuery.variables.verifyContractAddress =
      verifyContract.address.toLowerCase();
    verifyAddressQuery.reexecute();
    open(AccountHistoryModal, { verifyAddressQuery });
  };
</script>

<FormPanel>
  <div class="flex w-full flex-col gap-y-4">
    <div class="flex flex-row justify-between">
      <span class="text-lg font-semibold">Account statuses</span>
      <span class:animate-spin={$verifyAddresses.fetching} on:click={refresh}
        ><IconLibrary icon="reload" /></span
      >
    </div>
    {#if $verifyAddresses.fetching}
      Loading accounts...
    {:else if $verifyAddresses.error}
      Something went wrong.
    {:else if $verifyAddresses.data.verify}
      <table class="table-auto w-full space-y-2">
        <tr class="border-b border-gray-600 uppercase text-sm">
          <th class="text-gray-400 text-left pb-2 font-light">Account</th>
          <th class="text-gray-400 text-left pb-2 font-light">Request Status</th
          >
          <th class="text-gray-400 text-left pb-2 font-light">Status</th>
          <th />
        </tr>
        {#each $verifyAddresses.data.verify.verifyAddresses as verifyAddress}
          <tr>
            <td>
              {verifyAddress.address}
            </td>
            <td>
              {verifyRequestStatusNames[Number(verifyAddress.requestStatus)]}
            </td>
            <td>
              {verifyStatusNames[Number(verifyAddress.status)]}
            </td>
            <td class="py-2 text-right w-36">
              <OverflowMenu>
                {#if (verifyAddress.status !== VerifyStatuses.APPROVED && verifyAddress.status !== VerifyStatuses.BANNED) || verifyAddress.requestStatus == VerifyStatuses.APPROVED}
                  <OverFlowMenuItem
                    on:click={() => {
                      handleApprove(verifyAddress.address);
                    }}>Approve</OverFlowMenuItem
                  >
                {/if}
                {#if verifyAddress.status !== VerifyStatuses.NONE || verifyAddress.status == VerifyStatuses.NONE}
                  <OverFlowMenuItem
                    on:click={() => {
                      handleRemove(verifyAddress.address);
                    }}>Remove</OverFlowMenuItem
                  >
                {/if}
                {#if verifyAddress.status !== VerifyStatuses.BANNED}
                  <OverFlowMenuItem
                    on:click={() => {
                      handleBan(verifyAddress.address);
                    }}>Ban</OverFlowMenuItem
                  >
                {/if}
                <span class="border-b border-gray-400 my-1" />
                <OverFlowMenuItem
                  on:click={() => {
                    handleEvidence(verifyAddress.address);
                  }}>History</OverFlowMenuItem
                >
              </OverflowMenu>
            </td>
          </tr>
        {/each}
      </table>
    {:else}
      No accounts yet.
    {/if}
  </div>
</FormPanel>
