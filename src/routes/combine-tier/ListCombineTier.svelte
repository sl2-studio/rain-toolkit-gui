<script>
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import { queryStore } from "@urql/svelte";
  import { client } from "src/stores";


  $: combineTiers = queryStore({
    client: $client,
    query: 
      `query {
        combineTiers {
          id
          address
          deployBlock
          deployTimestamp
          deployer
        }
      }`
    }
  );

  //query(combineTiers);
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
