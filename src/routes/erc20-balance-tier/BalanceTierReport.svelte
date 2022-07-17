<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Button from "../../components/Button.svelte";
  import { tierReport } from "../../utils";
  import { push } from "svelte-spa-router";
  import { queryStore } from "@urql/svelte";
  import { client } from "src/stores";
  import { ERC20BalanceTier, ERC20, CombineTier } from "rain-sdk";

  export let params;

  let balanceTierContract,
    erc20Contract,
    errorMsg,
    addressToReport,
    parsedReport,
    addressBalance;

  let balanceTierAddress = params.wild ? params.wild.toLowerCase() : undefined;

  $: balanceTier = queryStore({
    client: $client,
    query: `query ($balanceTierAddress: Bytes!) {
          erc20BalanceTiers (where: {id: $balanceTierAddress}) {
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
        }`,
    variables: { balanceTierAddress },
    requestPolicy: "network-only",
    pause: params.wild ? false : true,
  });

  $: _balanceTier = $balanceTier.data?.erc20BalanceTiers[0];

  $: if (_balanceTier || $signer) {
    if (!$balanceTier.fetching && _balanceTier != undefined) {
      initContracts();
    }
  }

  const initContracts = async () => {
    balanceTierContract = new CombineTier(_balanceTier?.address, $signer);
    // balanceTierContract = new ERC20BalanceTier(
    //   _balanceTier?.address,
    //   $signer,
    //   _balanceTier?.token.id
    // );

    erc20Contract = new ERC20(_balanceTier?.token.id, $signer);
  };

  const report = async () => {
    if (ethers.utils.isAddress(addressToReport)) {
      const report = await balanceTierContract.report(addressToReport);
      parsedReport = tierReport(report);
      addressBalance = await erc20Contract.balanceOf(addressToReport);
    } else {
      errorMsg = "Not a valid Ethereum address";
    }
  };

  const reportMyAddress = () => {
    addressToReport = $signerAddress;
    report();
  };
</script>

<div class="flex w-full max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl"> Get a BalanceTier report. </span>
    <span class="text-gray-400">
      BalanceTier checks the amount of a specific ERC20 held in a wallet.
    </span>
    {#if !params.wild}
      <span class="text-gray-400">
        Enter a BalanceTier contract address below, or <span
          class="cursor-pointer underline"
          on:click={() => {
            push("/erc20balancetier/list");
          }}>browse all deployed BalanceTier contracts.</span
        >
      </span>
    {/if}
  </div>
  {#if !$balanceTier.fetching && !$balanceTier.error && $balanceTier.data}
    <FormPanel heading="ERC20 used for this BalanceTier">
      <div class="mb-4 flex flex-col gap-y-2">
        <div class="flex flex-col text-gray-400">
          <span>Name: {_balanceTier?.token.name}</span>
          <span>Symbol: {_balanceTier?.token.symbol}</span>
          <span>Address: {_balanceTier?.token.id}</span>
        </div>
      </div>
    </FormPanel>
    <FormPanel heading="Get a report on an address">
      <Input
        bind:value={addressToReport}
        type="text"
        placeholder="Enter an Ethereum address"
      />
      <div class="flex flex-row gap-x-2">
        <Button shrink on:click={report}>Get a report</Button>
        <Button shrink on:click={reportMyAddress}>Report my address</Button>
      </div>
      <div class="flex flex-col gap-y-2">
        <span class="text-lg">Token values for this BalanceTier:</span>
        {#if _balanceTier && _balanceTier?.tierValues.length}
          {#each _balanceTier?.tierValues as value, i}
            <span class="text-gray-400">
              Tier {i + 1}: {ethers.utils.formatUnits(
                value,
                _balanceTier?.token.decimals
              )}
              {#if parsedReport?.[i] == 0}
                ✅
              {:else if parsedReport?.[i] > 0}
                ❌
              {/if}
            </span>
          {/each}
        {/if}
      </div>
      {#if addressBalance}
        <span
          >{addressToReport} Balance: {ethers.utils.formatUnits(
            addressBalance,
            _balanceTier?.token.decimals
          )}
          {_balanceTier?.token.symbol}</span
        >
      {/if}
    </FormPanel>
  {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
  {:else if !params.wild}
    <FormPanel>
      <Input
        bind:value={balanceTierAddress}
        type="address"
        placeholder="Contract address"
      />
      <Button
        on:click={() => {
          push(`/erc20balancetier/report/${balanceTierAddress}`);
        }}
      >
        Load
      </Button>
    </FormPanel>
  {/if}
</div>
