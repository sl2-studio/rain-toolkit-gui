<script lang="ts">
  import { BigNumber, ethers } from "ethers";
  import { signer, signerAddress } from "svelte-ethers-store";
  import Button from "components/Button.svelte";
  import FormPanel from "components/FormPanel.svelte";
  import { getContext, onMount } from "svelte";
  import BuyModal from "./BuyModal.svelte";
  import ApproveModal from "./ApproveModal.svelte";

  const { open } = getContext("simple-modal");

  export let sale;
  export let token;
  export let reserve;

  console.log(token);
  let approved, checkApprovalPromise;

  const checkApproval = async () => {
    const allowance = await reserve.erc20Contract.allowance(
      $signerAddress,
      sale.address
    );

    approved = allowance.gte(
      BigNumber.from(ethers.constants.MaxUint256).div(BigNumber.from(2))
    );
  };

  onMount(() => {
    checkApprovalPromise = checkApproval();
  });
</script>

<FormPanel heading="Buy rTKN">
  {#if checkApprovalPromise}
    {#await checkApprovalPromise}
      Checking allowance...
    {:then}
      {#if !approved}
        <Button
          on:click={() => {
            open(
              ApproveModal,
              { signer, reserve, sale },
              {},
              {
                onClosed: () => {
                  checkApprovalPromise = checkApproval();
                },
              }
            );
          }}
          >Approve
        </Button>
      {:else}
        <Button
          on:click={() => {
            open(BuyModal, { signer, sale, token, reserve });
          }}>Buy</Button
        >
      {/if}
    {/await}
  {/if}
</FormPanel>
