<script lang="ts">
  import { signer, signerAddress } from "svelte-ethers-store";
  import { BigNumber } from "ethers";
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
  import ContractDeploy from "src/components/ContractDeploy.svelte";
  import {
    GatedNFT,
    GatedConfig,
    GatedNFTDeployArguments,
  } from "rain-sdk";

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
      fieldValues.royaltyBPS = BigNumber.from(
        Math.floor(fieldValues.royaltyPercent * 100)
      );
      delete fieldValues.royaltyPercent;
      fieldValues.imageHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      fieldValues.animationHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const tokenConfig: GatedConfig = {
        name: fieldValues.name,
        symbol: fieldValues.symbol,
        description: fieldValues.description,
        animationUrl: fieldValues.animationUrl,
        animationHash: fieldValues.animationHash,
        imageUrl: fieldValues.imageUrl,
        imageHash: fieldValues.imageHash,
      };
      const gatedConfig: GatedNFTDeployArguments = {
        config: tokenConfig,
        tier: fieldValues.tier,
        minimumStatus: fieldValues.minimumStatus,
        maxPerAddress: fieldValues.maxPerAddress,
        transferrable: fieldValues.transferrable.value,
        maxMintable: fieldValues.maxMintable,
        royaltyRecipient: fieldValues.royaltyRecipient,
        royaltyBPS: fieldValues.royaltyBPS,
      };

      let newGatedNFT = await GatedNFT.deploy($signer, gatedConfig);

      return newGatedNFT;
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

    <Select items={transferrableOptions} bind:this={fields.transferrable}>
      <span slot="label"> Transferrable: </span>
      <span slot="description">
        Whether this GatedNFT is non-transferrable, transferrable to anyone, or
        only transferrable to other accounts that meet the same Tier
        requirements for minting.
      </span>
    </Select>

    <Input
      type="address"
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
    {#if !deployPromise}
      <Button shrink on:click={handleClick}>Create GatedNFT</Button>
    {:else}
      <ContractDeploy {deployPromise} type="GatedNFT" />
    {/if}
  </FormPanel>
</div>
