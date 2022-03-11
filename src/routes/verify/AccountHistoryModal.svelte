<script lang="ts">
  import { OperationStore } from "@urql/svelte";
  import { selectedNetwork } from "src/stores";
  import IconLibrary from "src/components/IconLibrary.svelte";
  import { formatAddress } from "src/utils";
  export let verifyAddressQuery: OperationStore;
  import "node_modules/svelte-material-ui/bare.css";
  import { ethers } from "ethers";

  const decoder = new TextDecoder();
</script>

<div class="mb-8 flex flex-col gap-y-2">
  <div class="text-lg">Account history</div>
  <div class="text-gray-400">
    {$verifyAddressQuery.variables.verifyAddress}
  </div>
</div>
<table class="w-full table-auto space-y-2">
  <tr class="border-b border-gray-600 text-sm uppercase">
    <th class="pb-2 text-left font-light text-gray-400">Time</th>
    <th class="pb-2 text-left font-light text-gray-400">Type</th>
    <th class="pb-2 text-left font-light text-gray-400">Account</th>
    <th class="pb-2 text-left font-light text-gray-400">Sender</th>
    <th class="pb-2 text-left font-light text-gray-400">Evidence</th>
    <th />
  </tr>
  {#if $verifyAddressQuery.data}
    {#each $verifyAddressQuery.data?.verifyEvents as event}
      <tr>
        <td class="py-2 pr-4">
          {new Date(parseInt(event.timestamp) * 1000).toLocaleString()}
        </td>
        <td class="pr-4">
          {event.__typename}
        </td>
        <td class="pr-4">
          {formatAddress(event.account)}
        </td>
        <td class="pr-4">
          {formatAddress(event.sender)}
        </td>
        <td class="pr-4">
          {decoder.decode(ethers.utils.arrayify(event.data))}
        </td>
        <td class="pr-4 text-right">
          <a
            href={`${$selectedNetwork.blockExplorer}/tx/${event.transactionHash}`}
            target="_blank"
          >
            <IconLibrary icon="link" color="font-gray-100" width={10} />
          </a>
        </td>
      </tr>
    {/each}
  {/if}
</table>
