<script lang="ts">
  import { BigNumber, ethers } from "ethers";
  import { formatUnits, parseUnits } from "ethers/lib/utils";
  import { signer, signerAddress } from "svelte-ethers-store";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import { initEmissions } from "./emissions";

  export let params: {
    wild: string;
  };

  let emissionsContract, token;
  let errorMsg, emissionsAddress;
  let showClaim;
  let initPromise, calcClaimPromsie, claimPromise;

  $: if (params.wild) {
    initPromise = initContract();
  }

  const initContract = async () => {
    if (ethers.utils.isAddress(params.wild || "")) {
      [emissionsContract, token] = await initEmissions($signer, params.wild);
    } else if (params.wild) {
      errorMsg = "Not a valid contract address";
    }
  };

  const calculateClaim = async () => {
    const claim = await emissionsContract.calculateClaim($signerAddress);
    showClaim = !showClaim;
    return claim;
  };

  const claim = async () => {
    const tx = await emissionsContract.claim(
      $signerAddress,
      ethers.constants.AddressZero
    );
    return await tx.wait();
  };
</script>

<div class="flex w-full max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl">Claim emissions from a deployed EmissionsERC20</span>
  </div>

  {#if !params.wild}
    <FormPanel>
      <span class="text-gray-400"
        >Enter an EmissionsERC20 contract address below.</span
      >
      <Input
        bind:value={emissionsAddress}
        type="string"
        placeholder="Contract address"
      />
      <Button
        on:click={() => {
          push(`/emissions/claim/${emissionsAddress}`);
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

      <FormPanel heading="Claim">
        {#if !showClaim}
          <div class="flex flex-col gap-y-4">
            <span class="text-gray-400"
              >Calculate claim for {$signerAddress}</span
            >
            <Button
              on:click={() => {
                calcClaimPromsie = calculateClaim();
              }}
            >
              Calculate
            </Button>
          </div>
        {/if}
        {#if calcClaimPromsie}
          <div>
            {#await calcClaimPromsie}
              Getting eligible claim...
            {:then claim}
              Your claim will be {formatUnits(claim, token.erc20decimals)}
              {token.erc20symbol}
            {/await}
          </div>
        {/if}

        {#if showClaim}
          <Button
            shrink
            on:click={() => {
              claimPromise = claim();
            }}>Claim</Button
          >
          {#if claimPromise}
            {#await claimPromise}
              Claiming...
            {:then}
              Claim complete! Refresh to see your new balance.
            {/await}
          {/if}
        {/if}
      </FormPanel>
    {/await}
  {/if}
</div>
