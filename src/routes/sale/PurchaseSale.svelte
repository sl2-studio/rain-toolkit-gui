<script lang="ts">
  import TokenInfo from "./TokenInfo.svelte";
  import { queryStore } from "@urql/svelte";
  import { ethers } from "ethers";
  import { signer } from "svelte-ethers-store";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Buy from "./Buy.svelte";
  import SaleProgress from "./SaleProgress.svelte";
  import CheckTier from "./CheckTier.svelte";
  import { onMount } from "svelte";
  import TransactionsTable from "./TransactionsTable.svelte";
  import SaleChart from "./SaleChart.svelte";
  import EscrowDeposit from "./escrow/RedeemableDeposit.svelte";
  import EscrowDepositsTable from "./escrow/EscrowDepositsTable.svelte";
  import { saleStatuses } from "./sale";
  import EscrowPendingDepositTable from "./escrow/EscrowPendingDepositTable.svelte";
  import EscrowUndepositTable from "./escrow/EscrowUndepositTable.svelte";
  import { Sale, ERC20 } from "rain-sdk";
  import { client } from "src/stores";

  export let params: {
    wild: string;
  };

  let sale, reserve, token;
  let errorMsg, saleAddress, saleAddressInput, latestBlock;
  let startPromise, endPromise, initPromise;

  $: saleQuery = queryStore({
    client: $client,
    query: `
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
            saleStatus
          }
        }`,
    variables: { saleAddress },
    requestPolicy: "cache-and-network",
  });

  $: saleData =
    !$saleQuery?.fetching && $saleQuery?.data?.sale
      ? $saleQuery.data.sale
      : undefined;
  $: saleStatus = $saleQuery?.data?.sale?.saleStatus
    ? saleStatuses[$saleQuery.data.sale.saleStatus]
    : undefined;

  const initContracts = async () => {
    sale = new Sale($saleQuery?.data?.sale.id, $signer);
    reserve = new ERC20($saleQuery?.data?.sale.reserve?.id, $signer);
    token = new ERC20($saleQuery?.data?.sale.token?.id, $signer);
  };

  $: if (ethers.utils.isAddress(params.wild)) {
    saleAddress = params.wild.toLowerCase();
  } else if (params.wild) {
    saleAddress = undefined;
    errorMsg = "Not a valid contract address";
  }

  $: if (saleData || $signer) {
    if (!$saleQuery.fetching && saleData) {
      initPromise = initContracts();
    }
  }

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
    latestBlock = await $signer.provider.getBlockNumber();
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
        type="address"
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
  {:else if initPromise && !$saleQuery.fetching && $saleQuery.data && $saleQuery.data.sale}
    {#await initPromise}
      Loading...
    {:then} 
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
      <FormPanel>
        <SaleChart
          saleContract={sale}
          token={saleData?.token}
          reserve={saleData?.reserve}
        />
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
          <TokenInfo tokenData={saleData?.token} {signer} />
        </FormPanel>
        <FormPanel heading="Reserve Token">
          <TokenInfo tokenData={saleData?.reserve} {signer} />
        </FormPanel>
      </div>
      <Buy {saleData} {sale} {token} {reserve} />
      <FormPanel>
        <TransactionsTable saleContract={sale} />
      </FormPanel>
      <EscrowDeposit {saleData} {sale} />
      {#if saleStatus != undefined && saleStatus == "Success"}
        <FormPanel>
          <EscrowDepositsTable {saleData} salesContract={sale} {token} />
        </FormPanel>
      {:else if saleStatus != undefined && saleStatus == "Fail"}
        <FormPanel>
          <EscrowUndepositTable {saleData} salesContract={sale} />
        </FormPanel>
      {/if}

      <FormPanel>
        <EscrowPendingDepositTable salesContract={sale} />
      </FormPanel>
    {/await}
  {/if}
</div>
