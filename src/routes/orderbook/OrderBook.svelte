<script>
  import { signer } from "svelte-ethers-store";
  import FormPanel from "src/components/FormPanel.svelte";
  import CreateOrder from "./CreateOrder.svelte";
  import { OrderBook } from "rain-sdk";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

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
</div>
