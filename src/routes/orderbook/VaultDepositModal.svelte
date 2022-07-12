<script lang="ts">
  import { signer } from "svelte-ethers-store";
  import Button from "src/components/Button.svelte";
  import Steps from "src/components/steps/Steps.svelte";
  import Input from "src/components/Input.svelte";
  import { transactionModal } from "src/stores";
  import { OrderBook } from "rain-sdk";
  import Erc20Input from "src/components/Erc20Input.svelte";
  import { bind } from "svelte-simple-modal";
  import SimpleTransactionModal from "src/components/SimpleTransactionModal.svelte";
  import { Writable } from "svelte/store";
  import { parseUnits, randomBytes } from "ethers/lib/utils";
  import Jazzicon from "src/components/Jazzicon.svelte";
  import { getContext } from "svelte";

  const { close } = getContext("simple-modal");

  enum DepositSteps {
    Approve,
    Confirm,
    Complete,
  }

  export let tokenAddress: string =
    "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A";
  export let orderbook: Writable<OrderBook>;
  export let vaultId = null;

  let units,
    erc20Info,
    erc20Contract,
    activeStep = DepositSteps.Approve;

  $: console.log($orderbook);

  const approve = async () => {
    transactionModal.set(
      bind(SimpleTransactionModal, {
        method: erc20Contract.approve,
        args: [$orderbook.address, $signer.getAddress()],
        confirmationMsg: "Approval confirmed.",
        confirmedCallback: approveConfirmed,
      })
    );
  };

  // callback passed to SimpleTransaction modal for when the approve transaction is confirmed
  const approveConfirmed = () => {
    activeStep = DepositSteps.Confirm;
  };

  const deposit = async () => {
    // create a new random vaultId if a vault hasn't been selected
    const finalVaultId = vaultId || randomBytes(32);
    // create the amount
    const amount = parseUnits(units.toString(), erc20Info.decimals);

    transactionModal.set(
      bind(SimpleTransactionModal, {
        method: $orderbook.deposit,
        args: [{ token: erc20Contract.address, vaultId: finalVaultId, amount }],
        confirmationMsg: "Deposit confirmed.",
        confirmedCallback: depositConfirmed,
      })
    );
  };

  const depositConfirmed = () => {
    activeStep = DepositSteps.Complete;
  };
</script>

<div class="flex w-full flex-col items-start gap-y-7">
  <span class="text-xl font-bold">Deposit into a vault</span>
  <Steps
    steps={["Approve", "Confirm", "Complete"]}
    {activeStep}
    fulfilledTextClass="text-gray-100"
    lineBorderClass="border-gray-400"
  />

  {#if activeStep == DepositSteps.Approve}
    <div class="flex flex-col gap-y-2">
      <div class="font-light text-gray-100">Depositing into vault:</div>
      {#if !vaultId}
        <div class="text-gray-400">
          No vault selected. A new vault for this token will be created on
          deposit.
        </div>
      {/if}
    </div>

    <Erc20Input
      signer={$signer}
      bind:value={tokenAddress}
      bind:contract={erc20Contract}
      bind:erc20Info
    >
      <span slot="label">Enter a token address:</span>
    </Erc20Input>
    <Input type="number" bind:value={units} from="depositModal">
      <span slot="label">Number of units to deposit:</span>
    </Input>

    <Button on:click={approve}>Approve amount for Orderbook</Button>
  {/if}
  {#if activeStep == DepositSteps.Confirm}
    <span>Confirm your deposit.</span>
    <div class="border border-gray-600 p-4 rounded-md">
      <div class="grid grid-cols-2 gap-4">
        <span class="text-gray-400">Vault:</span>
        {#if !vaultId}
          <span>New vault</span>
        {/if}
        <span class="text-gray-400">Token:</span>
        <div class="flex flex-row gap-x-2 justify-items">
          <Jazzicon address={erc20Contract.address} width={20} />
          {erc20Info.name} ({erc20Info.symbol})
        </div>
        <span class="text-gray-400">Amount:</span>
        <span>{units}</span>
      </div>
    </div>
    <Button on:click={deposit}>Deposit</Button>
  {/if}
  {#if activeStep == DepositSteps.Complete}
    <span>Deposit confirmed.</span>
    <div class="border border-gray-600 p-4 rounded-md">
      <div class="grid grid-cols-2 gap-4">
        <span class="text-gray-400">Vault:</span>
        {#if !vaultId}
          <span>New vault</span>
        {/if}
        <span class="text-gray-400">Token:</span>
        <div class="flex flex-row gap-x-2 justify-items">
          <Jazzicon address={erc20Contract.address} width={20} />
          {erc20Info.name} ({erc20Info.symbol})
        </div>
        <span class="text-gray-400">Amount:</span>
        <span>{units}</span>
      </div>
    </div>
  {/if}
</div>
