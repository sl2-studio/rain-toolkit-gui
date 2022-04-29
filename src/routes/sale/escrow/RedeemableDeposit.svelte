<script lang="ts">
  import { BigNumber, Contract, ethers, Signer } from "ethers";
  import Button from "../../../components/Button.svelte";
  import FormPanel from "../../../components/FormPanel.svelte";
  import { getContext } from "svelte";
  import DepositModal from "./DepositModal.svelte";

  const { open } = getContext("simple-modal");

  export let saleData;
  export let sale: Contract;
  export let escrow: Contract;
</script>

<FormPanel heading="Deposit Escrow">
  <Button
    on:click={() => {
      open(DepositModal, { sale, saleData, escrow });
    }}>Deposit</Button
  >
</FormPanel>
