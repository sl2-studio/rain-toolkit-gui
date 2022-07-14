<script lang="ts">
  import Erc20Input from "src/components/Erc20Input.svelte";
  import { signer } from "svelte-ethers-store";
  import Input from "src/components/Input.svelte";
  import { defaultValidator } from "src/validation";
  import { OrderConfig, OrderBook, utils, ERC20 } from "rain-sdk";
  import { ethers } from "ethers";
  import { isAddress, parseUnits } from "ethers/lib/utils";
  import Button from "src/components/Button.svelte";
  import { getContext } from "svelte";
  import { Writable } from "svelte/store";
  import SimpleTransactionModal from "src/components/SimpleTransactionModal.svelte";

  const { open } = getContext("simple-modal");

  const { concat, op } = utils;

  export let orderbook;

  let inputToken,
    inputTokenContract,
    outputTokenContract,
    inputVaultId,
    outputToken,
    outputVaultId,
    askPriceInput;

  const placeOrder = async () => {
    // ASK ORDER
    const askPrice = parseUnits(
      askPriceInput.toString(),
      await inputTokenContract.decimals()
    );
    const askConstants = [ethers.constants.MaxUint256, askPrice];
    const vAskOutputMax = op(OrderBook.Opcodes.CONSTANT, 0);
    const vAskPrice = op(OrderBook.Opcodes.CONSTANT, 1);
    // prettier-ignore
    const askSource = concat([
      vAskOutputMax,
      vAskPrice,
    ]);

    const askOrderConfig: OrderConfig = {
      inputToken,
      inputVaultId,
      outputToken,
      outputVaultId,
      tracking: 0x0,
      vmStateConfig: {
        sources: [askSource],
        constants: askConstants,
      },
    };

    open(SimpleTransactionModal, {
      method: $orderbook.addOrder,
      args: [askOrderConfig],
      confirmationMsg: `Order added.`,
    });
  };
</script>

<Erc20Input
  bind:value={inputToken}
  signer={$signer}
  bind:contract={inputTokenContract}
>
  <span slot="label">Input token</span>
</Erc20Input>
<Input type="number" bind:value={inputVaultId} validator={defaultValidator}>
  <span slot="label">Input vault</span>
</Input>
<Erc20Input
  bind:value={outputToken}
  signer={$signer}
  bind:contract={outputTokenContract}
>
  <span slot="label">Output token</span>
</Erc20Input>
<Input type="number" bind:value={outputVaultId} validator={defaultValidator}>
  <span slot="label">Output vault</span>
</Input>
<Input type="number" bind:value={askPriceInput} validator={defaultValidator}>
  <span slot="label">Ask price</span>
</Input>
<Button on:click={placeOrder}>Place Order</Button>
