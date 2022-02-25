<script lang="ts">
  import { signerAddress } from "svelte-ethers-store";
  import { signer } from "svelte-ethers-store";
  import Button from "src/components/Button.svelte";
  import FormPanel from "src/components/FormPanel.svelte";
  import Input from "src/components/Input.svelte";
  import { getNewChildFromReceipt, validateFields } from "src/utils";
  import { defaultValidator } from "../gated-nft/minter-validation";
  import VerifyFactoryArtifact from "abis/VerifyFactory.json";
  import VerifyTierFactoryArtifact from "abis/VerifyTierFactory.json";
  import { ethers } from "ethers";
  import { VERIFY_FACTORY, VERIFY_TIER_FACTORY } from "src/constants";

  export const roles = [
    {
      role: "Approver Admin",
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("APPROVER_ADMIN")),
    },
    {
      role: "Approver",
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("APPROVER")),
    },
    {
      role: "Remover Admin",
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REMOVER_ADMIN")),
    },
    {
      role: "Remover",
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REMOVER")),
    },
    {
      role: "Banner Admin",
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BANNER_ADMIN")),
    },
    {
      role: "Banner",
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BANNER")),
    },
  ];

  console.log(roles);

  let verifyFields: any = {},
    verifyTierFields: any = {},
    deployVerifyPromise,
    deployVerifyTierPromise,
    verifyChild,
    verifyTierChild;

  const deployVerify = async () => {
    const verifyFactory = new ethers.Contract(
      VERIFY_FACTORY,
      VerifyFactoryArtifact.abi,
      $signer
    );
    const { validationResult, fieldValues } = validateFields(verifyFields);
    console.log(fieldValues);
    const tx = await verifyFactory.createChildTyped(fieldValues.adminAddress);
    const receipt = await tx.wait();
    verifyChild = getNewChildFromReceipt(receipt, verifyFactory);
  };

  const deployVerifyTier = async () => {
    const verifyTierFactory = new ethers.Contract(
      VERIFY_TIER_FACTORY,
      VerifyTierFactoryArtifact.abi,
      $signer
    );
    const { validationResult, fieldValues } = validateFields(verifyTierFields);
    console.log(fieldValues);
    const tx = await verifyTierFactory.createChildTyped(
      fieldValues.verifyAddress
    );
    const receipt = await tx.wait();
    verifyTierChild = getNewChildFromReceipt(receipt, verifyTierFactory);
  };
</script>

<div class="flex max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl">Deploy a Verify and VerifyTier</span>
    <span class="text-gray-400">
      A Verify contract stores the status of addresses (Approved, Banned,
      Removed). Admins with the respective roles can update the status for an
      account. An address should be provided that will initially be given the
      ApproverAdmin, RemoverAdmin and BannerAdmin roles. This account can then
      give this permission to other addresses.
    </span>
    <span class="text-gray-400">
      A VerifyTier contract adapts the statuses from a Verify contract into an
      ITier interface, and can be used to gate raises, NFT mints or combined
      with a CombineTier.
    </span>
  </div>
  <FormPanel heading="Deploy a Verify">
    <Input
      type="text"
      bind:this={verifyFields.adminAddress}
      validator={defaultValidator}
      value={$signerAddress}
    >
      <span slot="label">Admin address: </span>
      <span slot="description"
        >The address that will be initially be given all three admin roles,
        Approver, Remover, Banner.</span
      >
    </Input>
    <Button
      shrink
      on:click={() => {
        deployVerifyPromise = deployVerify();
      }}>Deploy</Button
    >

    {#if deployVerifyPromise}
      <div class="flex flex-col gap-y-2 text-blue-300">
        {#await deployVerifyPromise}
          ...deploying
        {:then}
          deployed
          <span>Verify contract: {verifyChild}</span>
        {/await}
      </div>
    {/if}
  </FormPanel>

  <FormPanel heading="Deploy a VerifyTier">
    <Input
      type="text"
      bind:this={verifyTierFields.verifyAddress}
      validator={defaultValidator}
      value={verifyChild}
    >
      <span slot="label">Verify address: </span>
      <span slot="description"
        >The address of the Verify contract that state will be taken from for
        this VerifyTier</span
      >
    </Input>
    <Button
      shrink
      on:click={() => {
        deployVerifyTierPromise = deployVerifyTier();
      }}>Deploy</Button
    >

    {#if deployVerifyTierPromise}
      <div class="flex flex-col gap-y-2 text-blue-300">
        {#await deployVerifyTierPromise}
          ...deploying
        {:then}
          deployed
          <span>VerifyTier contract: {verifyTierChild}</span>
        {/await}
      </div>
    {/if}
  </FormPanel>
</div>
