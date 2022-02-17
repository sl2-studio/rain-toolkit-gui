<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import { BigNumber, BigNumberish, ethers } from "ethers";
  import GatedNFTFactoryArtifact from "../../abis/GatedNFTFactory.json";
  import { BLOCK_EXPLORER, GATED_NFT_FACTORY } from "../../constants";
  import FormPanel from "../../components/FormPanel.svelte";
  import Input from "../../components/Input.svelte";
  import Button from "../../components/Button.svelte";
  import {
    imageUrlValidate,
    minimumStatusValidate,
    nameValidate,
    royaltyPercentValidate,
    tierValidate,
    animationUrlValidate,
    descriptionValidate,
    symbolValidate,
    defaultValidator,
  } from "./minter-validation";
  import Select from "../../components/Select.svelte";
  import { addressValidate } from "../../validation";

  type GatedNFTTokenConfig = {
    name: string;
    symbol: string;
    description: string;
    animationUrl: string;
    animationHash: string;
    imageUrl: string;
    imageHash: string;
  };

  enum Transferrable {
    NonTransferrable,
    Transferrable,
    TierGatedTransferrable,
  }

  type GatedNFTConfig = {
    config_: GatedNFTTokenConfig;
    tier_: string;
    minimumStatus_: BigNumberish;
    maxPerAddress_: BigNumberish;
    transferrable_: Transferrable;
    maxMintable_: BigNumberish;
    royaltyRecipient_: string;
    royaltyBPS_: BigNumberish;
  };

  const transferrableOptions = [
    {
      value: 0,
      label: "Non-transferrable",
    },
    {
      value: 1,
      label: "Transferrable",
    },
    {
      value: 2,
      label: "Gated transferrable",
    },
  ];

  export let params;

  let deployPromise, nftContract, tierAddress;

  // arguments for the gated NFT config
  let fields: any = {};

  // zerohash - using this in place of actual image/animation hashes
  const zeroHash =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  const gatedNftFactory = new ethers.Contract(
    GATED_NFT_FACTORY,
    GatedNFTFactoryArtifact.abi,
    $signer
  );

  $: if (params.wild) {
    tierAddress = params.wild;
  }

  const deployGatedNft = async () => {
    let fieldValues: any = {};
    const validations = Object.keys(fields).map((key) => {
      const validationResult = fields[key].validate();
      fieldValues[key] = validationResult.value;
      return validationResult;
    });
    if (validations.every((validation) => validation.ok)) {
      console.log(fieldValues);

      fieldValues.royaltyBPS = BigNumber.from(
        Math.floor(fieldValues.royaltyPercent * 100)
      );
      delete fieldValues.royaltyPercent;
      fieldValues.imageHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      fieldValues.animationHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      console.log(fieldValues);
      const tokenConfig: GatedNFTTokenConfig = {
        name: fieldValues.name,
        symbol: fieldValues.symbol,
        description: fieldValues.description,
        animationUrl: fieldValues.animationUrl,
        animationHash: fieldValues.animationHash,
        imageUrl: fieldValues.imageUrl,
        imageHash: fieldValues.imageHash,
      };
      const config: GatedNFTConfig = {
        config_: tokenConfig,
        tier_: fieldValues.tier,
        minimumStatus_: fieldValues.minimumStatus,
        maxPerAddress_: fieldValues.maxPerAddress,
        transferrable_: fieldValues.transferrable.value,
        maxMintable_: fieldValues.maxMintable,
        royaltyRecipient_: fieldValues.royaltyRecipient,
        royaltyBPS_: fieldValues.royaltyBPS,
      };
      console.log(gatedNftFactory);
      let tx = await gatedNftFactory.createChildTyped(
        tokenConfig,
        fieldValues.tier,
        fieldValues.minimumStatus,
        fieldValues.maxPerAddress,
        fieldValues.transferrable.value,
        fieldValues.maxMintable,
        fieldValues.royaltyRecipient,
        fieldValues.royaltyBPS
      );

      const receipt = await tx.wait();

      receipt.events.forEach((event) => {
        if (event.event == "NewChild") {
          nftContract = ethers.utils.defaultAbiCoder.decode(
            ["address", "address"],
            event.data
          )[1];
        }
      });

      return receipt;
    }
  };

  const handleClick = () => {
    deployPromise = deployGatedNft();
  };
</script>

<div class="flex max-w-prose flex-col gap-y-4">
  <div class="mb-2 flex flex-col gap-y-2">
    <span class="text-2xl"> Create a GatedNFT. </span>
    <span class="text-gray-400">
      Fill out the details below to configure a new gated ERC721. All tokens in
      the new ERC721 will be identical. These can then be minted by anyone who
      has the minimum tier status for the Tier contract you choose.
    </span>
  </div>
  <FormPanel heading="NFT token information">
    <Input
      type="text"
      bind:this={fields.name}
      validator={nameValidate}
      value="test nft"
    >
      <span slot="label"> Name: </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.symbol}
      validator={symbolValidate}
      value="nft"
    >
      <span slot="label"> Symbol: </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.description}
      validator={descriptionValidate}
      value="nft description"
    >
      <span slot="label"> Description: </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.animationUrl}
      validator={animationUrlValidate}
    >
      <span slot="label"> Animation URL: </span>
      <span slot="description">
        Optional: Add your media file here for the NFT: mp3 or wav audio file,
        mp4 or mov video file, 3d gltf file, and html webpages are supported.
      </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.imageUrl}
      validator={imageUrlValidate}
      value="https://thumbs.dreamstime.com/b/gold-badge-5392868.jpg"
    >
      <span slot="label"> Image URL: </span>
      <span slot="description">
        An image or image preview of the NFT. Needs to be an image file type and
        will be used for all NFTs in this edition.
      </span>
    </Input>

    <Input
      type="text"
      bind:this={fields.royaltyRecipient}
      validator={addressValidate}
      value={$signerAddress}
    >
      <span slot="label"> Royalty recipient: </span>
      <span slot="description">
        The address that royalties will be paid to by supporting secondary
        marketplaces. Note that tokens that are "Non-transferrable" or "Gated
        transferrable" cannot be re-sold.
      </span>
    </Input>

    <Input
      type="number"
      bind:this={fields.royaltyPercent}
      validator={royaltyPercentValidate}
      value="10"
    >
      <span slot="label"> Royalty Percent: </span>
    </Input>
  </FormPanel>
  <FormPanel heading="NFT minting/transferring rules">
    <Input
      type="number"
      bind:this={fields.maxMintable}
      validator={defaultValidator}
      value="10"
    >
      <span slot="label"> Maximum supply: </span>
      <span slot="description">
        The maximum number of tokens that can ever be minted.
      </span>
    </Input>

    <Input
      type="number"
      bind:this={fields.maxPerAddress}
      validator={defaultValidator}
      value="2"
    >
      <span slot="label"> Max per address: </span>
      <span slot="description">
        The maximum number of tokens that be minted for each address.
      </span>
    </Input>

    <Select
      items={transferrableOptions}
      bind:this={fields.transferrable}
      value="0"
    >
      <span slot="label"> Transferrable: </span>
      <span slot="description">
        Whether this GatedNFT is non-transferrable, transferrable to anyone, or
        only transferrable to other accounts that meet the same Tier
        requirements for minting.
      </span>
    </Select>

    <Input
      type="text"
      bind:this={fields.tier}
      validator={tierValidate}
      value="0xcd953b94999808ee07a33860dd46689580c90cf4"
    >
      <span slot="label"> Tier: </span>
      <span slot="description">
        The address of a Tier contract to gate with.
      </span>
    </Input>

    <Input
      type="number"
      bind:this={fields.minimumStatus}
      validator={minimumStatusValidate}
      value="2"
    >
      <span slot="label"> Minimum Status: </span>
    </Input>
  </FormPanel>
  <FormPanel>
    <Button shrink on:click={handleClick}>Create GatedNFT</Button>
    {#if deployPromise}
      <div class="flex flex-col gap-y-2 text-blue-300">
        {#await deployPromise}
          ...deploying
        {:then receipt}
          <span>
            New GatedNFT deployed at:
            <a
              target="_blank"
              href={`${BLOCK_EXPLORER}/address/${nftContract}`}
            >
              {nftContract}
            </a>
          </span>
          <span>
            <a
              target="_blank"
              class="underline"
              href={`${BLOCK_EXPLORER}/tx/${receipt.transactionHash}`}
            >
              See transaction.
            </a>
          </span>
        {/await}
      </div>
    {/if}
  </FormPanel>
</div>
