<script lang="ts">
  import { ethers } from "ethers";
  import { formatUnits } from "ethers/lib/utils";
  import { signer, signerAddress } from "svelte-ethers-store";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import TokenInfo from "../sale/TokenInfo.svelte";
  import { EmissionsERC20 } from "rain-sdk";
  import { getERC20 } from "src/utils";

  export let params: {
    wild: string;
  };

  let erc20Contract, token;
  let errorMsg, erc20Address;
  let showMint;
  let initPromise, calcMintPromise, mintPromise;

  $: if (params.wild || $signer) {
    initPromise = initContract();
  }

  const initContract = async () => {
    if (ethers.utils.isAddress(params.wild || "")) {
      erc20Contract = new EmissionsERC20(params.wild, $signer);
      token = await getERC20(params.wild, $signer, $signerAddress);
    } else if (params.wild) {
      errorMsg = "Not a valid contract address";
    }
  };

  const calculateClaim = async () => {
    const claim = await erc20Contract.calculateClaim($signerAddress);
    showMint = !showMint;
    return claim;
  };

  const claim = async () => {
    const tx = await erc20Contract.claim(
      $signerAddress,
      ethers.constants.AddressZero
    );
    return await tx.wait();
  };
</script>

<div class="flex w-full max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl">Mint from an already deployed ERC20 token</span>
  </div>

  {#if !params.wild}
    <FormPanel>
      <span class="text-gray-400"
        >Enter the ERC20 address below</span
      >
      <Input
        bind:value={erc20Address}
        type="address"
        placeholder="Contract address"
        >
        <span slot="description">Only the owner of the token can mint</span>
      </Input>
      <Button
        on:click={() => {
          push(`/erc20/mint/${erc20Address}`);
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
      {#if token}
        <FormPanel heading="ERC20 Token Details">
          <TokenInfo
            tokenData={{
              name: token.erc20name,
              symbol: token.erc20symbol,
              decimals: token.erc20decimals,
              id: erc20Contract.address,
              totalSupply: token.erc20totalSupply,
            }}
          />
        </FormPanel>

        <FormPanel heading="Mint">
          {#if !showMint}
            <div class="flex flex-col gap-y-4">
              <span class="text-gray-400"
                >Show mintable amount for {$signerAddress}</span
              >
              <Button
                on:click={() => {
                  calcMintPromise = calculateClaim();
                }}
              >
                Show
              </Button>
            </div>
          {/if}
          {#if calcMintPromise}
            <div>
              {#await calcMintPromise}
                Getting eligible mint...
              {:then claim}
                Mintable amount will be {formatUnits(claim, token.erc20decimals)}
                {token.erc20symbol}
              {:catch err}
                <span class="text-lg text-red-400">{err.error.message}</span>
              {/await}
            </div>
          {/if}

          {#if showMint}
            <Button
              shrink
              on:click={() => {
                mintPromise = claim();
              }}>Mint</Button
            >
            {#if mintPromise}
              {#await mintPromise}
                Minting...
              {:then}
                Mint complete! Refresh to see your new balance.
              {/await}
            {/if}
          {/if}
        </FormPanel>
      {/if}
    {/await}
  {/if}
</div>
