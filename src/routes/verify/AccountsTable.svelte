<script lang="ts">
  import { queryStore } from "@urql/svelte";
  import { Contract } from "ethers";
  import FormPanel from "src/components/FormPanel.svelte";
  import IconLibrary from "src/components/IconLibrary.svelte";
  import OverflowMenu from "src/components/overflow-menu/OverflowMenu.svelte";
  import OverFlowMenuItem from "src/components/overflow-menu/OverFlowMenuItem.svelte";
  import { getContext } from "svelte";
  import AccountHistoryModal from "./AccountHistoryModal.svelte";
  import ActionsModal from "./ActionsModal.svelte";
  import { client } from "src/stores";
  import {
    verifyRequestStatusNames,
    VerifyStatuses,
    verifyStatusNames,
  } from "./verify";

  const { open } = getContext("simple-modal");

  export let verifyContract: Contract;

  let temp1, temp2;
  let verifyAddress = verifyContract ? verifyContract.address.toLowerCase() : undefined;
  let verifyContractAddress;

  $: verifyAddresses = queryStore({
      client: $client,
      query: `
        query ($verifyAddress: Bytes!) {
          verify (id: $verifyAddress ) {
            id
            verifyAddresses {
              address
              requestStatus
              status
              roles
            }
          }
        }`,
      variables: { verifyAddress },
      requestPolicy: "network-only"
    })

  $: verifyAddressQuery = queryStore({
      client: $client,
      query: `
        query ($verifyAddress:Bytes!, $verifyContractAddress:Bytes!) {
          verifyEvents (where: {
            account: $verifyAddress,
            verifyContract: $verifyContractAddress
          },
            orderBy: timestamp,
            orderDirection:asc
          )
          {
            id
            timestamp
            transactionHash
            __typename
            sender
            account
            data
          }
        }`,
      variables: { verifyAddress, verifyContractAddress },
      requestPolicy: "network-only"
    })

  const refresh = async() => {
    if (!$verifyAddresses.fetching) {
      temp1 = verifyAddress;
      verifyAddress = undefined;
      if (await !$verifyAddresses.fetching) {
        verifyAddress = temp1;
      }
    }
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

  const handleEvidence = async(address: string) => {
    verifyAddress = address.toLowerCase();
    verifyContractAddress = verifyContract ? verifyContract.address.toLowerCase() : undefined;
    temp2 = verifyContractAddress
    verifyContractAddress = undefined;
    if (await !$verifyAddressQuery) {
      verifyContractAddress = temp2;
    }
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
                {#if 
                  (verifyAddress.status !== VerifyStatuses.APPROVED && verifyAddress.status !== VerifyStatuses.BANNED) || 
                  verifyAddress.requestStatus == VerifyStatuses.APPROVED
                }
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
