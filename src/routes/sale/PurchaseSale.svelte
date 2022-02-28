<script lang="ts">
  import TokenInfo from "./TokenInfo.svelte";
  import { operationStore, query } from "@urql/svelte";
  import { ethers } from "ethers";
  import { signer, provider } from "svelte-ethers-store";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Buy from "./Buy.svelte";
  import MyTransactions from "./MyTransactions.svelte";
  import { initSaleContracts } from "./sale";
  import SaleProgress from "./SaleProgress.svelte";
  import CheckTier from "./CheckTier.svelte";
  import { onMount } from "svelte";

  export let params: {
    wild: string;
  };

  let sale, reserve, token;
  let errorMsg, saleAddress, saleAddressInput, latestBlock;
  let startPromise, endPromise;

  const saleQuery = operationStore(
    `
  query ($saleAddress: Bytes!) {
    sale (id: $saleAddress) {
      id
      token {
        id
        name
        symbol
        decimals
        totalSupply
        minimumTier
        tier {
          id
          __typename
        }
      }
      reserve {
        id
        name
        symbol
        decimals
        totalSupply
      }
      cooldownDuration
      deployBlock
    }
  }
  `,
    {
      saleAddress,
    },
    {
      requestPolicy: "cache-and-network",
    }
  );

  const initContracts = () => {
    [sale, reserve, token] = initSaleContracts($saleQuery.data.sale, $signer);
  };

  if (ethers.utils.isAddress(params.wild)) {
    $saleQuery.variables.saleAddress = params.wild.toLowerCase();
    query(saleQuery);
  } else if (params.wild) {
    errorMsg = "Not a valid contract address";
  }

  $: if (!$saleQuery.fetching && $saleQuery.data?.sale) {
    initContracts();
  }

  $: saleData = $saleQuery.data?.sale;

  const startSale = async () => {
    try {
      const tx = await sale.start();
      await tx.wait();
    } catch (error) {
      throw error;
    }
  };

  const endSale = async () => {
    try {
      const tx = await sale.end();
      await tx.wait();
    } catch (error) {
      throw error;
    }
  };

  onMount(async () => {
    latestBlock = await $provider.getBlockNumber();
  });
</script>

<div class="flex w-900 flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl">Purchase from a deployed Sale</span>
  </div>

  {#if !params.wild}
    <FormPanel>
      <span class="text-gray-400">Enter a Sale contract address below.</span>
      <Input
        bind:value={saleAddressInput}
        type="string"
        placeholder="Contract address"
      />
      <Button
        on:click={() => {
          push(`/sale/purchase/${saleAddressInput}`);
        }}
      >
        Load
      </Button>
    </FormPanel>
  {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
  {/if}

  {#if $saleQuery.fetching}
    Loading...
  {:else if !$saleQuery.data?.sale && $saleQuery.data}
    No Sale found with that address.
  {:else if sale}
    <FormPanel>
      <SaleProgress saleContract={sale} />
      <div class="grid grid-cols-2 gap-2 w-full">
        <div class="flex flex-col gap-y-2">
          <Button
            on:click={() => {
              startPromise = startSale();
            }}
          >
            Start sale
          </Button>
          {#if startPromise}
            {#await startPromise}
              <span class="text-blue-400">Starting...</span>
            {:then}
              <span class="text-blue-400">Started!</span>
            {:catch error}
              <span class="text-red-400">{error.data.message}</span>
            {/await}
          {/if}
        </div>
        <div class="flex flex-col gap-y-2">
          <Button
            on:click={() => {
              endPromise = endSale();
            }}
          >
            End sale
          </Button>
          {#if endPromise}
            {#await endPromise}
              <span class="text-blue-400">Ending...</span>
            {:then}
              <span class="text-blue-400">Ended!</span>
            {:catch error}
              <span class="text-red-400">{error.data.message}</span>
            {/await}
          {/if}
        </div>
      </div>
    </FormPanel>
    <FormPanel heading="Eligibility">
      <CheckTier
        {signer}
        minimumStatus={parseInt(saleData?.token.minimumTier)}
        tierData={saleData?.token.tier}
        againstBlock={latestBlock}
      />
    </FormPanel>
    <div class="grid grid-cols-2 gap-4">
      <FormPanel heading="Raise Token">
        <TokenInfo tokenData={saleData.token} {signer} />
      </FormPanel>
      <FormPanel heading="Reserve Token">
        <TokenInfo tokenData={saleData.reserve} {signer} />
      </FormPanel>
    </div>
    <Buy {saleData} {sale} {token} {reserve} />
    <FormPanel>
      <MyTransactions saleContract={sale} />
    </FormPanel>
  {/if}
</div>
