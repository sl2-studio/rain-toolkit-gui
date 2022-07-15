<script lang="ts">
  import { ethers, providers } from "ethers";
  import { formatUnits } from "ethers/lib/utils";
  import { signer, signerAddress, provider } from "svelte-ethers-store";
  import { push } from "svelte-spa-router";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import TokenInfo from "../sale/TokenInfo.svelte";
  import { EmissionsERC20 } from "rain-sdk";
  import { tierReport } from "../../utils";
  import { getERC20 } from "src/utils";
  import { queryStore } from "@urql/svelte";
  import { client } from "src/stores";
  import { selectedNetwork } from "src/stores";

  export let params: {
    wild: string;
  };

  let erc20Contract, token;
  let errorMsg, erc20Address;
  let showMint, showClaim, isFaucet;
  let initPromise,
    calcMintPromise,
    mintPromise,
    calcClaimPromise,
    claimPromise,
    emissionAddress;
  let currentBlockNumber,
    claimedBlockNumber,
    parsedReport,
    claimableBlockNumber;
  let claimantAddress = $signerAddress;

  $: if (params.wild || $signer) {
    initPromise = initContract();
    emissionAddress = params.wild;
  }

  $: emissionQuery = queryStore({
    client: $client,
    query: `
        query($emissionAddress: Bytes!){
          emissionsERC20(id : $emissionAddress) {
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
              block
              timestamp
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
    variables: { emissionAddress },
    requestPolicy: "network-only",
  });

  $: emission =
    !$emissionQuery?.fetching && $emissionQuery?.data?.emissionsERC20
      ? $emissionQuery.data.emissionsERC20
      : undefined;

  const faucetData = async () => {
    currentBlockNumber = await $signer.provider.getBlockNumber();
    claimedBlockNumber = parsedReport[0];

    isFaucet =
      emission?.calculateClaimStateConfig.sources[0] ===
      "0x01002e001d0001010102050008002e0022000104160213021f00240001031c001c00";

    claimableBlockNumber =
      parseInt(claimedBlockNumber) +
      parseInt(emission.calculateClaimStateConfig.constants[2]);
  };

  const initContract = async () => {
    if (ethers.utils.isAddress(params.wild || "")) {
      erc20Contract = new EmissionsERC20(params.wild, $signer);
      token = await getERC20(params.wild, $signer, $signerAddress);
      const report = await erc20Contract.report($signerAddress);
      parsedReport = tierReport(report);
      faucetData();
    } else if (params.wild) {
      errorMsg = "Not a valid contract address";
    }
  };

  const calculateClaim = async () => {
    const claim = await erc20Contract.calculateClaim(claimantAddress);

    if (!isFaucet) {
      showMint = !showMint;
    } else {
      showClaim = !showClaim;
    }
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
      <span class="text-gray-400">Enter the ERC20 address below</span>
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
                disabled={isFaucet}
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
                Mintable amount will be {formatUnits(
                  claim,
                  token.erc20decimals
                )}
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

        {#if isFaucet}
          <FormPanel heading="Claim your Faucet">
            {#if !showClaim}
              <Input
                type="address"
                placeholder="Name"
                bind:value={claimantAddress}
              >
                <span slot="label">Claimant Address</span>
              </Input>
              <Button
                on:click={() => {
                  calcClaimPromise = calculateClaim();
                }}
              >
                Show
              </Button>
            {/if}

            {#if calcClaimPromise}
              {#if claimableBlockNumber >= parseInt(currentBlockNumber)}
                <span class="text-red-400"
                  >You will not be able to make another claim until block
                  <a
                    class="text-blue-400 underline"
                    target="_blank"
                    href={`${$selectedNetwork.blockExplorer}/block/${claimableBlockNumber}`}
                  >
                    {claimableBlockNumber}
                  </a>.
                </span>
                <span class="text-red-400">
                  You have to wait till
                  <span class="text-white"
                    >{claimableBlockNumber - currentBlockNumber}</span
                  > blocks</span
                >
              {:else}
                <div>
                  {#await calcClaimPromise}
                    Getting eligible mint...
                  {:then claim}
                    Mintable amount will be {formatUnits(
                      claim,
                      token.erc20decimals
                    )}
                    {token.erc20symbol}
                  {:catch err}
                    <span class="text-lg text-red-400">{err.error.message}</span
                    >
                  {/await}
                </div>
              {/if}
            {/if}

            {#if showClaim && !(claimableBlockNumber >= parseInt(currentBlockNumber))}
              <Button
                shrink
                on:click={() => {
                  claimPromise = claim();
                }}>Claim</Button
              >
              {#if claimPromise}
                {#await claimPromise}
                  Minting...
                {:then}
                  Mint complete! Refresh to see your new balance.
                {/await}
              {/if}
            {/if}
          </FormPanel>
        {/if}
      {/if}
    {/await}
  {/if}
</div>
