<script lang="ts">
  import ContractDeploy from "components/ContractDeploy.svelte";
  import { ethers } from "ethers";
  import { concat, defaultAbiCoder, formatUnits, parseUnits } from "ethers/lib/utils";
  import { signer, signerAddress } from "svelte-ethers-store";
  import Select from "../../components/Select.svelte";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Switch from "src/components/Switch.svelte";
  import { getERC20, op, validateFields } from "../../utils";
  import {saleDeploy,
    saleStateConfigGenerator,
    saleRedeemableErc20ConfigGenerator,
    selectSale,
    selectWalletCap } from "./sale";
  import { DatePicker, CalendarStyle } from "@beyonk/svelte-datepicker";

  let fields: any = {};
  let deployPromise;
  let sale, token;
  let reserveErc20;

  // some default values for testing
  let recipient = "0xf6CF014a3e92f214a3332F0d379aD32bf0Fae929";
  let reserve = "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A";
  let startBlock = 24407548;
  let cooldownDuration = 100;
  let saleTimeout = 100;
  let minimumRaise = 1000;
  let startPrice = 10;
  let endPrice = 20;
  let startTimestamp;
  let endTimestamp;
  let name = "Raise token";
  let symbol = "rTKN";
  let initialSupply = 1000;
  let distributionEndForwardingAddress = ethers.constants.AddressZero;
  let maxWalletCap = 10;
  let minWalletCap = 3;
  let tier = "0x6BA1fADB694E806c316337143241Dd6cFebd5033";
  let minimumStatus = 0;
  let raiseRange;
  let discountThreshold = 5;
  let discount = 25;
  let extraTime = 30;
  let extraTimeAmount = 150;

  const saleOptions = [
    {value: selectSale.fixedPrice, label: "Fixed Price"},
    {value: selectSale.vFLO, label: "vFLO"},
    {value: selectSale.increasingPrice, label: "Increasing Price"}
  ];

  let saleType: {value: number; label: string} = null;
  let check = [false, false];
  let extCheck = false;


  // @TODO write validators
  const defaultValidator = () => {
    return true;
  };

  const handleClick = async () => {
    deployPromise = deploy();
  };

  const deploy = async () => {
    const { validationResult, fieldValues } = validateFields(fields);
    let receipt;
    fieldValues.startTimestamp = Math.floor(raiseRange?.[0].$d.getTime() / 1000);
    fieldValues.endTimestamp = Math.floor(raiseRange?.[1].$d.getTime() / 1000);
    fieldValues.reserveErc20 = reserveErc20;
    fieldValues.discount = !extCheck ? 0 : discount;
    

    if (validationResult) {
      return await saleDeploy(
        $signer,
        saleStateConfigGenerator(fieldValues, saleType.value, walletCapType(), extCheck),
        saleRedeemableErc20ConfigGenerator(fieldValues),
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
  };

  const walletCapType = () => {
    if(!check[0] && !check[1]) return selectWalletCap.none
    else if (check[0] && !check[1]) return selectWalletCap.max
    else if (!check[0] && check[1]) return selectWalletCap.min
    else return selectWalletCap.both
  };


  const handleSaleChange = () => {
  const ElemA = document.getElementById("A");
  const ElemB = document.getElementById("B");
    if (saleType.value == 2) {
      ElemA.style.display = "block";
      ElemB.style.display = "block";
    }
    else {
      ElemA.style.display = "none";
      ElemB.style.display = "none";
    }
  };

</script>

<div class="flex w-3/4 flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl"> Create a new Sale. </span>
  </div>

  <FormPanel>
    <Select items={saleOptions} bind:value={saleType} on:change={handleSaleChange}>
      <span slot="label">
       Select The Sale Type:
      </span>
    </Select>
  </FormPanel>
  
  {#if saleType !== null }
  <FormPanel heading="Sale config">
    <Input
      type="address"
      bind:this={fields.recipient}
      bind:value={recipient}
      validator={defaultValidator}
    >
      <span slot="label"> Recipient: </span>
    </Input>

    <Input
      type="address"
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

    {#if saleType.value == 0}
      <Input
        type="number"
        bind:this={fields.startPrice}
        bind:value={startPrice}
        validator={defaultValidator}
      >
        <span slot="label"> Price: </span>
      </Input>
    {:else}
      <Input
        type="number"
        bind:this={fields.startPrice}
        bind:value={startPrice}
        validator={defaultValidator}
      >
        <span slot="label"> Start Price: </span>
      </Input>
    {/if}
    
    <div id="B" style="display:block" class="w-full" >
      <Input 
        type="number"
        bind:this={fields.endPrice}
        bind:value={endPrice}
        validator={defaultValidator}
      >
        <span slot="label" > End Price: </span>
        <span slot="description"> The maximum number of raise tokens purchaseable by each eligible address </span>
      </Input>
    </div>
  </FormPanel>

  <FormPanel>
    <span>
      Sale Extra Time:
     </span><Switch  bind:checked={extCheck} on:change={ () => {
      if (extCheck) document.getElementById("exTime").style.display = "block"
      else document.getElementById("exTime").style.display = "none";}}>
      </Switch>

    <div id="exTime" style="display:none" class="flex w-full flex-col gap-y-4">
      <div id="A" style="display:none">
        <span > Discount Percentage:  </span>
          <label>
            <input style="background-color:transparent"
              type=number
              bind:value={discount}
              min=0
              max=99
            >
            <br>
            <input style="width:100%"
              type=range 
              bind:value={discount}
              min=1
              max=99
            >
          </label>
        <br><br>
      <Input
        type="number"
        bind:this={fields.discountThreshold}
        bind:value={discountThreshold}
        validator={defaultValidator}
      >
        <span slot="label" > Discount Threshold: </span>
        <span slot="description"> Amount that each wallet had to be purchased to be eligible for the extra time discount </span>
      </Input>
      </div>
      <br>
      <Input
        type="number"
        bind:this={fields.extraTime}
        bind:value={extraTime}
        validator={defaultValidator}
      >
        <span slot="label"> Extra Time: </span>
        <span slot="description"> Specify the amount of extra time (in mnutes) you want the raise to run if you have raised X amount before end of the raise </span>
      </Input>
      <br>
      <Input
        type="number"
        bind:this={fields.extraTimeAmount}
        bind:value={extraTimeAmount}
        validator={defaultValidator}
      >
        <span slot="label"> Extra Time trigger amount: </span>
        <span slot="description"> Specify the amount in percentage that needs to be raised before end of the raise for extra time to get activated </span>
      </Input>
    </div>
  </FormPanel>

  <FormPanel>
    <div class="grid w-full grid-cols-1 items-start"> 
      <span>
        Sale Cap Per Wallet:
       </span> 
       <br>  
      <table class="table-fixed">
        <tr>
          <td class="text-gray-400"> Max Cap per wallet: 
            <Switch bind:checked={check[0]} on:change={() => {
              if(check[0]) {
                document.getElementById("capMax").style.display = "block"}
                else document.getElementById("capMax").style.display = "none"}}
            >
            </Switch>
          </td>
        </tr>
        <tr>
          <td id="capMax" style="display:none">
            <Input
              type="number"
              bind:this={fields.maxWalletCap}
              bind:value={maxWalletCap}
              validator={defaultValidator}
            >
              <span slot="description"> The maximum number of raise tokens purchaseable by each eligible address </span>
            </Input>
          </td>
        </tr>
        <br><br>
        <tr>
          <td class="text-gray-400"> Min Cap per wallet: 
            <Switch bind:checked={check[1]} on:change={() => {
              if(check[1]) {
                document.getElementById("capMin").style.display = "block"}
                else document.getElementById("capMin").style.display = "none"}}
            >
            </Switch>
          </td>
        </tr>
        <tr>
          <td id="capMin" style="display:none">
            <Input
              type="number"
              bind:this={fields.minWalletCap}
              bind:value={minWalletCap}
              validator={defaultValidator}
            >
              <span slot="description"> The minimum number of raise tokens purchaseable by each eligible address </span>
            </Input>
          </td>
        </tr>
      </table>
    </div>
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
      type="address"
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
      type="address"
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
    {#if !deployPromise}
      <Button shrink on:click={handleClick}>Deploy Sale</Button>
    {:else}
      <ContractDeploy {deployPromise} type="Sale" />
    {/if}
  </FormPanel>
  {/if}
</div>
