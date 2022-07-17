<!-- <script>
  import { BigNumber, ethers } from "ethers";
  import { formatUnits } from "ethers/lib/utils";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import { queryStore } from "@urql/svelte";
  import { client } from "src/stores";


  $: transferTiers = queryStore({
    client: $client,
    query: `
      query {
        erc20TransferTiers {
          id
          address
          deployBlock
          deployTimestamp
          deployer
          token {
            id
            name
            symbol
            decimals
          }
          tierValues
        }
      }`
    }
  );

  //query(transferTiers);
</script>

{#if $transferTiers.fetching}
  Loading...
{:else if $transferTiers.error}
  <span class="text-red-400"
    >Something went wrong, try refreshing the page.</span
  >
{:else}
  <div class="flex flex-col gap-y-3">
    {#each $transferTiers.data.erc20TransferTiers as transferTier}
      <FormPanel>
        <div class="flex flex-col gap-y-2 mb-4">
          <span class="text-white">TransferTier details</span>
          <div class="text-gray-400 flex flex-col">
            <span>Contract Address: {transferTier.id}</span>
            <span>Deployer: {transferTier.deployer}</span>
            <span
              >Deployed: {Date(
                transferTier.deployTimestamp
              ).toLocaleString()}</span
            >
            <span>
              Token tiers:
              {#each transferTier.tierValues as tierValue}
                {#if !BigNumber.from(tierValue).eq(ethers.constants.MaxInt256)}
                  {formatUnits(tierValue, transferTier.token.decimals)},
                {/if}
              {/each}
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-y-2 mb-4">
          <span class="text-white">ERC20 details</span>
          <div class="text-gray-400 flex flex-col">
            <span>Name: {transferTier.token.name}</span>
            <span>Symbol: {transferTier.token.symbol}</span>
            <span>Address: {transferTier.token.id}</span>
          </div>
        </div>
        <div class="flex flex-row gap-x-2">
          <Button
            on:click={push(`/erc20transfertier/report/${transferTier.address}`)}
            >Report</Button
          >
        </div>
      </FormPanel>
    {/each}
  </div>
{/if} -->
