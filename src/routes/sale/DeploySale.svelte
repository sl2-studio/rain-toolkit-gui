<script lang="ts">
  import ContractDeploy from "../../components/ContractDeploy.svelte";
  import { ethers } from "ethers";
  import { formatUnits } from "ethers/lib/utils";
  import { signer, signerAddress } from "svelte-ethers-store";
  import Select from "../../components/Select.svelte";
  import Button from "../../components/Button.svelte";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Switch from "src/components/Switch.svelte";
  import { getERC20, isTier, validateFields } from "../../utils";
  import { saleDeploy, SaleParams, selectSale } from "./sale";
  import { DatePicker, CalendarStyle } from "@beyonk/svelte-datepicker";
  import SaleSmallSimulationChart from "./SaleSmallSimulationChart.svelte";
  import HumanReadable from "../../components/FriendlySource/HumanReadable.svelte";

  let fields: any = {};
  let deployPromise;
  let reserveErc20;
  let saleParams: SaleParams;

  let tierError, tierDiscountError, tierCapMulError;

  // some default values for testing
  let recipient = "0xf6CF014a3e92f214a3332F0d379aD32bf0Fae929";
  let reserve = "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A";
  let startBlock = 24407548;
  let cooldownDuration = 100;
  let saleTimeout = 100;
  let minimumRaise = 1000;
  let startPrice = 10;
  let endPrice = 20;
  let name = "Raise token";
  let symbol = "rTKN";
  let initialSupply = 1000;
  let distributionEndForwardingAddress = ethers.constants.AddressZero;
  let maxWalletCap = 10;
  let minWalletCap = 3;
  let tier = "0x6BA1fADB694E806c316337143241Dd6cFebd5033";
  let minimumStatus = 0;
  let raiseRange;
  let extraTimeDiscountThreshold = 5;
  let extraTimeDiscount = 25;
  let extraTime = 30;
  let extraTimeAmount = 150;
  let tierDiscountAddress = "0x1b044f69674c47ab19475cbb57d4d7673f6ccd6c";
  let tierCapMulAddress = "0x1b044f69674c47ab19475cbb57d4d7673f6ccd6c";

  let discountTier1 = 5,
    discountTier2 = 10,
    discountTier3 = 15,
    discountTier4 = 20,
    discountTier5 = 25,
    discountTier6 = 30,
    discountTier7 = 35,
    discountTier8 = 40;

  let capMulTier1 = 1,
    capMulTier2 = 2,
    capMulTier3 = 3,
    capMulTier4 = 4,
    capMulTier5 = 5,
    capMulTier6 = 6,
    capMulTier7 = 7,
    capMulTier8 = 8;

  let discountActTier1 = 8,
    discountActTier2 = 7,
    discountActTier3 = 6,
    discountActTier4 = 5,
    discountActTier5 = 4,
    discountActTier6 = 3,
    discountActTier7 = 2,
    discountActTier8 = 1;

  let capMulActTier1 = 8,
    capMulActTier2 = 7,
    capMulActTier3 = 6,
    capMulActTier4 = 5,
    capMulActTier5 = 4,
    capMulActTier6 = 3,
    capMulActTier7 = 2,
    capMulActTier8 = 1;

  const saleOptions = [
    { value: selectSale.fixedPrice, label: "Fixed Price" },
    { value: selectSale.vLBP, label: "vLBP" },
    { value: selectSale.increasingPrice, label: "Increasing Price" },
  ];

  let saleType: { value: number; label: string } = null;
  let maxCapCheck = false;
  let minCapCheck = false;
  let canEndCheck = false;
  let extraTimeDiscountCheck = false;
  let tierDiscountCheck = false;
  let tierDiscountActCheck = false;
  let tierCapMulCheck = false;
  let tierCapMulActCheck = false;
  let creatorControlCheck = false;
  let afterMinimumRaiseCheck = false;

  const getSaleParams = () => {
    const { validationResult, fieldValues } = validateFields(fields);
    fieldValues.startTimestamp = Math.floor(
      raiseRange?.[0].$d.getTime() / 1000
    );
    fieldValues.endTimestamp = Math.floor(raiseRange?.[1].$d.getTime() / 1000);
    fieldValues.reserveErc20 = reserveErc20;

    saleParams = {
      inputValues: fieldValues,
      saleType: saleType?.value,
      maxCapMode: maxCapCheck,
      minCapMode: minCapCheck,
      canEndMode: canEndCheck,
      extraTimeDiscountMode: extraTimeDiscountCheck,
      tierDiscountMode: tierDiscountCheck,
      tierDiscountActMode: tierDiscountActCheck,
      tierCapMulMode: tierCapMulCheck,
      tierCapMulActMode: tierCapMulActCheck,
      creatorControlMode: creatorControlCheck,
      afterMinimumRaiseMode: afterMinimumRaiseCheck,
    };

    return { validationResult, saleParams };
  };

  $: saleVals = {
    startTimestamp: Math.floor(raiseRange?.[0].$d.getTime() / 1000),
    endTimestamp: Math.floor(raiseRange?.[1].$d.getTime() / 1000),
    startPrice,
    endPrice,
    minimumRaise,
    initialSupply,
  };

  $: FriendlySource = {
    startTimestamp: Math.floor(raiseRange?.[0].$d.getTime() / 1000),
    endTimestamp: Math.floor(raiseRange?.[1].$d.getTime() / 1000),
    saleType: saleType?.value,
    maxCapMode: maxCapCheck,
    minCapMode: minCapCheck,
    canEndMode: canEndCheck,
    extraTimeDiscountMode: extraTimeDiscountCheck,
    tierDiscountMode: tierDiscountCheck,
    tierDiscountActMode: tierDiscountActCheck,
    tierCapMulMode: tierCapMulCheck,
    tierCapMulActMode: tierCapMulActCheck,
    creatorControlMode: creatorControlCheck,
    afterMinimumRaiseMode: afterMinimumRaiseCheck,

    recipient,
    reserve,
    startBlock,
    cooldownDuration,
    saleTimeout,
    minimumRaise,
    startPrice,
    endPrice,
    name,
    symbol,
    initialSupply,
    distributionEndForwardingAddress,
    maxWalletCap,
    minWalletCap,
    tier,
    minimumStatus,
    raiseRange,
    extraTimeDiscountThreshold,
    extraTimeDiscount,
    extraTime,
    extraTimeAmount,
    tierDiscountAddress,
    tierCapMulAddress,
    discountTier1,
    discountTier2,
    discountTier3,
    discountTier4,
    discountTier5,
    discountTier6,
    discountTier7,
    discountTier8,
    capMulTier1,
    capMulTier2,
    capMulTier3,
    capMulTier4,
    capMulTier5,
    capMulTier6,
    capMulTier7,
    capMulTier8,
    discountActTier1,
    discountActTier2,
    discountActTier3,
    discountActTier4,
    discountActTier5,
    discountActTier6,
    discountActTier7,
    discountActTier8,
    capMulActTier1,
    capMulActTier2,
    capMulActTier3,
    capMulActTier4,
    capMulActTier5,
    capMulActTier6,
    capMulActTier7,
    capMulActTier8,

    saleParam: getSaleParams().saleParams,
  };

  // @TODO write validators
  const defaultValidator = () => {
    return true;
  };

  const handleClick = async () => {
    deployPromise = deploy();
  };

  $: if (tier) {
    (async () => {
      tierError = await isTier(tier, $signer, $signerAddress);
    })();
  }

  $: if (tierDiscountCheck && tierDiscountAddress) {
    (async () => {
      tierDiscountError = await isTier(
        tierDiscountAddress,
        $signer,
        $signerAddress
      );
    })();
  }

  $: if (tierCapMulCheck && tierCapMulAddress) {
    (async () => {
      tierCapMulError = await isTier(
        tierCapMulAddress,
        $signer,
        $signerAddress
      );
    })();
  }

  const deploy = async () => {
    const { validationResult, saleParams } = getSaleParams();
    if (validationResult) {
      return await saleDeploy($signer, $signerAddress, saleParams);
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

  function MaxCapHandler() {
    if (maxCapCheck) document.getElementById("capMax").style.display = "block";
    else {
      document.getElementById("capMax").style.display = "none";
      document.getElementById("tierCapMul").style.display = "none";
      tierCapMulCheck = false;
      tierCapMulActCheck = false;
    }
  }
</script>

<div class="flex w-full gap-x-3">
  <div class="z-10 flex w-3/5 flex-col gap-y-4">
    <div class="mb-2 flex flex-col gap-y-2">
      <span class="text-2xl"> Create a new Sale. </span>
    </div>

    <FormPanel>
      <Select
        items={saleOptions}
        bind:value={saleType}
        on:change={() => {
          if (saleType.value == 2)
            document.getElementById("B").style.display = "block";
          else document.getElementById("B").style.display = "none";
        }}
      >
        <span slot="label"> Select The Sale Type: </span>
      </Select>
    </FormPanel>

    {#if saleType !== null}
      <FormPanel heading="Sale config" classes="z-10">
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
                <span>
                  Your balance: {formatUnits(
                    reserveErc20.erc20balance,
                    reserveErc20.erc20decimals.toString()
                  )}
                </span>
              </div>
            {/if}
          </span>
        </Input>

        <span class="z-20 flex w-full flex-col gap-y-3">
          <span>Raise Start/End Time</span>
          <DatePicker
            styling={new CalendarStyle({ buttonWidth: "100%" })}
            bind:selected={raiseRange}
            time={true}
            range={true}
            placeholder="Select Date/Time"
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

        <div id="B" style="display:block" class="w-full">
          <Input
            type="number"
            bind:this={fields.endPrice}
            bind:value={endPrice}
            validator={defaultValidator}
          >
            <span slot="label"> End Price: </span>
          </Input>
        </div>
      </FormPanel>

      <FormPanel>
        <div>
          <span>Creator Control:</span>
          <Switch bind:checked={creatorControlCheck} />
          <br />
          <span class="text-gray-400"
            >If switched off, everyone can start/end the sale once the
            canEnd/Start criteria of the sale is met.</span
          >
          <br />
          <span class="text-gray-400"
            >If switched on, only the sale creator can start/end the sale once
            the canEnd/Start criteria of the sale is met.</span
          >
        </div>
      </FormPanel>

      <FormPanel>
        <div>
          <span> Sale End After Hitting Minimum: </span>
          <Switch
            bind:checked={afterMinimumRaiseCheck}
            on:change={() => {
              if (afterMinimumRaiseCheck) {
                canEndCheck = false;
                document.getElementById("exTime").style.display = "none";
              }
            }}
          />
          <br />
          <span class="text-gray-400"
            >Sale can end once the raised amount hits the minimumRaise.</span
          >
        </div>
      </FormPanel>

      <FormPanel>
        <div>
          <span> Sale Extra Time: </span>
          <Switch
            bind:checked={canEndCheck}
            on:change={() => {
              if (canEndCheck) {
                document.getElementById("exTime").style.display = "block";
                afterMinimumRaiseCheck = false;
              } else document.getElementById("exTime").style.display = "none";
            }}
          />
          <br />
          <span class="text-gray-400"
            >Specify extra time for the sale that can continue for, if the
            raised amount reaches a certain amount before the sale's normal end
            time.</span
          >
        </div>
        <div
          id="exTime"
          style="display:none"
          class="flex w-full flex-col gap-y-4"
        >
          <Input
            type="number"
            bind:this={fields.extraTime}
            bind:value={extraTime}
            validator={defaultValidator}
          >
            <span slot="label"> Extra Time: </span>
            <span slot="description">
              Specify the amount of extra time (in mnutes) you want the raise to
              run if you have raised X amount before end of the raise.</span
            >
          </Input>
          <br />
          <Input
            type="number"
            bind:this={fields.extraTimeAmount}
            bind:value={extraTimeAmount}
            validator={defaultValidator}
          >
            <span slot="label"> Extra Time trigger amount: </span>
            <span slot="description">
              Specify the amount that needs to be raised before the end of the
              raise for extra time to get activated.</span
            >
          </Input>
          <br /><br />
          <span> Extra Time Discount: </span>
          <Switch
            bind:checked={extraTimeDiscountCheck}
            on:change={() => {
              if (extraTimeDiscountCheck)
                document.getElementById("exDis").style.display = "block";
              else document.getElementById("exDis").style.display = "none";
            }}
          />
          <br />
          <span class="text-gray-400"
            >Discount on price for wallets that have purchased certain amount of
            rTKNs during the raise.</span
          >
          <br />
          <div id="exDis" style="display:none">
            <br />
            <Input
              type="range"
              bind:this={fields.extraTimeDiscount}
              bind:value={extraTimeDiscount}
              validator={defaultValidator}
              min="0"
              max="99"
            >
              <span slot="label"> Discount: {extraTimeDiscount}%</span>
            </Input>
            <br />
            <Input
              type="number"
              bind:this={fields.extraTimeDiscountThreshold}
              bind:value={extraTimeDiscountThreshold}
              validator={defaultValidator}
            >
              <span slot="label"> Discount Threshold: </span>
              <span slot="description">
                Amount that each wallet had to be purchased to be eligible for
                the extra time discount.</span
              >
            </Input>
          </div>
        </div>
      </FormPanel>

      <FormPanel>
        <div>
          <span>Tier Discount:</span>
          <Switch
            bind:checked={tierDiscountCheck}
            on:change={() => {
              if (tierDiscountCheck)
                document.getElementById("tierDis").style.display = "block";
              else {
                document.getElementById("tierDis").style.display = "none";
                tierDiscountActCheck = false;
              }
            }}
          />
          <br />
          <span class="text-gray-400"
            >Discount on price for tiered wallets based on the tier they hold.</span
          >
        </div>
        <div id="tierDis" style="display:none" class="w-full">
          <br />
          <Input
            type="address"
            bind:this={fields.tierDiscountAddress}
            bind:value={tierDiscountAddress}
            validator={defaultValidator}
            errorMsg={tierDiscountError?.errorMsg}
          >
            <span slot="label">Tier Contract Address: </span>
            <span slot="description">
              The address of the tier contract you want to provide the price
              discounts for.
            </span>
          </Input>
          <br /><br />
          <div class="grid w-full grid-cols-1 items-start">
            <table>
              <tr class="grid w-full grid-cols-2 gap-x-4">
                <td>
                  <span>Tier Discount Perk (percentage)</span><br />
                  <span class="text-gray-400"
                    >Discount on price for holding a certain teir.</span
                  >
                </td>
                <td>
                  <span>Perk Activation Time (Block)</span>
                  <Switch bind:checked={tierDiscountActCheck} />
                  <br />
                  <sapn class="text-gray-400"
                    >Duration of time tier must be held for the perk to
                    activate.</sapn
                  >
                </td>
              </tr><br />
              <tr class="grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="range"
                    bind:this={fields.discountTier1}
                    bind:value={discountTier1}
                    validator={defaultValidator}
                    min="0"
                    max="99"
                  >
                    <span slot="description">
                      Tier 1 Discount: <span style="color:whitesmoke"
                        >{discountTier1}%</span
                      ></span
                    >
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.discountActTier1}
                    bind:value={discountActTier1}
                    validator={defaultValidator}
                    disabled={!tierDiscountActCheck}
                  >
                    <span slot="description"> Tier 1 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="range"
                    bind:this={fields.discountTier2}
                    bind:value={discountTier2}
                    validator={defaultValidator}
                    min="0"
                    max="99"
                  >
                    <span slot="description">
                      Tier 2 Discount: <span style="color:whitesmoke"
                        >{discountTier2}%</span
                      ></span
                    >
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.discountActTier2}
                    bind:value={discountActTier2}
                    validator={defaultValidator}
                    disabled={!tierDiscountActCheck}
                  >
                    <span slot="description"> Tier 2 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="range"
                    bind:this={fields.discountTier3}
                    bind:value={discountTier3}
                    validator={defaultValidator}
                    min="0"
                    max="99"
                  >
                    <span slot="description">
                      Tier 3 Discount: <span style="color:whitesmoke"
                        >{discountTier3}%</span
                      ></span
                    >
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.discountActTier3}
                    bind:value={discountActTier3}
                    validator={defaultValidator}
                    disabled={!tierDiscountActCheck}
                  >
                    <span slot="description"> Tier 3 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="range"
                    bind:this={fields.discountTier4}
                    bind:value={discountTier4}
                    validator={defaultValidator}
                    min="0"
                    max="99"
                  >
                    <span slot="description">
                      Tier 4 Discount: <span style="color:whitesmoke"
                        >{discountTier4}%</span
                      ></span
                    >
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.discountActTier4}
                    bind:value={discountActTier4}
                    validator={defaultValidator}
                    disabled={!tierDiscountActCheck}
                  >
                    <span slot="description"> Tier 4 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="range"
                    bind:this={fields.discountTier5}
                    bind:value={discountTier5}
                    validator={defaultValidator}
                    min="0"
                    max="99"
                  >
                    <span slot="description">
                      Tier 5 Discount: <span style="color:whitesmoke"
                        >{discountTier5}%</span
                      ></span
                    >
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.discountActTier5}
                    bind:value={discountActTier5}
                    validator={defaultValidator}
                    disabled={!tierDiscountActCheck}
                  >
                    <span slot="description"> Tier 5 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="range"
                    bind:this={fields.discountTier6}
                    bind:value={discountTier6}
                    validator={defaultValidator}
                    min="0"
                    max="99"
                  >
                    <span slot="description">
                      Tier 6 Discount: <span style="color:whitesmoke"
                        >{discountTier6}%</span
                      ></span
                    >
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.discountActTier6}
                    bind:value={discountActTier6}
                    validator={defaultValidator}
                    disabled={!tierDiscountActCheck}
                  >
                    <span slot="description"> Tier 6 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="range"
                    bind:this={fields.discountTier7}
                    bind:value={discountTier7}
                    validator={defaultValidator}
                    min="0"
                    max="99"
                  >
                    <span slot="description">
                      Tier 7 Discount: <span style="color:whitesmoke"
                        >{discountTier7}%</span
                      ></span
                    >
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.discountActTier7}
                    bind:value={discountActTier7}
                    validator={defaultValidator}
                    disabled={!tierDiscountActCheck}
                  >
                    <span slot="description"> Tier 7 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="range"
                    bind:this={fields.discountTier8}
                    bind:value={discountTier8}
                    validator={defaultValidator}
                    min="0"
                    max="99"
                  >
                    <span slot="description">
                      Tier 8 Discount: <span style="color:whitesmoke"
                        >{discountTier8}%</span
                      ></span
                    >
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.discountActTier8}
                    bind:value={discountActTier8}
                    validator={defaultValidator}
                    disabled={!tierDiscountActCheck}
                  >
                    <span slot="description"> Tier 8 Duration:</span>
                  </Input>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </FormPanel>

      <FormPanel>
        <div class="grid w-full grid-cols-1 items-start">
          <table class="table-fixed">
            <tr>
              <td>
                Max Cap Per Wallet:
                <Switch bind:checked={maxCapCheck} on:change={MaxCapHandler} />
              </td>
            </tr><span class="text-gray-400"
              >The maximum number of raise tokens purchaseable by each eligible
              address.</span
            >
            <tr>
              <td id="capMax" style="display:none">
                <Input
                  type="number"
                  bind:this={fields.maxWalletCap}
                  bind:value={maxWalletCap}
                  validator={defaultValidator}
                >
                  <span slot="description" />
                </Input>
              </td>
            </tr>
            <br /><br />
            <tr>
              <td>
                Min Cap Per Wallet:
                <Switch
                  bind:checked={minCapCheck}
                  on:change={() => {
                    if (minCapCheck) {
                      document.getElementById("capMin").style.display = "block";
                    } else
                      document.getElementById("capMin").style.display = "none";
                  }}
                />
              </td>
            </tr>
            <span class="text-gray-400"
              >The minimum number of raise tokens purchaseable by each eligible
              address.</span
            >
            <tr>
              <td id="capMin" style="display:none">
                <Input
                  type="number"
                  bind:this={fields.minWalletCap}
                  bind:value={minWalletCap}
                  validator={defaultValidator}
                />
              </td>
            </tr>
          </table>
        </div>
      </FormPanel>

      <FormPanel>
        <div>
          <span>Tier Max Cap Per Wallet Multiplier:</span>
          <Switch
            bind:checked={tierCapMulCheck}
            on:change={() => {
              if (tierCapMulCheck) {
                document.getElementById("tierCapMul").style.display = "block";
                maxCapCheck = true;
                MaxCapHandler();
              } else {
                document.getElementById("tierCapMul").style.display = "none";
                tierCapMulActCheck = false;
              }
            }}
          />
          <br />
          <span class="text-gray-400"
            >Multiplier for Max Cap Per Wallet for tiered wallets based on the
            tier they hold.</span
          >
          <br />
          <span class="text-gray-400"
            >*Max Cap Per Wallet must be specified for this tier perk.</span
          >
        </div>
        <div id="tierCapMul" style="display:none" class="w-full">
          <br />
          <Input
            type="address"
            bind:this={fields.tierCapMulAddress}
            bind:value={tierCapMulAddress}
            validator={defaultValidator}
            errorMsg={tierCapMulError?.errorMsg}
          >
            <span slot="label">Tier Contract Address: </span>
            <span slot="description">
              The address of the tier contract you want to provide the max
              wallet cap multiplier for.
            </span>
          </Input>
          <br /><br />
          <div class="grid w-full grid-cols-1 items-start">
            <table>
              <tr class="grid w-full grid-cols-2 gap-x-4">
                <td>
                  <span>Tier Cap Multiplier Perk (2 decimals max)</span>
                  <br />
                  <span class="text-gray-400"
                    >Multiplier for max cap per wallet for holding a certain
                    teir.</span
                  >
                </td>
                <td>
                  <span>Perk Activation Period (Block)</span>
                  <Switch bind:checked={tierCapMulActCheck} />
                  <br />
                  <sapn class="text-gray-400"
                    >Duration of time tier must be held for the perk to
                    activate.</sapn
                  >
                </td>
              </tr><br />
              <tr class="grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="number"
                    bind:this={fields.capMulTier1}
                    bind:value={capMulTier1}
                    validator={defaultValidator}
                  >
                    <span slot="description"> Tier 1 Multiplier:</span>
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.capMulActTier1}
                    bind:value={capMulActTier1}
                    validator={defaultValidator}
                    disabled={!tierCapMulActCheck}
                  >
                    <span slot="description"> Tier 1 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="number"
                    bind:this={fields.capMulTier2}
                    bind:value={capMulTier2}
                    validator={defaultValidator}
                  >
                    <span slot="description"> Tier 2 Multiplier:</span>
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.capMulActTier2}
                    bind:value={capMulActTier2}
                    validator={defaultValidator}
                    disabled={!tierCapMulActCheck}
                  >
                    <span slot="description"> Tier 2 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="number"
                    bind:this={fields.capMulTier3}
                    bind:value={capMulTier3}
                    validator={defaultValidator}
                  >
                    <span slot="description"> Tier 3 Multiplier:</span>
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.capMulActTier3}
                    bind:value={capMulActTier3}
                    validator={defaultValidator}
                    disabled={!tierCapMulActCheck}
                  >
                    <span slot="description"> Tier 3 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="number"
                    bind:this={fields.capMulTier4}
                    bind:value={capMulTier4}
                    validator={defaultValidator}
                  >
                    <span slot="description"> Tier 4 Multiplier:</span>
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.capMulActTier4}
                    bind:value={capMulActTier4}
                    validator={defaultValidator}
                    disabled={!tierCapMulActCheck}
                  >
                    <span slot="description"> Tier 4 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="number"
                    bind:this={fields.capMulTier5}
                    bind:value={capMulTier5}
                    validator={defaultValidator}
                  >
                    <span slot="description"> Tier 5 Multiplier:</span>
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.capMulActTier5}
                    bind:value={capMulActTier5}
                    validator={defaultValidator}
                    disabled={!tierCapMulActCheck}
                  >
                    <span slot="description"> Tier 5 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="number"
                    bind:this={fields.capMulTier6}
                    bind:value={capMulTier6}
                    validator={defaultValidator}
                  >
                    <span slot="description"> Tier 6 Multiplier:</span>
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.capMulActTier6}
                    bind:value={capMulActTier6}
                    validator={defaultValidator}
                    disabled={!tierCapMulActCheck}
                  >
                    <span slot="description"> Tier 6 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="number"
                    bind:this={fields.capMulTier7}
                    bind:value={capMulTier7}
                    validator={defaultValidator}
                  >
                    <span slot="description"> Tier 7 Multiplier:</span>
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.capMulActTier7}
                    bind:value={capMulActTier7}
                    validator={defaultValidator}
                    disabled={!tierCapMulActCheck}
                  >
                    <span slot="description"> Tier 7 Duration:</span>
                  </Input>
                </td>
              </tr>
              <tr class="m-top grid w-full grid-cols-2 gap-x-4">
                <td>
                  <Input
                    type="number"
                    bind:this={fields.capMulTier8}
                    bind:value={capMulTier8}
                    validator={defaultValidator}
                  >
                    <span slot="description"> Tier 8 Multiplier:</span>
                  </Input>
                </td>
                <td id="disAct">
                  <Input
                    type="number"
                    bind:this={fields.capMulActTier8}
                    bind:value={capMulActTier8}
                    validator={defaultValidator}
                    disabled={!tierCapMulActCheck}
                  >
                    <span slot="description"> Tier 8 Duration:</span>
                  </Input>
                </td>
              </tr>
            </table>
          </div>
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
            If set to anything other than the zero address, all unsold rTKN will
            be forwarded to this address at the end of the raise. If the minimum
            raise is 0, this must be set to something other than the zero
            address.
          </span>
        </Input>

        <Input
          type="address"
          bind:this={fields.tier}
          bind:value={tier}
          validator={defaultValidator}
          errorMsg={tierError.errorMsg}
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
          <Button
            disabled={tierError?.errorMsg ||
              tierDiscountError?.errorMsg ||
              tierCapMulError?.errorMsg ||
              !raiseRange}
            shrink
            on:click={handleClick}>Deploy Sale</Button
          >
          {#if !tierError?.errorMsg && !tierDiscountError?.errorMsg && !tierCapMulError?.errorMsg && !raiseRange}
            <span class="text-red-400"
              >Please Select Date/Time For The Sale</span
            >
          {:else if tierError?.errorMsg || tierDiscountError?.errorMsg || tierCapMulError?.errorMsg}
            <span class="text-red-400"
              >Please Fill The Fields With Valid Data To Deploy The Sale</span
            >
          {/if}
        {:else}
          <ContractDeploy {deployPromise} type="Sale" />
        {/if}
      </FormPanel>
    {/if}
  </div>

  <div class="flex w-2/5 flex-col gap-y-4">
    {#if saleVals && saleType}
      <span class="relative">
        <FormPanel>
          <SaleSmallSimulationChart
            saleType={saleType.value}
            {saleVals}
            {reserveErc20}
          />
        </FormPanel>
      </span>
    {/if}
    {#if FriendlySource && saleType}
      <span class="sticky">
        <FormPanel heading="Human Readable Source">
          <HumanReadable
            signer={$signerAddress}
            contractType="sale"
            {FriendlySource}
          />
        </FormPanel>
      </span>
    {/if}
  </div>
</div>

<style>
  .m-top {
    margin-top: 15px;
  }

  span.relative {
    margin-top: 52px;
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
