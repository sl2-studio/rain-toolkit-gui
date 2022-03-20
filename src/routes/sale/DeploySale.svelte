<script lang="ts">
  import { ethers } from "ethers";
  import { concat, formatUnits, parseUnits } from "ethers/lib/utils";
  import { signer, signerAddress } from "svelte-ethers-store";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import { getERC20, op, validateFields } from "../../utils";
  import { afterTimestampConfig, Opcode, saleDeploy } from "./sale";
  import { DatePicker, CalendarStyle } from "@beyonk/svelte-datepicker";

  let fields: any = {};
  let deployPromise;
  let sale, token;
  let reserveErc20;

  // some default values for testing
  let recipient = "0xf6CF014a3e92f214a3332F0d379aD32bf0Fae929";
  let reserve = "0x25a4dd4cd97ed462eb5228de47822e636ec3e31a";
  let startBlock = 24407548;
  let cooldownDuration = 100;
  let saleTimeout = 100;
  let minimumRaise = 1000;
  let price = 10;
  let name = "Raise token";
  let symbol = "rTKN";
  let initialSupply = 1000;
  let distributionEndForwardingAddress = ethers.constants.AddressZero;
  let walletCap = 10;
  let tier = "0xC064055DFf6De32f44bB7cCB0ca59Cbd8434B2de";
  let minimumStatus = 0;
  let raiseRange;

  // @TODO write validators
  const defaultValidator = () => {
    return true;
  };

  const handleClick = async () => {
    deployPromise = deploy();
  };

  const deploy = async () => {
    const { validationResult, fieldValues } = validateFields(fields);
    console.log(fieldValues);

    // utility functions for converting to token amounts with the req decimals
    const staticPrice = parseUnits(
      fieldValues.price.toString(),
      reserveErc20.erc20decimals
    );

    const walletCap = parseUnits(fieldValues.walletCap.toString());

    //////////////////

    const constants = [staticPrice, walletCap, ethers.constants.MaxUint256];

    const sources = [
      concat([
        op(Opcode.CURRENT_BUY_UNITS),
        op(Opcode.TOKEN_ADDRESS),
        op(Opcode.SENDER),
        op(Opcode.ERC20_BALANCE_OF),
        op(Opcode.ADD, 2),
        op(Opcode.VAL, 1),
        op(Opcode.GREATER_THAN),
        op(Opcode.VAL, 2),
        op(Opcode.VAL, 0),
        op(Opcode.EAGER_IF),
      ]),
    ];

    ////////////////

    if (validationResult) {
      sale = await saleDeploy(
        $signer,
        {
          canStartStateConfig: afterTimestampConfig(
            Math.floor(raiseRange?.[0].$d.getTime() / 1000)
          ),
          canEndStateConfig: afterTimestampConfig(
            Math.floor(raiseRange?.[1].$d.getTime() / 1000)
          ),
          calculatePriceStateConfig: {
            sources,
            constants,
            stackLength: 10,
            argumentsLength: 0,
          },
          recipient: fieldValues.recipient,
          reserve: fieldValues.reserve,
          cooldownDuration: parseInt(fieldValues.cooldownDuration),
          minimumRaise: parseUnits(
            fieldValues.minimumRaise.toString(),
            reserveErc20.erc20decimals
          ),
          dustSize: 0,
        },
        {
          erc20Config: {
            name: fieldValues.name,
            symbol: fieldValues.symbol,
            distributor: ethers.constants.AddressZero,
            initialSupply: parseUnits(fieldValues.initialSupply.toString()),
          },
          tier: fieldValues.tier,
          minimumTier: fieldValues.minimumStatus,
          distributionEndForwardingAddress:
            fieldValues.distributionEndForwardingAddress,
        }
      );
    }
  };
  const getReserveErc20 = async () => {
    if (fields.reserve.validate()) {
      reserveErc20 = await getERC20(reserve, $signer, $signerAddress);
    }
  };

  $: if (reserve && fields?.reserve) {
    getReserveErc20();
  }

  $: console.log($signer, $signerAddress);
</script>

<div class="flex w-3/4 flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl"> Create a new Sale. </span>
    <span class="text-gray-400"> ... </span>
  </div>
  <FormPanel heading="Sale config">
    <Input
      type="text"
      bind:this={fields.recipient}
      bind:value={recipient}
      validator={defaultValidator}
    >
      <span slot="label"> Recipient: </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.reserve}
      bind:value={reserve}
      validator={defaultValidator}
    >
      <span slot="label"> Reserve token: </span>
      <span slot="description">
        {#if reserveErc20}
          <div class="flex flex-col gap-y-1">
            <span>Name: {reserveErc20.erc20name}</span>
            <span>Symbol: {reserveErc20.erc20symbol}</span>
            <span
              >Your balance: {formatUnits(
                reserveErc20.erc20balance,
                reserveErc20.erc20decimals.toString()
              )}</span
            >
          </div>
        {/if}
      </span>
    </Input>

    <span class="z-20 flex w-full flex-col gap-y-3">
      <span>Raise start/end time</span>
      <DatePicker
        styling={new CalendarStyle({ buttonWidth: "100%" })}
        bind:selected={raiseRange}
        time={true}
        range={true}
        placeholder="Select date/time"
        format="DD / MM / YYYY hh:mm"
      />
      <span />
    </span>

    <Input
      type="number"
      bind:this={fields.cooldownDuration}
      bind:value={cooldownDuration}
      validator={defaultValidator}
    >
      <span slot="label"> Cool down duration (in blocks): </span>
    </Input>

    <Input
      type="number"
      bind:this={fields.minimumRaise}
      bind:value={minimumRaise}
      validator={defaultValidator}
    >
      <span slot="label"> Minimum raise: </span>
    </Input>

    <Input
      type="number"
      bind:this={fields.price}
      bind:value={price}
      validator={defaultValidator}
    >
      <span slot="label"> Price: </span>
    </Input>

    <Input
      type="number"
      bind:this={fields.walletCap}
      bind:value={walletCap}
      validator={defaultValidator}
    >
      <span slot="label"> Cap per wallet: </span>
      <span slot="description"
        >The maximum number of raise tokens purchaseable by each eligible
        address.</span
      >
    </Input>
  </FormPanel>

  <FormPanel heading="RedeemableERC20 config">
    <Input
      type="text"
      bind:this={fields.name}
      bind:value={name}
      validator={defaultValidator}
    >
      <span slot="label"> Name: </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.symbol}
      bind:value={symbol}
      validator={defaultValidator}
    >
      <span slot="label"> Symbol: </span>
    </Input>

    <Input
      type="number"
      bind:this={fields.initialSupply}
      bind:value={initialSupply}
      validator={defaultValidator}
    >
      <span slot="label"> Initial supply: </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.distributionEndForwardingAddress}
      bind:value={distributionEndForwardingAddress}
      validator={defaultValidator}
    >
      <span slot="label">Forwarding address: </span>
      <span slot="description">
        If set to anything other than the zero address, all unsold rTKN will be
        forwarded to this address at the end of the raise. If the minimum raise
        is 0, this must be set to something other than the zero address.
      </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.tier}
      bind:value={tier}
      validator={defaultValidator}
    >
      <span slot="label"> Tier: </span>
      <span slot="description">
        The address of a Tier contract to gate with.
      </span>
    </Input>

    <Input
      type="number"
      bind:this={fields.minimumStatus}
      bind:value={minimumStatus}
      validator={defaultValidator}
    >
      <span slot="label"> Minimum Status: </span>
    </Input>
  </FormPanel>

  <FormPanel>
    <Button shrink on:click={handleClick}>Deploy Sale</Button>

    {#if deployPromise}
      <div class="flex flex-col gap-y-2 text-blue-300">
        {#await deployPromise}
          ...deploying
        {:then}
          deployed
          <span>Sale contract: {sale.address}</span>
          <!-- <span>RedeemableERC20 token address: {token.address}</span> -->
        {/await}
      </div>
    {/if}
  </FormPanel>
</div>
