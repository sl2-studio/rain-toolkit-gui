<script lang="ts">
  import { Contract } from "ethers";
  import Button from "src/components/Button.svelte";
  import FormPanel from "src/components/FormPanel.svelte";
  import { BLOCK_EXPLORER } from "src/constants";

  export let verifyContract: Contract;

  type Evidence = {
    account: string;
    data: string;
  };

  let addresses = "";
  let approvePromise;

  $: splitAddresses = addresses.split(/\r?\n/);

  const approve = async () => {
    try {
      const evidences: Evidence[] = splitAddresses.map((address) => {
        return { account: address, data: "0x10" };
      });
      const tx = await verifyContract.approve(evidences);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      throw error;
    }
  };
</script>

<FormPanel heading="Approve a list of addresses">
  <textarea
    class="h-40 w-full rounded-md border border-gray-400 bg-transparent p-4"
    placeholder="Enter a list of addresses on new lines"
    bind:value={addresses}
  />
  <Button
    on:click={() => {
      approvePromise = approve();
    }}>Approve</Button
  >
  {#if approvePromise}
    {#await approvePromise}
      <span class="text-blue-400">Approving addresses...</span>
    {:then receipt}
      <div class="text-blue-400">
        <span> Addresses approved! </span>
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
        {#if error?.data?.message}
          {error.data.message}
        {:else if error?.message}
          {error.message}
        {:else}
          {error}
        {/if}
      </span>
    {/await}
  {/if}
</FormPanel>
