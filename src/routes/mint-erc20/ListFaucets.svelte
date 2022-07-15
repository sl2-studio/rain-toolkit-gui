<script>
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Switch from "src/components/Switch.svelte";
  import { queryStore } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { client } from "src/stores";

  let checked = true;

  $: allTokens = queryStore({
    client: $client,

    query: `
        query{
          emissionsERC20S(orderBy: deployTimestamp, orderDirection : desc, where:{ calculateClaimStateConfig_ : { sources_contains : ["0x01002e001d00010124001c00"]}}) {
            id
            address
            deployBlock
            deployTimestamp
            deployer
            name
            symbol
            totalSupply
            decimals
            claims{
              id
              sender
              data
              amount
            }
            calculateClaimStateConfig {
              id
              sources
              constants
              stack
            }
            }
        }`,
    requestPolicy: "network-only",
    pause: checked ? false : true,
  });

  $: allFaucets = queryStore({
    client: $client,
    query: `
        query{
          emissionsERC20S(orderBy: deployTimestamp, orderDirection : desc, where:{ calculateClaimStateConfig_ : { sources_contains : ["0x01002e001d0001010102050008002e0022000104160213021f00240001031c001c00"]}}) {
            id
            address
            deployBlock
            deployTimestamp
            deployer
            name
            symbol
            totalSupply
            decimals
            claims{
              id
              sender
              data
              amount
            }
            calculateClaimStateConfig {
              id
              sources
              constants
              stack
            }
            }
        }`,
    requestPolicy: "network-only",
    pause: !checked ? false : true,
  });

  $: txQuery = checked ? allTokens : allFaucets;
</script>

<div class="flex flex-col py-4">
  <div class="flex flex-row justify-between ">
    <span class="text-white text-2xl">ERC20 Token List</span>
    <div class="flex flex-row items-center gap-x-4">
      <span class="text-sm"
        >Showing {#if !checked}only Faucets{:else}All ERC20 Token{/if}</span
      >
      <Switch bind:checked />
    </div>
  </div>
</div>
{#if $txQuery.fetching}
  Loading...
{:else if $txQuery.error}
  <span class="text-red-400"
    >Something went wrong, try refreshing the page.</span
  >
{:else}
  <div class="flex flex-col gap-y-3">
    {#each $txQuery.data.emissionsERC20S as emission}
      <FormPanel>
        <div class="flex flex-col gap-y-2 mb-4">
          <span class="text-white"
            >{#if !checked}Faucet {:else} Token {/if} details</span
          >
          <div class="text-gray-400 flex flex-col">
            <span>Faucet Address: {emission.id}</span>
            <span>Name: {emission.name}</span>
            <span>Symbol: {emission.symbol}</span>
            <span
              >Total Supply: {Number(
                (+formatUnits(emission.totalSupply, emission.decimals)).toFixed(
                  4
                )
              )}</span
            >
            <span>Deployer: {emission.deployer}</span>
            <span
              >Deployed: {Date(emission.deployTimestamp).toLocaleString()}</span
            >
          </div>
        </div>
        <div class="flex flex-row gap-x-2">
          <Button on:click={push(`/erc20/mint/${emission.address}`)}
            >Mint</Button
          >
        </div>
      </FormPanel>
      <!-- {/if} -->
    {/each}
  </div>
{/if}
