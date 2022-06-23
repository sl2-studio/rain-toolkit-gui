<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Button from "../../components/Button.svelte";
  import { tierReport } from "../../utils";
  import { push } from "svelte-spa-router";
  import { operationStore, query } from "@urql/svelte";
  import { ERC20TransferTier, ERC20 } from "rain-sdk";
  import SetTransferTier from "./SetTransferTier.svelte";
  import { getContext } from "svelte";
  import TransferTierHistory from "./TransferTierHistory.svelte";

  const { open } = getContext("simple-modal");

  export let params;

  let transferTierContract,
    erc20Contract,
    errorMsg,
    addressToReport,
    parsedReport,
    addressBalance,
    transferTierAddress,
    currentTier;

  const transferTier = operationStore(
    `
query ($transferTierAddress: Bytes!) {
  erc20TransferTiers (where: {id: $transferTierAddress}) {
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
    tierLevels{
      id
      tierLevel
      memberCount
  }
  }
}
`,
    { transferTierAddress },
    {
      pause: true,
      requestPolicy: "network-only",
    }
  );

  query(transferTier);

  $: if (params.wild) {
    runQuery();
  }
  const runQuery = () => {
    $transferTier.variables.transferTierAddress = params.wild.toLowerCase();
    $transferTier.context.pause = false;
    $transferTier.reexecute();
  };

  $: _transferTier = $transferTier.data?.erc20TransferTiers[0];

  $: if (_transferTier) {
    initContracts();
    reportMyAddress();
  }

  const initContracts = async () => {
    transferTierContract = new ERC20TransferTier(
      _transferTier.address,
      $signer,
      _transferTier.token.id
    );

    erc20Contract = new ERC20(_transferTier.token.id, $signer);

    currentTier = await transferTierContract.currentTier(
      $signerAddress || (await this.signer.getAddress())
    );
  };

  const report = async () => {
    if (ethers.utils.isAddress(addressToReport)) {
      const report = await transferTierContract.report(addressToReport);
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
    <span class="text-2xl"> Get a TransferTier report. </span>
    <span class="text-gray-400">
      TransferTier checks the amount of a specific ERC20 held in a wallet.
    </span>
    {#if !params.wild}
      <span class="text-gray-400">
        Enter a TransferTier contract address below, or <span
          class="cursor-pointer underline"
          on:click={() => {
            push("/erc20transfertier/list");
          }}>browse all deployed TransferTier contracts.</span
        >
      </span>
    {/if}
  </div>
  {#if !$transferTier.fetching && !$transferTier.error && $transferTier.data}
    <FormPanel heading="Get a report on an address">
      <Input
        bind:value={addressToReport}
        type="text"
        placeholder="Enter an Ethereum address"
      />
      <div class="flex flex-row gap-x-2">
        <Button shrink on:click={report}>Get a report</Button>
      </div>
      <div class="flex flex-col gap-y-2">
        {#if addressBalance}
          <span
            >Balance for {addressToReport}: {ethers.utils.formatUnits(
              addressBalance,
              _transferTier.token.decimals
            )}
            {_transferTier.token.symbol}</span
          >
        {/if}
        <span class="gap-y-1 text-lg">
          Token values for this TransferTier:
        </span>
        {#each _transferTier.tierValues as value, i}
          <span class="text-gray-400">
            Tier {i + 1} : {ethers.utils.formatUnits(
              value,
              _transferTier.token.decimals
            )}
            {#if parsedReport?.[i] != "0xffffffff"}
              ✅
            {:else if parsedReport?.[i] == "0xffffffff"}
              ❌
            {/if}
          </span>
        {/each}
      </div>
    </FormPanel>
    <FormPanel heading="ERC20 used for this TransferTier">
      <div class="mb-4 flex flex-col gap-y-2">
        <div class="flex flex-col text-gray-400">
          <span>Name: {_transferTier?.token.name}</span>
          <span>Symbol: {_transferTier?.token.symbol}</span>
          <span>Address: {_transferTier?.token.id}</span>
        </div>
      </div>
      <div class="flex w-full gap-x-2 self-stretch">
        <div class="w-1/2">
          <span class="gap-y-1 text-lg">
            Token values for this TransferTier:
          </span>
          {#each _transferTier.tierValues as value, i}
            <div class="text-gray-400">
              Tier {i + 1} : {ethers.utils.formatUnits(
                value,
                _transferTier.token.decimals
              )}
            </div>
          {/each}
        </div>
        <div class="w-1/2">
          <div class="gap-y-1 text-lg">Total members with each tier:</div>
          {#each _transferTier.tierLevels as value}
            <div class="text-gray-400">
              {#if value.tierLevel !== "0"}
                Tier {value.tierLevel} : {value.memberCount === "1"
                  ? value.memberCount + " member"
                  : value.memberCount + " members"}
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </FormPanel>

    <FormPanel heading="Set the Tier">
      <Button
        on:click={() => {
          open(SetTransferTier, {
            transferTierContract,
            erc20Contract,
            currentTier,
          });
        }}>Update the Tier</Button
      >
    </FormPanel>

    <FormPanel>
      <TransferTierHistory tierAddress={transferTierContract.address} />
    </FormPanel>
  {:else if errorMsg}
    <span class="text-red-400">{errorMsg}</span>
  {:else if !params.wild}
    <FormPanel>
      <Input
        bind:value={transferTierAddress}
        type="address"
        placeholder="Contract address"
      />
      <Button
        on:click={() => {
          push(`/erc20transfertier/report/${transferTierAddress}`);
        }}
      >
        Load
      </Button>
    </FormPanel>
  {/if}
</div>
