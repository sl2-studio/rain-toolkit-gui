<script lang="ts">
  import { formatAddress } from "src/utils";
  import Button from "../../../components/Button.svelte";
  import Steps from "../../../components/steps/Steps.svelte";
  import Ring from "../../../components/Ring.svelte";
  import { selectedNetwork } from "src/stores";
  import { signer } from "svelte-ethers-store";
  import { BigNumber, ethers } from "ethers";
  import ReserveTokenArtifact from "../../../abis/ReserveToken.json";

  enum TxStatus {
    None,
    AwaitingSignature,
    AwaitingConfirmation,
    Error,
  }

  enum SweepingSteps {
    Confirm,
    Complete,
  }

  export let escrow,
    data,
    errorMsg,
    activeStep = SweepingSteps.Confirm,
    txStatus = TxStatus.None,
    txReceipt;

  const sweep = async () => {
    let tx;
    txStatus = TxStatus.AwaitingSignature;
    try {
      tx = await escrow.sweepPending(data.depositorAddress);
    } catch (error) {
      errorMsg = error.data?.message || error?.message;
      txStatus = TxStatus.Error;
      return;
    }

    txStatus = TxStatus.AwaitingConfirmation;
    txReceipt = await tx.wait();

    txStatus = TxStatus.None;
    activeStep = SweepingSteps.Complete;

    return txReceipt;
  };
</script>

{#if txStatus == TxStatus.None}
  <div class="flex w-600 flex-col items-start gap-y-7">
    <span class="text-xl font-bold">Sweep Pending Deposit</span>
    <Steps
      steps={["Confirm", "Complete"]}
      {activeStep}
      fulfilledTextClass="text-gray-100"
      lineBorderClass="border-gray-400"
    />

    <div class="grid grid-cols-2 gap-4 rounded-md border border-gray-600 p-4">
      <span>Sale Address:</span>
      <span>{formatAddress(data.iSaleAddress)}</span>

      <span>Token Address:</span>
      <span>{formatAddress(data.token.id)}</span>

      <span>Depositor Address:</span>
      <span>{formatAddress(data.depositorAddress)}</span>
    </div>

    {#if activeStep == SweepingSteps.Confirm}
      <span>Confirm your Sweep Pending Deposit.</span>
      <Button on:click={sweep}>Confirm</Button>
    {/if}

    {#if activeStep == SweepingSteps.Complete}
      <span>Sweeping confirmed!</span>
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
