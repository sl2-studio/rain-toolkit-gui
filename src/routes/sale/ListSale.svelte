<script>
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import { operationStore, query } from "@urql/svelte";
  import {} from "@ur";
  import { formatUnits } from "ethers/lib/utils";
  import { selectedNetwork } from "../../stores";
  import { chainId } from "svelte-ethers-store";

  import { AddressBook } from "rain-sdk";

  let skip;

  //   query($skip: Int) {
  // sales(first: 100, skip: $skip) {

  const sales = operationStore(
    `
query {
  sales {
    id
    address
    deployBlock
    deployTimestamp
    deployer
    percentRaised
    saleStatus
    totalRaised
    unitsAvailable
    token {
      decimals
    }
    reserve {
      decimals
    }
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
  // let skipRecords = 0;
  // $sales.variables.skip = 0;
  query(sales);

  $: if (parseInt($selectedNetwork.config.chainId, 16) == $chainId) {
    sales.reexecute({
      requestPolicy: "network-only",
      url: AddressBook.getSubgraphEndpoint(
        parseInt($selectedNetwork.config.chainId, 16)
      ),
    });
  }
</script>

{#if $sales.fetching}
  Loading...
{:else if $sales.error}
  <span class="text-red-400"
    >Something went wrong, try refreshing the page.</span
  >
{:else}
  <div class="flex flex-col gap-y-3">
    {#each $sales.data.sales as sale}
      <FormPanel>
        <div class="flex flex-col gap-y-2 mb-4">
          <span class="text-white">Sale details</span>
          <div class="text-gray-400 flex flex-col">
            <span>Sale: {sale.id}</span>
            <span>Deployer: {sale.deployer}</span>
            <span>Deployed: {Date(sale.deployTimestamp).toLocaleString()}</span>
            <span>Sales Status: {sale.saleStatus}</span>
            <span
              >Total Raised: {Number(
                (+formatUnits(sale.totalRaised, sale.reserve.decimals)).toFixed(
                  4
                )
              )}</span
            >
            <span>Percent Raised: {(+sale.percentRaised).toFixed(4)}%</span>
            <span
              >Available Units: {Number(
                (+formatUnits(
                  sale.unitsAvailable,
                  sale.token.decimals
                )).toFixed(4)
              )}</span
            >
          </div>
        </div>
        <div class="flex flex-row gap-x-2">
          <Button on:click={push(`/sale/purchase/${sale.address}`)}
            >Purchase</Button
          >
        </div>
      </FormPanel>
    {/each}
  </div>
{/if}
