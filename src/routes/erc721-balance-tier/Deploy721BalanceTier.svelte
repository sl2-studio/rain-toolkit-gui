<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import Input from "../../components/Input.svelte";
  import { BigNumber, ethers } from "ethers";
  import FormPanel from "../../components/FormPanel.svelte";
  import Button from "../../components/Button.svelte";
  import ContractDeploy from "src/components/ContractDeploy.svelte";
  import { ERC721BalanceTier, ERC721, CombineTier } from "rain-sdk";

  let deployPromise;
  let erc721Address: string | undefined,
    erc721Contract,
    erc721AddressError: string | null,
    erc721Balance: BigNumber,
    erc721Name: string,
    erc721Symbol: string;
  let tiers = [] as string[];

  $: if (erc721Address) {
    getERC721();
  }

  const getERC721 = async () => {
    if (erc721Address && ethers.utils.isAddress(erc721Address)) {
      erc721AddressError = null;

      erc721Contract = new ERC721(erc721Address, $signer);

      try {
        erc721Name = await erc721Contract.name();
      } catch {}
      try {
        erc721Balance = await erc721Contract.balanceOf($signerAddress);
      } catch (error) {
        erc721AddressError = "not a valid ERC721 token address";
      }
    } else {
      erc721AddressError = "not a valid address";
    }
  };

  const deployBalanceTier = async () => {
    if (erc721Contract) {
      const parsedTiers = tiers.map((value) =>
        value ? BigNumber.from(value) : ethers.constants.MaxInt256
      );

      let stateConfig = new ERC721BalanceTier(tiers, erc721Contract.address);

      let newERC721BalanceTier = await CombineTier.deploy($signer, {
        combinedTiersLength: 1,
        sourceConfig: stateConfig,
      });

      return newERC721BalanceTier;
    }
  };

  const handleClick = () => {
    deployPromise = deployBalanceTier();
  };
</script>

<div class="flex max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl">Deploy a new BalanceTier.</span>
    <span class="text-gray-400">
      Create Tier statuses corresponding to holding at least a certain amount of
      an ERC721.
    </span>
  </div>
  <FormPanel heading="BalanceTier settings">
    <Input
      type="address"
      placeholder="Token address"
      bind:value={erc721Address}
    >
      <span slot="label">Choose an ERC721 token to check the balance of.</span>
      <span slot="description">
        {#if erc721AddressError}
          <span class="text-red-500">{erc721AddressError}</span>
        {:else if erc721Name && erc721Balance}
          <div class="flex flex-col gap-y-2 font-light text-gray-300">
            <span>Token name: {erc721Name}</span>
            <span>Your balance: {erc721Balance.toString()}</span>
          </div>
        {/if}
      </span>
    </Input>
    <div class="flex w-full flex-col gap-y-3">
      <Input type="number" placeholder="Tier 1" bind:value={tiers[0]}>
        <span slot="label">
          Set the amount of token that must be held for each of the tiers.
        </span>
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
    {#if !deployPromise}
      <Button shrink on:click={handleClick}>Deploy BalanceTier</Button>
    {:else}
      <ContractDeploy {deployPromise} type="ERC721BalanceTier" />
    {/if}
  </FormPanel>
</div>
