<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import Input from "../../components/Input.svelte";
  import { ethers } from "ethers";
  import FormPanel from "../../components/FormPanel.svelte";
  import Button from "../../components/Button.svelte";
  import ContractDeploy from "src/components/ContractDeploy.svelte";
  import { ERC20TransferTier, ERC20 } from "rain-sdk";

  let erc20Address,
    erc20AddressError,
    erc20Contract,
    erc20name,
    erc20symbol,
    erc20balance,
    erc20decimals;
  let deployPromise;
  let tiers = [];
  tiers[0] = 0;

  $: if (erc20Address) {
    getERC20();
  }

  const getERC20 = async () => {
    if (ethers.utils.isAddress(erc20Address)) {
      erc20AddressError = null;

      erc20Contract = new ERC20(erc20Address, $signer);

      try {
        erc20name = await erc20Contract.name();
        erc20balance = await erc20Contract.balanceOf($signerAddress);
        erc20decimals = await erc20Contract.decimals();
      } catch {
        erc20AddressError = "not a valid ERC20 token address";
      }
    } else {
      erc20AddressError = "not a valid address";
    }
  };

  const deployTransferTier = async () => {
    const parsedTiers = tiers.map((value) =>
      value
        ? ethers.utils.parseUnits(value.toString(), erc20decimals)
        : ethers.constants.MaxInt256
    );

    let newBalanceTier = await ERC20TransferTier.deploy($signer, {
      erc20: erc20Contract.address,
      tierValues: parsedTiers,
    });

    return newBalanceTier;
  };

  const handleClick = () => {
    deployPromise = deployTransferTier();
  };
</script>

<div class="flex max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl"> Deploy a new TransferTier. </span>
    <span class="text-gray-400">
      Create Tier statuses corresponding to holding at least a certain amount of
      an ERC20.
    </span>
  </div>
  <FormPanel heading="TransferTier settings">
    <Input type="address" placeholder="Token address" bind:value={erc20Address}>
      <span slot="label">Choose an ERC20 token to check the balance of.</span>
      <span slot="description">
        {#if erc20AddressError}
          <span class="text-red-500">
            {erc20AddressError}
          </span>
        {:else if erc20name && erc20balance}
          <div class="flex flex-col gap-y-2 font-light text-gray-300">
            <span>Token name: {erc20name}</span>
            <span>Token symbol: {erc20symbol}</span>
            <span>Your balance: {erc20balance.toString()}</span>
          </div>
        {/if}
      </span>
    </Input>
    <div class="flex w-full flex-col gap-y-3">
      <Input type="number" placeholder="Tier 1" bind:value={tiers[0]}>
        <span slot="label"
          >Set the amount of token that must be held for each of the tiers.</span
        >
      </Input>
      <Input type="number" placeholder="Tier 2" bind:value={tiers[1]} />
      <Input type="number" placeholder="Tier 3" bind:value={tiers[2]} />
      <Input type="number" placeholder="Tier 4" bind:value={tiers[3]} />
      <Input type="number" placeholder="Tier 5" bind:value={tiers[4]} />
      <Input type="number" placeholder="Tier 6" bind:value={tiers[5]} />
      <Input type="number" placeholder="Tier 7" bind:value={tiers[6]} />
      <Input type="number" placeholder="Tier 8" bind:value={tiers[7]} />
    </div>
  </FormPanel>
  <FormPanel>
    <div class="mt-1 flex flex-col gap-y-2">
      {#if !deployPromise}
        <Button shrink on:click={handleClick}>Deploy TransferTier</Button>
      {:else}
        <ContractDeploy {deployPromise} type="ERC20TransferTier" />
      {/if}
    </div>
  </FormPanel>
</div>
