<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import Input from "../../components/Input.svelte";
  import { erc721BalanceTierFactory } from "../../stores";
  import { BigNumber, Contract, ContractReceipt, ethers } from "ethers";
  import FormPanel from "../../components/FormPanel.svelte";
  import Button from "../../components/Button.svelte";
  import { getNewChildFromReceipt } from "../../utils";
  import { BLOCK_EXPLORER } from "../../constants";
  import ERC20Artifact from "../../abis/ERC721.json";

  let balanceTierAddress: string,
    deployPromise: null | Promise<ContractReceipt | undefined>;
  let erc721Address: string | undefined,
    erc721Contract: Contract | null,
    erc721AddressError: string | null,
    erc721Balance: BigNumber,
    erc721Name: string,
    erc721Symbol: string;
  let tiers = [] as string[];
  $: console.log(tiers);

  $: if (erc721Address) {
    getERC721();
  }

  console.log(erc721BalanceTierFactory);

  const getERC721 = async () => {
    if (erc721Address && ethers.utils.isAddress(erc721Address)) {
      erc721AddressError = null;
      erc721Contract = new ethers.Contract(erc721Address, ERC20Artifact.abi);
      console.log($signer);
      erc721Contract = erc721Contract.connect($signer);
      console.log(erc721Contract);
      try {
        erc721Name = await erc721Contract.name();
        erc721Balance = await erc721Contract.balanceOf($signerAddress);
      } catch (error) {
        console.log(error);
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
      let tx = await $erc721BalanceTierFactory[
        "createChildTyped((address,uint256[8]))"
      ]([erc721Contract.address, parsedTiers]);
      const receipt = (await tx.wait()) as ContractReceipt;
      if (receipt?.events) {
        receipt.events.forEach((event) => {
          if (event.event == "NewChild") {
            balanceTierAddress = ethers.utils.defaultAbiCoder.decode(
              ["address", "address"],
              event.data
            )[1];
          }
        });
      }
      return receipt;
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
    <Input type="text" placeholder="Token address" bind:value={erc721Address}>
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

    <Button shrink on:click={handleClick}>Deploy BalanceTier</Button>
    <div class="mt-1 flex flex-col gap-y-2 text-blue-400">
      {#if deployPromise}
        {#await deployPromise}
          <span>Deploying...</span>
        {:then receipt}
          <span>
            New BalanceTier deployed at:
            <a
              target="_blank"
              href={`${BLOCK_EXPLORER}/address/${balanceTierAddress}`}
            >
              {balanceTierAddress}
            </a>
          </span>
          <span>
            <a
              target="_blank"
              class="underline"
              href={`${BLOCK_EXPLORER}/tx/${receipt?.transactionHash}`}
            >
              See transaction.
            </a>
          </span>
        {/await}
      {/if}
    </div>
  </FormPanel>
</div>
