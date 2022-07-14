<script>
  import { signer, signerAddress } from "svelte-ethers-store";
  import { OrderBook } from "rain-sdk";
  import { getContext, setContext } from "svelte";
  import { writable } from "svelte/store";
  import VaultDepositModal from "./VaultDepositModal.svelte";
  import Button from "src/components/Button.svelte";
  import ListVaults from "./ListVaults.svelte";
  import { Tabs, TabList, TabPanel, Tab } from "src/components/tabs/tabs";
  import CreateOrderModal from "./CreateOrderModal.svelte";
  import User from "src/components/User.svelte";

  const { open } = getContext("simple-modal");

  // putting an OrderBook instance in context
  const orderbook = writable();
  setContext("orderbook", orderbook);

  const setOrderbook = async () => {
    $orderbook = await OrderBook.get($signer);
  };

  $: if ($signer) setOrderbook();
</script>

<div class="flex flex-row justify-between align-top flex-grow">
  <div class="text-2xl">Manage Orders</div>
  <div class="flex flex-row gap-x-2 flex-shrink-0">
    <Button
      on:click={() => {
        open(VaultDepositModal, { orderbook });
      }}><span class="whitespace-nowrap">Deposit into a Vault</span></Button
    >
    <Button
      on:click={() => {
        open(CreateOrderModal, { orderbook });
      }}>Create an Order</Button
    >
  </div>
</div>

<div class="mt-8">
  <Tabs>
    <TabList>
      <Tab>My Orders</Tab>
      <Tab>My Vaults</Tab>
    </TabList>
    <TabPanel>test</TabPanel>
    <TabPanel>
      <ListVaults />
    </TabPanel>
  </Tabs>
</div>
