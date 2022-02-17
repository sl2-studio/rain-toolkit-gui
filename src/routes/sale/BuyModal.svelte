<script lang="ts">
  import { formatUnits, parseUnits } from "ethers/lib/utils";
  import Button from "components/Button.svelte";
  import Steps from "components/steps/Steps.svelte";
  import { BLOCK_EXPLORER } from "src/constants";
  import Ring from "components/Ring.svelte";
  import { BigNumber, ethers } from "ethers";
  import Input from "src/components/Input.svelte";

  enum TxStatus {
    None,
    AwaitingSignature,
    AwaitingConfirmation,
    Error,
  }

  enum BuySteps {
    Confirm,
    Complete,
  }

  enum PriceConfirmed {
    Pending,
    Confirmed,
  }

  export let signer, token, reserve, sale;

  let units,
    fee,
    activeStep = BuySteps.Confirm,
    txStatus = TxStatus.None,
    priceConfirmed = PriceConfirmed.Pending,
    txReceipt,
    errorMsg,
    calcPricePromise;

  const calculatePrice = async (amount) => {
    priceConfirmed = PriceConfirmed.Pending;
    const one = parseUnits("1", token.erc20decimals.toString());
    const _units = parseUnits(
      amount.toString(),
      token.erc20decimals.toString()
    );
    units = _units;
    const price = await sale.calculatePrice(_units);
    const subtotal = price.mul(_units).div(one);
    fee = subtotal.div(BigNumber.from(100));
    const total = subtotal.add(fee);

    priceConfirmed = PriceConfirmed.Confirmed;

    return {
      subtotal,
      fee,
      total,
    };
  };

  const buy = async () => {
    console.log(signer);
    const buyConfig = {
      feeRecipient: $signer._address, // should be set to platform fee recipient
      fee: fee,
      minimumUnits: units,
      desiredUnits: units,
      maximumPrice: ethers.constants.MaxUint256,
    };

    let tx;
    txStatus = TxStatus.AwaitingSignature;

    try {
      tx = await sale.buy(buyConfig);
    } catch (error) {
      errorMsg = error.data?.message || error?.message;
      txStatus = TxStatus.Error;
      return;
    }

    txStatus = TxStatus.AwaitingConfirmation;

    txReceipt = await tx.wait();
    txStatus = TxStatus.None;
    activeStep = BuySteps.Complete;
  };
</script>

{#if txStatus == TxStatus.None}
  <div class="flex w-600 flex-col items-start gap-y-7">
    <span class="text-xl font-bold">Buy</span>

    <Steps
      steps={["Confirm", "Complete"]}
      {activeStep}
      fulfilledTextClass="text-gray-100"
      lineBorderClass="border-gray-400"
    />

    {#if activeStep == BuySteps.Confirm}
      <Input
        type="number"
        on:input={({ detail }) => {
          calcPricePromise = calculatePrice(detail);
        }}
        debounce
      >
        <span slot="label">Enter the number of units to buy:</span>
      </Input>
      {#if calcPricePromise}
        <div>
          {#await calcPricePromise}
            Getting price...
          {:then result}
            <div class="flex flex-row gap-x-3">
              <span
                >Price: {formatUnits(result.subtotal, reserve.erc20decimals)}
                {reserve.erc20symbol}</span
              >
              <span
                >Fee: {formatUnits(result.fee, reserve.erc20decimals)}
                {reserve.erc20symbol}</span
              >
              <span
                >Total: {formatUnits(result.total, reserve.erc20decimals)}
                {reserve.erc20symbol}</span
              >
            </div>
          {/await}
        </div>
      {/if}
      <Button disabled={!priceConfirmed} on:click={buy}>Buy</Button>
    {/if}

    {#if activeStep == BuySteps.Complete}
      <span>Purchase confirmed!</span>
      <span
        >You will not be able to make another purchase or refund until block
        <a
          class="text-blue-400 underline"
          target="_blank"
          href={`${BLOCK_EXPLORER}/block/${
            parseInt(sale.cooldownDuration) + txReceipt.blockNumber
          }`}
        >
          {parseInt(sale.cooldownDuration) + txReceipt.blockNumber}
        </a>.
      </span>
      <a
        class="text-blue-400 underline"
        target="_blank"
        href={`${BLOCK_EXPLORER}/tx/${txReceipt?.transactionHash}`}
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
