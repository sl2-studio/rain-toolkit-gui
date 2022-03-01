<script lang="ts">
  import { signer } from "svelte-ethers-store";
  import { formatUnits } from "ethers/lib/utils";
  import Button from "components/Button.svelte";
  import Steps from "components/steps/Steps.svelte";
  import Ring from "components/Ring.svelte";
  import { BigNumber, ethers } from "ethers";
  import ReserveTokenArtifact from "abis/ReserveToken.json";
  import { selectedNetwork } from "src/stores";

  enum TxStatus {
    None,
    AwaitingSignature,
    AwaitingConfirmation,
    Error,
  }

  enum RefundSteps {
    Approve,
    Confirm,
    Complete,
  }

  export let transaction,
    token,
    reserve,
    saleContract,
    sale,
    errorMsg,
    activeStep = RefundSteps.Approve,
    txStatus = TxStatus.None,
    txReceipt;

  const receipt = transaction.receipt;

  const approve = async () => {
    const rTKN = new ethers.Contract(
      token.id,
      ReserveTokenArtifact.abi,
      $signer
    );

    let tx;
    txStatus = TxStatus.AwaitingSignature;

    try {
      tx = await rTKN.approve(
        saleContract.address,
        BigNumber.from(receipt.units)
      );
    } catch (error) {
      errorMsg = error.data?.message || error?.message;
      txStatus = TxStatus.Error;
      return;
    }

    txStatus = TxStatus.AwaitingConfirmation;
    const txReceipt = await tx.wait();

    txStatus = TxStatus.None;
    activeStep = RefundSteps.Confirm;

    return txReceipt;
  };

  const refund = async () => {
    let tx;
    txStatus = TxStatus.AwaitingSignature;
    console.log(saleContract);
    console.log({
      id: BigNumber.from(receipt.receiptId),
      feeRecipient: receipt.feeRecipient,
      fee: BigNumber.from(receipt.fee),
      units: BigNumber.from(receipt.units),
      price: BigNumber.from(receipt.price),
    });
    try {
      tx = await saleContract.refund({
        id: BigNumber.from(receipt.receiptId),
        feeRecipient: receipt.feeRecipient,
        fee: BigNumber.from(receipt.fee),
        units: BigNumber.from(receipt.units),
        price: BigNumber.from(receipt.price),
      });
    } catch (error) {
      errorMsg = error.data?.message || error?.message;
      txStatus = TxStatus.Error;
      return;
    }

    txStatus = TxStatus.AwaitingConfirmation;
    txReceipt = await tx.wait();

    txStatus = TxStatus.None;
    activeStep = RefundSteps.Complete;

    return txReceipt;
  };
</script>

{#if txStatus == TxStatus.None}
  <div class="flex w-600 flex-col items-start gap-y-7">
    <span class="text-xl font-bold">Refund</span>

    <Steps
      steps={["Approve", "Confirm", "Complete"]}
      {activeStep}
      fulfilledTextClass="text-gray-100"
      lineBorderClass="border-gray-400"
    />

    <div class="grid grid-cols-2 gap-4 rounded-md border border-gray-600 p-4">
      <span>Refunding:</span>
      <span>
        {formatUnits(transaction.receipt.units, token.decimals)}
        {token.symbol}
      </span>
      <span>Total refund:</span>
      <span
        >{formatUnits(transaction.totalIn, reserve.decimals)}
        {reserve.symbol}</span
      >
    </div>

    {#if activeStep == RefundSteps.Approve}
      <span>Approve the sale contract to spend your {token.symbol}.</span>
      <Button on:click={approve}>Approve</Button>
    {/if}

    {#if activeStep == RefundSteps.Confirm}
      <span>Confirm your refund.</span>
      <span
        >You will not be able to make another purchase or refund for {sale.cooldownDuration}
        blocks.</span
      >
      <Button on:click={refund}>Confirm</Button>
    {/if}

    {#if activeStep == RefundSteps.Complete}
      <span>Refund confirmed!</span>
      <span
        >You will not be able to make another purchase or refund until block
        <a
          class="text-blue-400 underline"
          target="_blank"
          href={`${$selectedNetwork.blockExplorer}/block/${
            parseInt(sale.cooldownDuration) + txReceipt.blockNumber
          }`}
        >
          {parseInt(sale.cooldownDuration) + txReceipt.blockNumber}
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
