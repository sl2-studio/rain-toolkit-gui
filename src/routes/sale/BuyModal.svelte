<script lang="ts">
  import { formatUnits, parseUnits } from "ethers/lib/utils";
  import Button from "../../components/Button.svelte";
  import Steps from "../../components/steps/Steps.svelte";
  import Ring from "../../components/Ring.svelte";
  import { BigNumber, ethers, logger } from "ethers";
  import Input from "src/components/Input.svelte";
  import { selectedNetwork } from "src/stores";
  import { BuyConfig } from "rain-sdk";

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
  interface SaleData {
    cooldownDuration: string;
    token: {
      decimals: string;
      symbol: string;
    };
    reserve: {
      decimals: string;
      symbol: string;
    };
  }

  export let signer, sale, saleData: SaleData;

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
    const one = parseUnits("1", saleData.token.decimals.toString());
    const _units = parseUnits(
      amount.toString(),
      saleData.token.decimals.toString()
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
                >Price: {Number(
                  (+formatUnits(
                    result.subtotal,
                    saleData.reserve.decimals
                  )).toFixed(4)
                )}

                {saleData.reserve.symbol}</span
              >
              <span
                >Fee: {Number(
                  (+formatUnits(result.fee, saleData.reserve.decimals)).toFixed(
                    4
                  )
                )}
                <!-- {saleData.reserve.symbol} -->
              </span>
              <span
                >Total: {Number(
                  (+formatUnits(
                    result.total,
                    saleData.reserve.decimals
                  )).toFixed(4)
                )}
                {saleData.reserve.symbol}</span
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
          href={`${$selectedNetwork.blockExplorer}/block/${
            parseInt(saleData.cooldownDuration) + txReceipt.blockNumber
          }`}
        >
          {parseInt(saleData.cooldownDuration) + txReceipt.blockNumber}
        </a>.
      </span>
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
