<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import FormPanel from "../../components/FormPanel.svelte";
  import BalanceTierAbi from "../../abis/ERC20BalanceTier.json";
  import ERC20Abi from "../../abis/ReserveToken.json";
  import Input from "../../components/Input.svelte";
  import Button from "../../components/Button.svelte";
  import { tierReport } from "../../utils";
  import { push } from "svelte-spa-router";
  import { operationStore, query } from "@urql/svelte";
  import { ERC20BalanceTier, ERC20 } from "rain-sdk";

  export let params;

  let balanceTierContract,
    erc20Contract,
    errorMsg,
    addressToReport,
    parsedReport,
    addressBalance,
    balanceTierAddress;

  const balanceTier = operationStore(
    `
query ($balanceTierAddress: Bytes!) {
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
}
`,
    { balanceTierAddress },
    {
      pause: true,
      requestPolicy: "network-only",
    }
  );

  query(balanceTier);

  $: if (params.wild) {
    runQuery();
  }
  const runQuery = () => {
    $balanceTier.variables.balanceTierAddress = params.wild.toLowerCase();
    $balanceTier.context.pause = false;
    $balanceTier.reexecute();
  };

  $: _balanceTier = $balanceTier.data?.erc20BalanceTiers[0];

  $: if (_balanceTier) {
    initContracts();
  }

  const initContracts = async () => {
    balanceTierContract = new ERC20BalanceTier(
      _balanceTier.address,
      _balanceTier.token.id,
      $signer
    );

    erc20Contract = new ERC20(_balanceTier.token.id, $signer);
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
        {#each _balanceTier.tierValues as value, i}
          <span class="text-gray-400">
            Tier {i + 1}: {ethers.utils.formatUnits(
              value,
              _balanceTier.token.decimals
            )}
            {#if parsedReport?.[i] == 0}
              ✅
            {:else if parsedReport?.[i] > 0}
              ❌
            {/if}
          </span>
        {/each}
      </div>
      {#if addressBalance}
        <span
          >Balance for {addressToReport}: {ethers.utils.formatUnits(
            addressBalance,
            _balanceTier.token.decimals
          )}
          {_balanceTier.token.symbol}</span
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
