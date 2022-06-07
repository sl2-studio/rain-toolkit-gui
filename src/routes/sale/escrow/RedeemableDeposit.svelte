<script lang="ts">
  import { Contract } from "ethers";
  import Button from "../../../components/Button.svelte";
  import FormPanel from "../../../components/FormPanel.svelte";
  import { getContext } from "svelte";
  import DepositModal from "./DepositModal.svelte";

  const { open } = getContext("simple-modal");

  export let saleData;
  export let sale: Contract;
</script>

<FormPanel heading="Deposit Escrow">
  <Button
    on:click={() => {
      open(DepositModal, { sale, saleData });
    }}>Deposit</Button
  >
</FormPanel>
