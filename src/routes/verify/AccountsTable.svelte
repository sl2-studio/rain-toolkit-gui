<script lang="ts">
  import { query } from "@urql/svelte";
  import { Contract } from "ethers";
  import FormPanel from "src/components/FormPanel.svelte";
  import AccountsTable from "./AccountsTable.svelte";
  import {
    verifyAddresses,
    verifyRequestStatuses,
    verifyStatuses,
  } from "./verify";

  export let verifyContract: Contract;

  verifyAddresses.variables.verifyAddress =
    verifyContract.address.toLowerCase();
  query(verifyAddresses);

  $: console.log($verifyAddresses);
</script>

<FormPanel>
  <div class="flex w-full flex-col gap-y-4">
    <span class="text-lg font-semibold">Account statuses</span>
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
              {verifyRequestStatuses[Number(verifyAddress.requestStatus)]}
            </td>
            <td>
              {verifyStatuses[Number(verifyAddress.status)]}
            </td>
            <td class="py-2 text-right w-36" />
          </tr>
        {/each}
      </table>
    {:else}
      No accounts yet.
    {/if}
  </div>
</FormPanel>
