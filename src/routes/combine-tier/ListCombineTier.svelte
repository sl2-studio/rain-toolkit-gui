<script>
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import { operationStore, query } from "@urql/svelte";
  import { AddressBook } from "rain-sdk";
  import { chainId } from "svelte-ethers-store";
  import { selectedNetwork } from "src/stores";

  const combineTiers = operationStore(
    `
query {
  combineTiers {
    id
    address
    deployBlock
    deployTimestamp
    deployer
  }
}
`,
    {},
    {
      requestPolicy: "network-only",
      url: AddressBook.getSubgraphEndpoint(
        parseInt($selectedNetwork.config.chainId, 16)
      ),
    }
  );

  query(combineTiers);

  $: if (parseInt($selectedNetwork.config.chainId, 16) == $chainId) {
    gatedNFTs.reexecute({
      requestPolicy: "network-only",
      url: AddressBook.getSubgraphEndpoint(
        parseInt($selectedNetwork.config.chainId, 16)
      ),
    });
  }
</script>

{#if $combineTiers.fetching}
  Loading...
{:else if $combineTiers.error}
  <span class="text-red-400"
    >Something went wrong, try refreshing the page.</span
  >
{:else}
  <div class="flex flex-col gap-y-3">
    {#each $combineTiers.data.combineTiers as combineTier}
      <FormPanel>
        <div class="flex flex-col gap-y-2 mb-4">
          <span class="text-white">CombineTier details</span>
          <div class="text-gray-400 flex flex-col">
            <span>Contract Address: {combineTier.id}</span>
            <span>Deployer: {combineTier.deployer}</span>
            <span
              >Deployed: {Date(
                combineTier.deployTimestamp
              ).toLocaleString()}</span
            >
          </div>
        </div>
        <div class="flex flex-row gap-x-2">
          <Button on:click={push(`/combinetier/report/${combineTier.address}`)}
            >Report</Button
          >
        </div>
      </FormPanel>
    {/each}
  </div>
{/if}
