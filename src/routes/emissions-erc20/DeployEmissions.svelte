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

  let deployPromise;

  let fields: any = {};

  // some default values for testing
  let tier = "0xf6CF014a3e92f214a3332F0d379aD32bf0Fae929";
  let erc20name = "EmissionsTKN";
  let erc20symbol = "eTKN";

  let tierAddress = "0x4e2c8E95008645651dd4dA64E2f998f99f06a1Ed";

  let brnzReward = 100;
  let silvReward = 200;
  let goldReward = 500;
  let platReward = 1000;

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
        tierAddress: fieldValues.tierAddress,
      });

      let erc20Config: ERC20ConfigStruct;
      erc20Config = {
        name: fieldValues.erc20name,
        symbol: fieldValues.erc20symbol,
        distributor: $signerAddress,
        initialSupply: 0,
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
  <FormPanel>
    {#if !deployPromise}
      <Button shrink on:click={handleClick}>Deploy EmissionsERC20</Button>
    {:else}
      <ContractDeploy {deployPromise} type="EmissionsERC20" />
    {/if}
  </FormPanel>
</div>
