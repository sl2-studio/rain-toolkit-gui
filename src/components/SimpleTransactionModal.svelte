<script lang="ts">
  import { getContext, onMount } from "svelte";
  import Ring from "./Ring.svelte";
  import { selectedNetwork } from "src/stores";
  import { ContractReceipt } from "ethers";
  import Button from "./Button.svelte";

  enum TxStatus {
    None,
    AwaitingSignature,
    AwaitingConfirmation,
    Error,
    Confirmed,
  }

  const { close } = getContext("simple-modal");

  export let method: Function;
  export let args: any[];
  export let confirmationMsg: string;
  export let confirmedCallback: Function = () => {};
  let errorMsg: string, receipt: ContractReceipt, txStatus: TxStatus;

  onMount(async () => {
    let tx;

    txStatus = TxStatus.AwaitingSignature;

    try {
      tx = await method(...args);
    } catch (error) {
      errorMsg = error.data?.message || error?.message;
      txStatus = TxStatus.Error;
      return;
    }

    txStatus = TxStatus.AwaitingConfirmation;

    receipt = await tx.wait();

    confirmedCallback();

    txStatus = TxStatus.Confirmed;
  });
</script>

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
{#if txStatus == TxStatus.Confirmed}
  <div class="flex max-w-md flex-col items-center gap-y-5 p-6">
    <span class="text-lg">Transaction confirmed</span>
    <span>
      {confirmationMsg}
    </span>
    <a
      class="text-blue-400 underline"
      target="_blank"
      href={`${$selectedNetwork.blockExplorer}/tx/${receipt?.transactionHash}`}
    >
      See transaction.
    </a>
    <Button on:click={close}>Ok</Button>
  </div>
{/if}
{#if txStatus == TxStatus.Error}
  <div class="flex flex-col items-center gap-y-5 p-6">
    <span class="text-lg">Something went wrong.</span>
    <span class="text-lg text-red-400">{errorMsg}</span>
  </div>
{/if}
