<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Button from "../../components/Button.svelte";
  import { tierReport } from "../../utils";
  import { push } from "svelte-spa-router";
  import { CombineTier } from "rain-sdk";

  export let params: { wild: string },
    errorMsg: string,
    combineTierAddress: string,
    addressToReport: string,
    parsedReport: number[],
    combineTierContract;

  const tierValues = new Array(8);

  $: if (params.wild) {
    initContract();
  }

  const initContract = async () => {
    if (ethers.utils.isAddress(params.wild || "")) {
      // setting up the combine tier contract

      combineTierContract = new CombineTier(params.wild, $signer);
    } else if (params.wild) {
      errorMsg = "Not a valid BalanceTier address";
    }
  };

  const report = async () => {
    if (ethers.utils.isAddress(addressToReport)) {
      const report = await combineTierContract.report(addressToReport);
      parsedReport = tierReport(report.toHexString());
    } else {
      errorMsg = "Not a valid Ethereum address";
    }
  };

  const reportMyAddress = () => {
    addressToReport = $signerAddress;
    report();
  };
</script>

<div class="flex w-full max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl"> Get a CombineTier report. </span>
    <span class="text-gray-400">
      CombineTier produces a report based on two or more other Tiers.
    </span>
    {#if !params.wild}
      <span class="text-gray-400">
        Enter a CombineTier contract address below, or <span
          class="cursor-pointer underline"
          on:click={() => {
            push("/combinetier/list");
          }}>browse all deployed CombineTier contracts.</span
        >
      </span>
    {/if}
  </div>
  {#if ethers.utils.isAddress(params.wild) && params.wild && !errorMsg}
    <FormPanel heading="Get a report on an address">
      <Input
        bind:value={addressToReport}
        type="text"
        placeholder="Enter an Ethereum address"
      />
      <div class="flex flex-row gap-x-2">
        <Button shrink on:click={report}>Get a report</Button>
        <Button shrink on:click={reportMyAddress}>Report my address</Button>
      </div>
      {#if tierValues}
        <div class="flex flex-col gap-y-2">
          <span class="text-lg">Token values for this BalanceTier:</span>
          {#each tierValues as value, i}
            <span class="text-gray-400">
              Tier {i + 1}:
              {#if parsedReport?.[i] == 0}
                ✅
              {:else if parsedReport?.[i] > 0}
                ❌
              {/if}
            </span>
          {/each}
        </div>
      {/if}
    </FormPanel>
  {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
  {:else if !params.wild}
    <FormPanel>
      <Input
        bind:value={combineTierAddress}
        type="address"
        placeholder="Contract address"
      />
      <Button
        on:click={() => {
          push(`/combinetier/report/${combineTierAddress}`);
        }}
      >
        Load
      </Button>
    </FormPanel>
  {/if}
</div>
