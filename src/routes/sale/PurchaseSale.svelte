<script lang="ts">
  import { BigNumber, ethers } from "ethers";
  import { formatUnits, parseUnits } from "ethers/lib/utils";
  import { signer, signerAddress } from "svelte-ethers-store";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Buy from "./Buy.svelte";
  import MyBuys from "./MyBuys.svelte";
  import MyRefunds from "./MyRefunds.svelte";
  import MyTransactions from "./MyTransactions.svelte";
  import { BuyConfig, initSaleContract } from "./sale";
  import SaleProgress from "./SaleProgress.svelte";

  export let params: {
    wild: string;
  };

  let sale, reserve, token;
  let errorMsg, saleAddress;
  let initPromise, startPromise, endPromise;

  $: if (params.wild) {
    initPromise = initContract();
  }

  const initContract = async () => {
    if (ethers.utils.isAddress(params.wild || "")) {
      [sale, reserve, token] = await initSaleContract($signer, params.wild);
    } else if (params.wild) {
      errorMsg = "Not a valid contract address";
    }
  };

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
</script>

<div class="flex w-900 flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl">Purchase from a deployed Sale</span>
  </div>

  {#if !params.wild}
    <FormPanel>
      <span class="text-gray-400">Enter a Sale contract address below.</span>
      <Input
        bind:value={saleAddress}
        type="string"
        placeholder="Contract address"
      />
      <Button
        on:click={() => {
          push(`/sale/purchase/${saleAddress}`);
        }}
      >
        Load
      </Button>
    </FormPanel>
  {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
  {/if}

  {#if initPromise}
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
      <div class="grid grid-cols-2 gap-x-4">
        <FormPanel heading="rTKN">
          <div class="flex flex-col gap-y-2">
            <span>Name: {token.erc20name}</span>
            <span>Symbol: {token.erc20symbol}</span>
            <span>
              Total supply: {formatUnits(
                token.erc20totalSupply,
                token.erc20decimals.toString()
              )}
            </span>
            <span>
              Your balance: {formatUnits(
                token.erc20balance,
                token.erc20decimals.toString()
              )}
            </span>
          </div>
        </FormPanel>
        <FormPanel heading="Reserve">
          <div class="flex flex-col gap-y-2">
            <span>Name: {reserve.erc20name}</span>
            <span>Symbol: {reserve.erc20symbol}</span>
            <span>
              Total supply: {formatUnits(
                reserve.erc20totalSupply,
                reserve.erc20decimals.toString()
              )}
            </span>
            <span>
              Your balance: {formatUnits(
                reserve.erc20balance,
                reserve.erc20decimals.toString()
              )}
            </span>
          </div>
        </FormPanel>
      </div>
      <Buy {sale} {token} {reserve} />
    {/await}
    {#if sale}
      <FormPanel>
        <MyTransactions saleContract={sale} />
      </FormPanel>
    {/if}
  {/if}
</div>
