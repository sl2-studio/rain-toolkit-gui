<script lang="ts">
  import Select from "src/components/Select.svelte";
  import Steps from "../../components/steps/Steps.svelte";
  import { selectedNetwork } from "src/stores";
  import { signerAddress } from "svelte-ethers-store";
  import { ethers } from "ethers";
  import Input from "../../components/Input.svelte";
  import Button from "../../components/Button.svelte";
  import Ring from "../../components/Ring.svelte";
  import Switch from "src/components/Switch.svelte";
  import { ERC20TransferTier, ERC20 } from "rain-sdk";
  import { getContext } from "svelte";
  import { Logger } from "ethers/lib/utils";

  const { close } = getContext("simple-modal");

  export let transferTierContract: ERC20TransferTier,
    erc20Contract: ERC20,
    currentTier;

  let tierValue: { value: number; label: string } = null,
    senderAddress = "";
  let checked = false,
    setTier = false,
    tierCheck = false;

  enum TxStatus {
    None,
    AwaitingSignature,
    AwaitingConfirmation,
    Error,
  }

  enum TransferTierSetSteps {
    Approve,
    Confirm,
    Complete,
  }

  enum TransferTierUnSetSteps {
    Approve,
    Confirm,
    Complete,
  }

  enum PriceConfirmed {
    Pending,
    Confirmed,
  }

  let errorMsg,
    activeStep = TransferTierSetSteps.Approve,
    txStatus = TxStatus.None,
    txReceipt;

  const tierValues = [
    { value: 2, label: "Tier Level 2" },
    { value: 3, label: "Tier Level 3" },
    { value: 4, label: "Tier Level 4" },
    { value: 5, label: "Tier Level 5" },
    { value: 6, label: "Tier Level 6" },
    { value: 7, label: "Tier Level 7" },
    { value: 8, label: "Tier Level 8" },
  ];

  const handleChange = async () => {
    tierCheck = currentTier > tierValue.value;
  };
  const approve = async () => {
    let tx;
    txStatus = TxStatus.AwaitingSignature;

    const approvedAmount = await transferTierContract.amountToTier(
      $signerAddress,
      tierValue.value
    );
    await erc20Contract.allowance($signerAddress, transferTierContract.address);
    try {
      tx = await transferTierContract.approveTokenForTier(approvedAmount);
      txStatus = TxStatus.AwaitingConfirmation;
      const txReceipt = await tx.wait();
    } catch (error) {
      if (error.code === Logger.errors.TRANSACTION_REPLACED) {
        if (error.cancelled) {
          errorMsg = "Transaction Cancelled";
          txStatus = TxStatus.Error;
          return;
        } else {
          txReceipt = await error.replacement.wait();
        }
      } else {
        errorMsg = error.data?.message || error?.message;
        txStatus = TxStatus.Error;
        return;
      }
    }

    txStatus = TxStatus.None;
    activeStep = TransferTierSetSteps.Confirm;
  };

  const updateTier = async () => {
    let tx;
    txStatus = TxStatus.AwaitingSignature;
    let address = checked ? senderAddress : $signerAddress;

    if (ethers.utils.isAddress(address)) {
      try {
        tx = await transferTierContract.setTier(address, tierValue.value, []);
        txStatus = TxStatus.AwaitingConfirmation;

        txReceipt = await tx.wait();
      } catch (error) {
        if (error.code === Logger.errors.TRANSACTION_REPLACED) {
          if (error.cancelled) {
            errorMsg = "Transaction Cancelled";
            txStatus = TxStatus.Error;
            return;
          } else {
            txReceipt = await error.replacement.wait();
          }
        } else {
          errorMsg = error.data?.message || error?.message;
          txStatus = TxStatus.Error;
          return;
        }
      }

      txStatus = TxStatus.None;
      activeStep = TransferTierSetSteps.Complete;
    } else {
      errorMsg = "Not a valid Ethereum address";
    }
  };

  const unsetTier = async () => {
    tierValue = { value: 1, label: "Tier Level 1" };
    updateTier();
  };
</script>

{#if txStatus == TxStatus.None}
  <div class="flex w-full flex-col items-start gap-y-7">
    <div>
      <span
        >{#if setTier}Set the Tier{:else}Unset the Tier{/if}</span
      >
      <Switch
        bind:checked={setTier}
        on:change={() => {
          if (setTier) {
            document.getElementById("tierSet").style.display = "none";
            document.getElementById("tierUnSet").style.display = "flex";
          } else {
            document.getElementById("tierSet").style.display = "flex";
            document.getElementById("tierUnSet").style.display = "none";
          }
        }}
      />
      <div class="pt-2 text-gray-400">
        If switched off, you can able to unset the tier i.e, the Tier Level 1.
      </div>
      <div class="pt-1 pb-1 text-gray-400">
        If switched on, you can able to set the tier to any Tier Level from
        Level 2 to Level 8 you want to.
      </div>
    </div>
    <div id="tierSet" style="display:flex" class="flex w-full flex-col gap-y-4">
      <Steps
        steps={["Approve", "Confirm", "Complete"]}
        {activeStep}
        fulfilledTextClass="text-gray-100"
        lineBorderClass="border-gray-400"
      />
      {#if activeStep == TransferTierSetSteps.Approve}
        <div class="gap-y-2">
          <span>Add Other Ethereum Address</span>
          <Switch
            bind:checked
            on:change={() => {
              if (checked)
                document.getElementById("ethAddress").style.display = "block";
              else document.getElementById("ethAddress").style.display = "none";
            }}
          />
        </div>
        <div
          id="ethAddress"
          style="display:none"
          class="flex w-full flex-col gap-y-4"
        >
          <Input
            type="address"
            placeholder="Enter an Ethereum address"
            bind:value={senderAddress}
          >
            <span slot="label">Enter an Ethereum account address: </span>
          </Input>
        </div>

        <Select
          items={tierValues}
          bind:value={tierValue}
          on:change={handleChange}
        >
          <span slot="label"> Select The Tier Level: </span>
        </Select>

        <div class="flex flex-row gap-x-2">
          <Button
            shrink
            on:click={!tierCheck ? approve : updateTier}
            disabled={tierValue === null ||
              (checked ? senderAddress === "" : false)}
          >
            {#if !tierCheck}
              Approve the Allowance
            {:else}
              Set the Tier
            {/if}
          </Button>
        </div>
      {/if}
      {#if activeStep == TransferTierSetSteps.Confirm}
        <span>Click on below button to increase the tier Level.</span>
        <div class="flex flex-row gap-x-2">
          <Button shrink on:click={updateTier}>Set the Tier</Button>
        </div>
      {/if}
      {#if activeStep == TransferTierSetSteps.Complete}
        <span>Purchase confirmed!</span>
        <a
          class="text-blue-400 underline"
          target="_blank"
          href={`${$selectedNetwork.blockExplorer}/tx/${txReceipt?.transactionHash}`}
        >
          See transaction.
        </a>
        {close()}
      {/if}
    </div>
    <div
      id="tierUnSet"
      style="display:none"
      class="flex w-full flex-col gap-y-4"
    >
      <span>
        Please confirm the Unsetting of Tier by clicking on below button
      </span>
      <div class="flex flex-row gap-x-2">
        <Button shrink on:click={unsetTier}>UnSet the Tier</Button>
      </div>
    </div>
  </div>
{/if}

{#if txStatus == TxStatus.AwaitingSignature}
  <div class="flex flex-col items-center gap-y-5 p-6">
    <Ring color="#fff" />
    <span class="text-lg">Awaiting signature...</span>
  </div>
{/if}
{#if txStatus == TxStatus.AwaitingConfirmation}
  <div class="flex flex-col items-center gap-y-5 p-6">
    <Ring color="#fff" />
    <span class="text-lg">Transaction confirming...</span>
  </div>
{/if}
{#if txStatus == TxStatus.Error}
  <div class="flex flex-col items-center gap-y-5 p-6">
    <span class="text-lg">Something went wrong.</span>
    <span class="text-lg text-red-400">{errorMsg}</span>
  </div>
{/if}
