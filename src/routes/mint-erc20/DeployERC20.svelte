<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import { op, validateFields } from "../../utils";
  import { addressValidate } from "../../validation";
  import ContractDeploy from "src/components/ContractDeploy.svelte";
  import {
    EmissionsERC20,
    ERC20Config,
    StateConfig,
    EmissionsERC20DeployArgs,
  } from "rain-sdk";
import { concat, parseUnits } from "ethers/lib/utils";
import Switch from "src/components/Switch.svelte";
  

  let deployPromise;

  let fields: any = {};

  let fixedSupply = false;

  let erc20name = "MyToken";
  let erc20symbol = "MyTKN";

  let ownerAddress = $signerAddress;
  let initSupply = 0;
  let amount = 0;

  // @TODO write validators
  const defaultValidator = () => {
    return true;
  };

  const deployEmissions = async () => {
    const { validationResult, fieldValues } = validateFields(fields);

    // GET THE SOURCE

    let newEmissionsERC20;

    if (validationResult) {
      const Amount = fixedSupply ? parseUnits(amount.toString()) : 0;
      let vmStateConfig: StateConfig = {
        constants: [ownerAddress, Amount, 0],
        sources: [
          concat([
            op(EmissionsERC20.Opcodes.VAL, 0),
            op(EmissionsERC20.Opcodes.CLAIMANT_ACCOUNT),
            op(EmissionsERC20.Opcodes.EQUAL_TO),
            op(EmissionsERC20.Opcodes.VAL, 1),
            op(EmissionsERC20.Opcodes.VAL, 2),
            op(EmissionsERC20.Opcodes.EAGER_IF)
          ])
        ],
        stackLength: 6,
        argumentsLength: 0
      }

      let erc20Config: ERC20Config;
      erc20Config = {
        name: fieldValues.erc20name,
        symbol: fieldValues.erc20symbol,
        distributor: fieldValues.ownerAddress,
        initialSupply: parseUnits(fieldValues.initSupply.toString()),
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
      <span class="text-2xl">Deploy a new ERC20 Token.</span>
      <span class="text-gray-400">
        Mint a new ERC20 Token
      </span>
    </div>

      <FormPanel heading="ERC20 config">
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
          type="address"
          placeholder="Name"
          bind:this={fields.ownerAddress}
          bind:value={ownerAddress}
          validator={addressValidate}
        >
          <span slot="label">Owner Address</span>
        </Input>
        {#if fixedSupply}
        <Input
          type="number"
          bind:this={fields.initSupply}
          bind:value={initSupply}
          validator={defaultValidator}
        >
          <span slot="label">Initial Supply</span>
        </Input>
        {:else}
        <Input
        type="number"
        bind:this={fields.initSupply}
        bind:value={initSupply}
        validator={defaultValidator}
      >
        <span slot="label">Total Supply (Fixed)</span>
      </Input>
      {/if}
      </FormPanel>
    
      <FormPanel>
        <div>
          <span class="font-bold">Supply Control</span>
          <Switch bind:checked={fixedSupply}/>
          <br />
          <span class="text-gray-400"
            >ERC20 token will have fixed supply if switched off</span
          >
          {#if fixedSupply}
          <br /><br/>
            <Input
              type="number"
              bind:this={fields.amount}
              bind:value={amount}
              validator={defaultValidator}
              >
              <span slot="label">Amount of tokens to mint each time in future</span>
            </Input>
          {/if}
        </div>
      </FormPanel>

      <FormPanel>
        {#if !deployPromise}
          <Button shrink on:click={handleClick}>Deploy ERC20 Token</Button>
        {:else}
          <ContractDeploy {deployPromise} type="ERC20 Token" />
        {/if}
      </FormPanel>
  </div>
</div>
