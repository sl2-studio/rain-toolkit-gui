<script>
  import { BigNumber, ethers } from "ethers";
  import { formatUnits } from "ethers/lib/utils";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import { queryStore } from "@urql/svelte";
  import { client } from "../../stores"

  $: balanceTiers = queryStore({
    client: $client,
    query: `
      query {
        erc20BalanceTiers {
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

</script>

{#if $balanceTiers.fetching}
  Loading...
{:else if $balanceTiers.error}
  <span class="text-red-400"
    >Something went wrong, try refreshing the page.</span
  >
{:else}
  <div class="flex flex-col gap-y-3">
    {#each $balanceTiers.data.erc20BalanceTiers as balanceTier}
      <FormPanel>
        <div class="flex flex-col gap-y-2 mb-4">
          <span class="text-white">BalanceTier details</span>
          <div class="text-gray-400 flex flex-col">
            <span>Contract Address: {balanceTier.id}</span>
            <span>Deployer: {balanceTier.deployer}</span>
            <span
              >Deployed: {Date(
                balanceTier.deployTimestamp
              ).toLocaleString()}</span
            >
            <span>
              Token tiers:
              {#each balanceTier.tierValues as tierValue}
                {#if !BigNumber.from(tierValue).eq(ethers.constants.MaxInt256)}
                  {formatUnits(tierValue, balanceTier.token.decimals)},
                {/if}
              {/each}
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-y-2 mb-4">
          <span class="text-white">ERC20 details</span>
          <div class="text-gray-400 flex flex-col">
            <span>Name: {balanceTier.token.name}</span>
            <span>Symbol: {balanceTier.token.symbol}</span>
            <span>Address: {balanceTier.token.id}</span>
          </div>
        </div>
        <div class="flex flex-row gap-x-2">
          <Button
            on:click={push(`/erc20balancetier/report/${balanceTier.address}`)}
            >Report</Button
          >
        </div>
      </FormPanel>
    {/each}
  </div>
{/if}
