<script lang="ts">
  import { formatUnits, parseUnits } from "ethers/lib/utils";
  import Button from "../../../components/Button.svelte";
  import Steps from "../../../components/steps/Steps.svelte";
  import Ring from "../../../components/Ring.svelte";
  import { selectedNetwork } from "src/stores";
  import Input from "src/components/Input.svelte";

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

  export let escrow,
    data,
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
    const one = parseUnits("1", data.token.decimals.toString());
    const _units = parseUnits(
      amount.toString(),
      data.token.decimals.toString()
    );
    units = _units;
    const price = await salesContract.calculatePrice(_units);
    const subtotal = price.mul(_units).div(one);
    priceConfirmed = PriceConfirmed.Confirmed;

    return {
      subtotal,
    };
  };

  const unDeposit = async () => {
    let tx;
    txStatus = TxStatus.AwaitingSignature;

    try {
      tx = await escrow.undeposit(
        salesContract.address,
        data.token.id,
        data.redeemableSupply,
        units
      );
    } catch (error) {
      errorMsg = error.data?.message || error?.message;
      txStatus = TxStatus.Error;
      return;
    }

    txStatus = TxStatus.AwaitingConfirmation;
    txReceipt = await tx.wait();

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
            <div class="flex flex-row gap-x-3">
              <span
                >Price: {formatUnits(result.subtotal, data.token.decimals)}
                {data.token.symbol}</span
              >
            </div>
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
