<script lang="ts">
  import { formatUnits, Logger, parseUnits } from "ethers/lib/utils";
  import Button from "../../../components/Button.svelte";
  import Steps from "../../../components/steps/Steps.svelte";
  import Ring from "../../../components/Ring.svelte";
  import { selectedNetwork } from "src/stores";
  import Input from "src/components/Input.svelte";
  import { RedeemableERC20ClaimEscrow } from "rain-sdk";
  import { signer } from "svelte-ethers-store";

  enum TxStatus {
    None,
    AwaitingSignature,
    AwaitingConfirmation,
    Error,
  }
  enum PriceConfirmed {
    Pending,
    Confirmed,
  }

  enum UndepositSteps {
    Confirm,
    Complete,
  }

  export let data,
    salesContract,
    errorMsg,
    activeStep = UndepositSteps.Confirm,
    txStatus = TxStatus.None,
    txReceipt;

  let priceConfirmed = PriceConfirmed.Pending,
    units,
    calcPricePromise;

  const calculatePrice = async (amount) => {
    priceConfirmed = PriceConfirmed.Pending;
    const _amountUnits = parseUnits(
      amount.toString(),
      data.token.decimals.toString()
    );

    if (_amountUnits <= data.totalRemaining) {
      const one = parseUnits("1", data.token.decimals.toString());
      const _units = parseUnits(
        amount.toString(),
        data.token.decimals.toString()
      );
      units = _units;
      priceConfirmed = PriceConfirmed.Confirmed;

      return { _units };
    } else {
      return false;
    }
  };

  const unDeposit = async () => {
    let tx;
    txStatus = TxStatus.AwaitingSignature;

    let redeemableEscrow = await RedeemableERC20ClaimEscrow.get(
      salesContract.address,
      data.token.id,
      $signer
    );

    try {
      tx = await redeemableEscrow.undeposit(data.redeemableSupply, units);

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
    activeStep = UndepositSteps.Complete;

    return txReceipt;
  };
</script>

{#if txStatus == TxStatus.None}
  <div class="flex w-600 flex-col items-start gap-y-7">
    <span class="text-xl font-bold">Undeposit</span>
    <Steps
      steps={["Confirm", "Complete"]}
      {activeStep}
      fulfilledTextClass="text-gray-100"
      lineBorderClass="border-gray-400"
    />

    {#if activeStep == UndepositSteps.Confirm}
      <Input
        type="number"
        on:input={({ detail }) => {
          calcPricePromise = calculatePrice(detail);
        }}
        debounce
      >
        <span slot="label">Enter the number of units to undeposit:</span>
      </Input>

      {#if calcPricePromise}
        <div>
          {#await calcPricePromise}
            Getting price...
          {:then result}
            {#if result == false}
              <div class="flex flex-row gap-x-3">
                <span>Amount exceeds the limit</span>
              </div>
            {:else}
              <div class="flex flex-row gap-x-3">
                <span
                  >Price: {Number(
                    (+formatUnits(result._units, data.token.decimals)).toFixed(
                      4
                    )
                  )}
                  {data.token.symbol}</span
                >
              </div>
            {/if}
          {/await}
        </div>
      {/if}
      <span>Confirm your Undeposit.</span>
      <Button disabled={!priceConfirmed} on:click={unDeposit}>Confirm</Button>
    {/if}

    {#if activeStep == UndepositSteps.Complete}
      <span>Undeposit confirmed!</span>
      <a
        class="text-blue-400 underline"
        target="_blank"
        href={`${$selectedNetwork.blockExplorer}/tx/${txReceipt?.transactionHash}`}
      >
        See transaction.
      </a>
    {/if}
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
