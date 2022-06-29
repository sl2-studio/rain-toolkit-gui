<script lang="ts" type="module">
  import { signer, signerAddress } from "svelte-ethers-store";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import { addressValidate } from "../../validation";
  import Select from "../../components/Select.svelte";
  import ContractDeploy from "src/components/ContractDeploy.svelte";
  import { CombineTier, CombineTierGenerator } from "rain-sdk";
  import { selectLteLogic, selectLteMode } from "../../utils";
  import HumanReadable from "../../components/FriendlySource/HumanReadable.svelte";

  let tierContractOne: string = "0x6ba1fadb694e806c316337143241dd6cfebd5033",
    tierContractTwo: string = "0xb2b600aeae9bc1efd68ae209e621b7546393ef28",
    deployPromise: any;

  const logicOptions = [
    { value: selectLteLogic.every, label: "Every" },
    { value: selectLteLogic.any, label: "Any" },
  ];

  const modeOptions = [
    { value: selectLteMode.min, label: "Min" },
    { value: selectLteMode.max, label: "Max" },
    { value: selectLteMode.first, label: "First" },
  ];

  let logicValue: { value: selectLteLogic; label: string },
    modeValue: { value: selectLteMode; label: string };

  $: FriendlySource = {
    tierContractOne,
    tierContractTwo,
    logicValue: logicValue ? logicValue.value : selectLteLogic.every,
    modeValue: modeValue ? modeValue.value : selectLteMode.min,
  };

  const deployCombineTier = async () => {
    const combineTierConfig = new CombineTierGenerator(
      tierContractOne
    ).combineWith(tierContractTwo, logicValue.value, modeValue.value);
    const newCombineTier = await CombineTier.deploy($signer, combineTierConfig);

    return newCombineTier;
  };

  const handleClick = () => {
    deployPromise = deployCombineTier();
  };
</script>

<div class="flex w-full gap-x-3">
  <div class="flex w-3/5 flex-col gap-y-4">
    <div class="mb-2 flex flex-col gap-y-2">
      <span class="text-2xl">Deploy a new CombineTier.</span>
      <span class="text-gray-400">
        Choose two Tier contracts and combine them to produce a new Tier
        contract.
      </span>
    </div>
    <FormPanel heading="CombineTier settings">
      <Input
        type="address"
        placeholder="Tier address"
        bind:value={tierContractOne}
        validator={addressValidate}
      >
        <span slot="label">Tier contract #1</span>
      </Input>

      <Input
        type="address"
        placeholder="Tier address"
        bind:value={tierContractTwo}
        validator={addressValidate}
      >
        <span slot="label">Tier contract #2</span>
      </Input>

      <Select items={logicOptions} bind:value={logicValue}>
        <span slot="label">
          To qualify for a certain status, does an address need to have that
          status in both tiers, or either tier?
        </span>
        <span slot="description">
          i.e. Tier 1 AND Tier 2, or Tier 1 OR Tier 2.
        </span>
      </Select>

      <Select items={modeOptions} bind:value={modeValue}>
        <span slot="label">
          If an address qualifies for a status, which block should be used for
          the new report?
        </span>
        <span slot="description">
          Some Tiers store the block that an address gained a certain status.
          Here you can select which Tiers blocks should be used, the earliest
          block they qualified, the latest block, or the block from the first of
          the two Tiers specified.
        </span>
      </Select>
    </FormPanel>
    <FormPanel>
      {#if !deployPromise}
        <Button shrink on:click={handleClick}>Deploy CombineTier</Button>
      {:else}
        <ContractDeploy {deployPromise} type="CombineTier" />
      {/if}
    </FormPanel>
  </div>
  <div class="flex w-2/5 flex-col gap-y-4">
    {#if FriendlySource}
      <span class="sticky">
        <FormPanel heading="Human Readable Source">
          <HumanReadable
            signer={$signerAddress}
            contractType="combineTier"
            {FriendlySource}
          />
        </FormPanel>
      </span>
    {/if}
  </div>
</div>

<style>
  span.sticky {
    margin-top: 83px;
    float: right;
    position: sticky;
    top: 90px;
    padding: 5px;
  }
  .text {
    white-space: break-spaces;
  }
</style>
