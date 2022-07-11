<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Select from "../../components/Select.svelte";
  import { validateFields } from "../../utils";
  import { addressValidate } from "../../validation";
  import ContractDeploy from "src/components/ContractDeploy.svelte";
  import HumanReadable from "../../components/FriendlySource/HumanReadable.svelte";
  import EmissionSmallSimulationChart from "./EmissionSmallSimulationChart.svelte";
  import {
    EmissionsERC20,
    ERC20Config,
    StateConfig,
    EmissionsERC20DeployArgs,
    EmissionsConfig,
    LinearEmissions,
    SequentialEmissions,
  } from "rain-sdk";
  
  let deployPromise;

  let fields: any = {};

  const emissionsOptions = [
    { value: 0, label: "Linear" },
    { value: 1, label: "Sequential" },
  ];

  // some default values for testing
  let emissionsType: { value: number; label: string } = null;

  let tier = "0xf6CF014a3e92f214a3332F0d379aD32bf0Fae929";
  let erc20name = "EmissionsTKN";
  let erc20symbol = "eTKN";

  let tierAddress = "0x1b044f69674c47ab19475cbb57d4d7673f6ccd6c";
  let blockTime = 2;
  let period = 60 * 60 * 24 * 30; // one month in seconds
  let numberOfIncrements = 6;
  let ownerAddress = $signerAddress;
  let initSupply = 0;
  let FriendlySource;
  let NumberOfIc;
  let BlockTime;
  let Period;

  let tier1 = 10,
    tier2 = 20,
    tier3 = 50,
    tier4 = 100,
    tier5 = 200,
    tier6 = 400,
    tier7 = 800,
    tier8 = 1600;

  let maxTier1 = 20,
    maxTier2 = 40,
    maxTier3 = 100,
    maxTier4 = 200,
    maxTier5 = 400,
    maxTier6 = 800,
    maxTier7 = 1600,
    maxTier8 = 3200;

  // @TODO write validators
  const defaultValidator = () => {
    return true;
  };

  $:{ 
    NumberOfIc = numberOfIncrements && numberOfIncrements > 2 ? numberOfIncrements : 3;
    BlockTime = blockTime ? blockTime : 2;
    Period = period >= BlockTime ? period : BlockTime;
    FriendlySource = {
      tierAddress,
      blockTime: BlockTime,
      period: Period,
      numberOfIncrements: NumberOfIc,
      ownerAddress,
      initSupply,
      tier1,
      tier2,
      tier3,
      tier4,
      tier5,
      tier6,
      tier7,
      tier8,
      maxTier1,
      maxTier2,
      maxTier3,
      maxTier4,
      maxTier5,
      maxTier6,
      maxTier7,
      maxTier8,
      emissionsType,
    }
  };

  const deployEmissions = async () => {
    const { validationResult, fieldValues } = validateFields(fields);

    // GET THE SOURCE

    let newEmissionsERC20;

    if (validationResult) {
      let emissionsConfig: EmissionsConfig = emissionsType.value
        ? {
            tierAddress: fieldValues.tierAddress,
            blockTime: fieldValues.blockTime,
            period: fieldValues.period,
            periodicRewards: {
              tier1: fieldValues.tier1,
              tier2: fieldValues.tier2,
              tier3: fieldValues.tier3,
              tier4: fieldValues.tier4,
              tier5: fieldValues.tier6,
              tier6: fieldValues.tier6,
              tier7: fieldValues.tier7,
              tier8: fieldValues.tier8,
            },
            maxPeriodicRewards: {
              tier1: fieldValues.maxTier1,
              tier2: fieldValues.maxTier2,
              tier3: fieldValues.maxTier3,
              tier4: fieldValues.maxTier4,
              tier5: fieldValues.maxTier6,
              tier6: fieldValues.maxTier6,
              tier7: fieldValues.maxTier7,
              tier8: fieldValues.maxTier8,
            },
            numberOfIncrements: fieldValues.numberOfIncrements,
          }
        : {
            tierAddress: fieldValues.tierAddress,
            blockTime: fieldValues.blockTime,
            period: fieldValues.period,
            periodicRewards: {
              tier1: fieldValues.tier1,
              tier2: fieldValues.tier2,
              tier3: fieldValues.tier3,
              tier4: fieldValues.tier4,
              tier5: fieldValues.tier6,
              tier6: fieldValues.tier6,
              tier7: fieldValues.tier7,
              tier8: fieldValues.tier8,
            },
          };

      let vmStateConfig: StateConfig;
      if (emissionsType.value) {
        vmStateConfig = new SequentialEmissions(emissionsConfig);
      }
      if (!emissionsType.value) {
        vmStateConfig = new LinearEmissions(emissionsConfig);
      }

      let erc20Config: ERC20Config;
      erc20Config = {
        name: fieldValues.erc20name,
        symbol: fieldValues.erc20symbol,
        distributor: fieldValues.ownerAddress,
        initialSupply: fieldValues.initSupply,
      };

      let emissionsDeployArg: EmissionsERC20DeployArgs;
      emissionsDeployArg = {
        allowDelegatedClaims: false,
        erc20Config,
        vmStateConfig,
      };

      newEmissionsERC20 = await EmissionsERC20.deploy(
        $signer,
        emissionsDeployArg
      );
    } else {
      return;
    }

    return newEmissionsERC20;
  };

  const handleClick = () => {
    deployPromise = deployEmissions();
  };
</script>

<div class="flex w-full gap-x-3">
  <div class="flex w-3/5 flex-col gap-y-4">
    <div class="mb-2 flex flex-col gap-y-2 w-full">
      <span class="text-2xl">Deploy a new EmissionsERC20.</span>
      <span class="text-gray-400">
        Mint a new ERC20 based on a users Tier status according to a defined
        schedule, using a RainVM script.
      </span>
    </div>

    <FormPanel>
      <Select
        items={emissionsOptions}
        bind:value={emissionsType}
        on:change={() => {
          if (emissionsType.value) {
            document.getElementById("maxReward").style.display = "block";
            document.getElementById("inc").style.display = "block";
          } else {
            document.getElementById("maxReward").style.display = "none";
            document.getElementById("inc").style.display = "none";
          }
        }}
      >
        <span slot="label"> Select The Emissions Type: </span>
      </Select>
    </FormPanel>

    {#if emissionsType !== null}
      <FormPanel heading="Emissions ERC20 config">
        <Input
          type="text"
          placeholder="Name"
          bind:this={fields.erc20name}
          bind:value={erc20name}
          validator={defaultValidator}
        >
          <span slot="label">Name</span>
        </Input>

        <Input
          type="text"
          placeholder="Symbol"
          bind:this={fields.erc20symbol}
          bind:value={erc20symbol}
          validator={defaultValidator}
        >
          <span slot="label">Symbol</span>
        </Input>
        <Input
          type="number"
          bind:this={fields.blockTime}
          bind:value={blockTime}
          validator={defaultValidator}
        >
          <span slot="label">Block Time</span>
          <span slot="description"
            >Time it takes for each block to be mined, e.g for Polygon it is
            2.3s per block (in seconds)</span
          >
        </Input>
        <Input
          type="number"
          bind:this={fields.period}
          bind:value={period}
          validator={defaultValidator}
        >
          <span slot="label">Claim Period</span>
          <span slot="description"
            >The time duration of each period (in seconds)</span
          >
        </Input>
        <div id="inc" style="display:block" class="w-full">
          <Input
            type="number"
            bind:this={fields.numberOfIncrements}
            bind:value={numberOfIncrements}
            validator={defaultValidator}
          >
            <span slot="label">Periods Length</span>
            <span slot="description"
              >Number of periods it takes to reach max reward per period, must be equal or greater than 3</span
            >
          </Input>
        </div>
        <Input
          type="address"
          placeholder="Name"
          bind:this={fields.ownerAddress}
          bind:value={ownerAddress}
          validator={addressValidate}
        >
          <span slot="label">Address to mint eTKN for</span>
        </Input>
        <Input
          type="number"
          bind:this={fields.initSupply}
          bind:value={initSupply}
          validator={defaultValidator}
        >
          <span slot="label">Amount of eTKN to mint</span>
        </Input>
      </FormPanel>

      <FormPanel heading="Tier">
        <Input
          type="address"
          placeholder="Name"
          bind:this={fields.tierAddress}
          bind:value={tierAddress}
          validator={addressValidate}
        >
          <span slot="label">Tier contract to check reports against.</span>
        </Input>
      </FormPanel>

      <FormPanel heading="Period's base rewards for each tier status">
        <Input
          type="number"
          placeholder=""
          bind:this={fields.tier1}
          bind:value={tier1}
          validator={defaultValidator}
        >
          <span slot="label">Tier 1</span>
        </Input>
        <Input
          type="number"
          placeholder=""
          bind:this={fields.tier2}
          bind:value={tier2}
          validator={defaultValidator}
        >
          <span slot="label">Tier 2</span>
        </Input>
        <Input
          type="number"
          placeholder=""
          bind:this={fields.tier3}
          bind:value={tier3}
          validator={defaultValidator}
        >
          <span slot="label">Tier 3</span>
        </Input>
        <Input
          type="number"
          placeholder=""
          bind:this={fields.tier4}
          bind:value={tier4}
          validator={defaultValidator}
        >
          <span slot="label">Tier 4</span>
        </Input>
        <Input
          type="number"
          placeholder=""
          bind:this={fields.tier5}
          bind:value={tier5}
          validator={defaultValidator}
        >
          <span slot="label">Tier 5</span>
        </Input>
        <Input
          type="number"
          placeholder=""
          bind:this={fields.tier6}
          bind:value={tier6}
          validator={defaultValidator}
        >
          <span slot="label">Tier 6</span>
        </Input>
        <Input
          type="number"
          placeholder=""
          bind:this={fields.tier7}
          bind:value={tier7}
          validator={defaultValidator}
        >
          <span slot="label">Tier 7</span>
        </Input>
        <Input
          type="number"
          placeholder=""
          bind:this={fields.tier8}
          bind:value={tier8}
          validator={defaultValidator}
        >
          <span slot="label">Tier 8</span>
        </Input>
      </FormPanel>

      <div id="maxReward" style="display:block" class="w-full">
        <FormPanel heading="Period's max reward for each tier status">
          <Input
            type="number"
            placeholder=""
            bind:this={fields.maxTier1}
            bind:value={maxTier1}
            validator={defaultValidator}
          >
            <span slot="label">Tier 1</span>
          </Input>
          <Input
            type="number"
            placeholder=""
            bind:this={fields.maxTier2}
            bind:value={maxTier2}
            validator={defaultValidator}
          >
            <span slot="label">Tier 2</span>
          </Input>
          <Input
            type="number"
            placeholder=""
            bind:this={fields.maxTier3}
            bind:value={maxTier3}
            validator={defaultValidator}
          >
            <span slot="label">Tier 3</span>
          </Input>
          <Input
            type="number"
            placeholder=""
            bind:this={fields.maxTier4}
            bind:value={maxTier4}
            validator={defaultValidator}
          >
            <span slot="label">Tier 4</span>
          </Input>
          <Input
            type="number"
            placeholder=""
            bind:this={fields.maxTier5}
            bind:value={maxTier5}
            validator={defaultValidator}
          >
            <span slot="label">Tier 5</span>
          </Input>
          <Input
            type="number"
            placeholder=""
            bind:this={fields.maxTier6}
            bind:value={maxTier6}
            validator={defaultValidator}
          >
            <span slot="label">Tier 6</span>
          </Input>
          <Input
            type="number"
            placeholder=""
            bind:this={fields.maxTier7}
            bind:value={maxTier7}
            validator={defaultValidator}
          >
            <span slot="label">Tier 7</span>
          </Input>
          <Input
            type="number"
            placeholder=""
            bind:this={fields.maxTier8}
            bind:value={maxTier8}
            validator={defaultValidator}
          >
            <span slot="label">Tier 8</span>
          </Input>
        </FormPanel>
      </div>

      <FormPanel>
        {#if !deployPromise}
          <Button shrink on:click={handleClick}>Deploy EmissionsERC20</Button>
        {:else}
          <ContractDeploy {deployPromise} type="EmissionsERC20" />
        {/if}
      </FormPanel>
    {/if}
  </div>
  <div class="flex w-2/5 flex-col gap-y-4">
    {#if FriendlySource && emissionsType}
      <span class="relative">
        <FormPanel>
          <EmissionSmallSimulationChart {FriendlySource} />
        </FormPanel>
      </span>
    {/if}
    {#if FriendlySource && emissionsType}
      <span class="sticky">
        <FormPanel heading="Human Readable Source">
          <HumanReadable
            signer={$signerAddress}
            contractType="emissions"
            {FriendlySource}
          />
        </FormPanel>
      </span>
    {/if}
  </div>
</div>

<style>
  span.relative {
    margin-top: 80px;
    float: right;
    position: relative;
    /* top: 90px; */
    padding: 5px;
  }

  span.sticky {
    float: right;
    position: sticky;
    top: 90px;
    padding: 5px;
  }
</style>
