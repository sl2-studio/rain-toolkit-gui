<script lang="ts">
  import { Contract } from "ethers";
  import Button from "src/components/Button.svelte";
  import FormPanel from "src/components/FormPanel.svelte";
  import SimpleTransactionModal from "src/components/SimpleTransactionModal.svelte";
  import { getContext } from "svelte";

  const { open } = getContext("simple-modal");
  export let verifyContract: Contract;
  type Evidence = {
    account: string;
    data: Uint8Array;
  };

  let addresses = "";
  let encoder = new TextEncoder();

  $: lines = addresses.split(/\r?\n/);

  const approve = async () => {
    const evidences: Evidence[] = lines.map((line) => {
      const splitLine = line.split("\t");
      return { account: splitLine[0], data: encoder.encode(splitLine[1]) };
    });

    open(SimpleTransactionModal, {
      method: verifyContract.approve,
      args: [evidences],
      confirmationMsg: "Addresses approved.",
    });
  };
</script>

<FormPanel heading="Approve a list of addresses">
  <div class="space-y-2">
    <div>
      Enter a tab separated list of addresses and evidence on new lines. For
      example:
    </div>
    <div class="text-gray-400">
      <div>0x00298097bb10daf49189c398799ab1ab4d3bd50a evidence</div>
      <div>0x005e1ecfafe45d0887428b8f6c5db978ec72296a evidence</div>
    </div>
  </div>
  <textarea
    class="h-40 w-full rounded-md border border-gray-400 bg-transparent p-4"
    placeholder=""
    bind:value={addresses}
  />
  <Button on:click={approve}>Approve</Button>
</FormPanel>
