<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import { validateFields } from "../../utils";
  import { ContractReceipt, ethers } from "ethers";
  import EmissionsFactoryArtifact from "../../abis/EmissionsERC20Factory.json";
  import { addressValidate } from "../../validation";
  import {
    createEmissionsSource,
    StateConfigStruct,
    ERC20ConfigStruct,
    EmissionsERC20ConfigStruct,
  } from "./emissions";
  import { selectedNetwork } from "src/stores";
  import ContractDeploy from "src/components/ContractDeploy.svelte";
import { parseUnits } from "ethers/lib/utils";

  let deployPromise;

  let fields: any = {};

  // some default values for testing
  let tier = "0xf6CF014a3e92f214a3332F0d379aD32bf0Fae929";
  let erc20name = "EmissionsTKN";
  let erc20symbol = "eTKN";

  let tierAddress = "0x859834199ebd4d53750be5588ebb64ad841266aa";

  let brnzReward = 100;
  let silvReward = 200;
  let goldReward = 500;
  let platReward = 1000;
  let brnzMaxReward = 200;
  let silvMaxReward = 400;
  let goldMaxReward = 1000;
  let platMaxReward = 2000;
  let incrementDuration = 1; // 1 month
  let numberOfIncrements = 36;
  let ownerAddress = "0xa44ab31CB79Ca950f6f6618c8F6d75b6D85b8970"; 
  let initSupply = 1000;

  // @TODO write validators
  const defaultValidator = () => {
    return true;
  };

  const deployEmissions = async () => {
    const emissionsFactory = new ethers.Contract(
      $selectedNetwork.addresses.EMISSIONS_FACTORY,
      EmissionsFactoryArtifact.abi,
      $signer
    );

    const { validationResult, fieldValues } = validateFields(fields);

    // GET THE SOURCE

    let tx;

    if (validationResult) {
      let vmStateConfig: StateConfigStruct;
      vmStateConfig = createEmissionsSource({
        monthlyRewards: {
          brnzReward: fieldValues.brnzReward,
          silvReward: fieldValues.silvReward,
          goldReward: fieldValues.goldReward,
          platReward: fieldValues.platReward,
        },
        maxMonthlyRewards: {
          brnzReward: fieldValues.brnzMaxReward,
          silvReward: fieldValues.silvMaxReward,
          goldReward: fieldValues.goldMaxReward,
          platReward: fieldValues.platMaxReward,
        },
        tierAddress: fieldValues.tierAddress,
        incrementDuration: fieldValues.incrementDuration,
        numberOfIncrements: fieldValues.numberOfIncrements,
      });

      let erc20Config: ERC20ConfigStruct;
      erc20Config = {
        name: fieldValues.erc20name,
        symbol: fieldValues.erc20symbol,
        distributor: fieldValues.ownerAddress,
        initialSupply: parseUnits(fieldValues.initSupply.toString()),
      };

      let emissionsConfig: EmissionsERC20ConfigStruct;
      emissionsConfig = {
        allowDelegatedClaims: false,
        erc20Config,
        vmStateConfig,
      };

      tx = await emissionsFactory.createChildTyped(emissionsConfig);
    } else {
      return;
    }

    const receipt = (await tx.wait()) as ContractReceipt;

    return receipt;
  };

  const handleClick = () => {
    deployPromise = deployEmissions();
  };
</script>

<div class="flex max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl">Deploy a new EmissionsERC20.</span>
    <span class="text-gray-400">
      Mint a new ERC20 based on a users Tier status according to a defined
      schedule, using a RainVM script.
    </span>
  </div>
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
    <Input
      type="number"
      bind:this={fields.incrementDuration}
      bind:value={incrementDuration}
      validator={defaultValidator}
    >
    <span slot="label">Claim Period</span>
      <span slot="description">The period of time to for each claim, default is 1 which means 1 month in ploygon, multiply that by 3 for mumbai testnet. For example 2 it means 15 days in polygon, so to get 15 days in mumbai it needs to be multiplied by 3, which is 6</span>
    </Input>
    <Input
      type="number"
      bind:this={fields.numberOfIncrements}
      bind:value={numberOfIncrements}
      validator={defaultValidator}
    >
      <span slot="label">Reward Increase Over This Span Of Time (months)</span>
    </Input>
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

  <FormPanel heading="Monthly rewards for each tier status">
    <Input
      type="number"
      placeholder=""
      bind:this={fields.brnzReward}
      bind:value={brnzReward}
      validator={defaultValidator}
    >
      <span slot="label">Bronze</span>
    </Input>
    <Input
      type="number"
      placeholder=""
      bind:this={fields.silvReward}
      bind:value={silvReward}
      validator={defaultValidator}
    >
      <span slot="label">Silver</span>
    </Input>
    <Input
      type="number"
      placeholder=""
      bind:this={fields.goldReward}
      bind:value={goldReward}
      validator={defaultValidator}
    >
      <span slot="label">Gold</span>
    </Input>
    <Input
      type="number"
      placeholder=""
      bind:this={fields.platReward}
      bind:value={platReward}
      validator={defaultValidator}
    >
      <span slot="label">Platinum</span>
    </Input>
  </FormPanel>
  <FormPanel heading="Max monthly rewards for each tier status">
    <Input
      type="number"
      placeholder=""
      bind:this={fields.brnzMaxReward}
      bind:value={brnzMaxReward}
      validator={defaultValidator}
    >
      <span slot="label">Bronze</span>
    </Input>
    <Input
      type="number"
      placeholder=""
      bind:this={fields.silvMaxReward}
      bind:value={silvMaxReward}
      validator={defaultValidator}
    >
      <span slot="label">Silver</span>
    </Input>
    <Input
      type="number"
      placeholder=""
      bind:this={fields.goldMaxReward}
      bind:value={goldMaxReward}
      validator={defaultValidator}
    >
      <span slot="label">Gold</span>
    </Input>
    <Input
      type="number"
      placeholder=""
      bind:this={fields.platMaxReward}
      bind:value={platMaxReward}
      validator={defaultValidator}
    >
      <span slot="label">Platinum</span>
    </Input>
  </FormPanel>

  <FormPanel>
    {#if !deployPromise}
      <Button shrink on:click={handleClick}>Deploy EmissionsERC20</Button>
    {:else}
      <ContractDeploy {deployPromise} type="EmissionsERC20" />
    {/if}
  </FormPanel>
</div>
