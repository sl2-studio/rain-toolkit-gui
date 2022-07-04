<script lang="ts">
  import { queryStore } from "@urql/svelte";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import { client } from "src/stores";

  $: gatedNFTs = queryStore({
    client: $client,
    query: `{
      gatedNFTs {
        id
        creator
        name
        symbol
        description
        imageUrl
        animationUrl
        minimumStatus
        transferrable
        maxMintable
        maxPerAddress
        tier {
          __typename
          address
        }
      }
    }`
  });

</script>

{#if $gatedNFTs.fetching}
  Loading...
{:else if $gatedNFTs.error}
  <span class="text-red-400"
    >Something went wrong, try refreshing the page.</span
  >
{:else}
  <div class="grid grid-cols-4 gap-3">
    {#each $gatedNFTs.data.gatedNFTs as gatedNFT}
      <FormPanel>
        <div class="w-full flex flex-col gap-y-2 mb-4">
          <div class="aspect-w-1 aspect-h-1 w-full">
            {#if gatedNFT.animationUrl}
              <video autoplay loop>
                <source src={gatedNFT.animationUrl} />
              </video>
            {:else if gatedNFT.imageUrl}
              <img
                class="object-contain w-full h-full"
                alt={gatedNFT.name}
                src={gatedNFT.imageUrl}
              />
            {/if}
          </div>
          <div class=" flex flex-col">
            <span class="text-gray-400">Name:</span>
            <span>{gatedNFT.name}</span>
            <span class="text-gray-400">Symbol:</span>
            <span>{gatedNFT.symbol}</span>
            <span class="text-gray-400">Description:</span>
            <span>{gatedNFT.description}</span>
          </div>
          <Button on:click={push(`/gatednft/mint/${gatedNFT.id}`)}>Mint</Button>
        </div>
      </FormPanel>
    {/each}
  </div>
{/if}
