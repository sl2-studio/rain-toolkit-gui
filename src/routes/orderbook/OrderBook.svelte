<script>
  import { signer } from "svelte-ethers-store";
  import FormPanel from "src/components/FormPanel.svelte";
  import CreateOrder from "./CreateOrder.svelte";
  import { OrderBook } from "rain-sdk";
  import { getContext, setContext } from "svelte";
  import { writable } from "svelte/store";
  import VaultDepositModal from "./VaultDepositModal.svelte";
  import Button from "src/components/Button.svelte";

  const { open } = getContext("simple-modal");

  // putting an OrderBook instance in context
  const orderbook = writable();
  setContext("orderbook", orderbook);

  const setOrderbook = async () => {
    $orderbook = await OrderBook.get($signer);
  };

  $: if ($signer) setOrderbook();
</script>

<div class="flex w-900 flex-col gap-y-4">
  <FormPanel heading="Create an order">
    <CreateOrder />
  </FormPanel>
  <FormPanel heading="Deposit into a vault">
    <Button
      on:click={() => {
        open(VaultDepositModal, { orderbook });
      }}>Deposit</Button
    >
  </FormPanel>
</div>
