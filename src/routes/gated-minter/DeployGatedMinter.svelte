<script lang="ts">
import {
    signer
} from 'svelte-ethers-store';
import {
    BigNumber,
    BigNumberish,
    ethers
} from 'ethers';

import {
    onMount
} from 'svelte';
import GatedMinterCreator from '../../abis/ApprovingSingleEditionMintableCreator.json'
import {
    GATED_SINGLE_EDITION_CREATOR
} from '../../constants';
import FormPanel from '../../components/FormPanel.svelte';
import Input from '../../components/Input.svelte';
import Button from '../../components/Button.svelte';
import {
    isAddress
} from 'ethers/lib/utils';
import {
    imageUrlValidate,
    minimumStatusValidate,
    nameValidate,
    royaltyPercentValidate,
    tierValidate,
    animationUrlValidate,
    descriptionValidate,
    symbolValidate
} from './minter-validation';

type EditionArgs = {
    name: string,
    symbol: string,
    description: string,
    animationUrl: string,
    animationHash: string,
    imageUrl: string,
    imageHash: string,
    editionSize: BigNumberish,
    royaltyBPS: BigNumberish,
    tier: string,
    minimumStatus: number
}
export let params

let tx, deployPromise, nftContract, nftWrapperContract, tierAddress

// arguments for the edition
let editionSize = 0
let fields: any = {}
const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"

const _gatedMinterCreatorContract = new ethers.Contract(GATED_SINGLE_EDITION_CREATOR, GatedMinterCreator.abi)
const gatedMinterCreatorContract = _gatedMinterCreatorContract.connect($signer)

$: if (params.wild) { tierAddress = params.wild }

const deployNFTedition = async () => {
    let fieldValues: any = {}
    const validations = Object.keys(fields).map(key => {
        const validationResult = fields[key].validate()
        fieldValues[key] = validationResult.value
        return validationResult
    })
    if (validations.every(validation => validation.ok)) {
        console.log(fieldValues)
        fieldValues.royaltyBPS = BigNumber.from(Math.floor(fieldValues.royaltyPercent * 100))
        delete fieldValues.royaltyPercent
        fieldValues.editionSize = BigNumber.from(0)
        fieldValues.imageHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
        fieldValues.animationHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
        let tx = await gatedMinterCreatorContract.createEdition(
            fieldValues.name,
            fieldValues.symbol,
            fieldValues.description,
            fieldValues.animationUrl,
            fieldValues.animationHash,
            fieldValues.imageUrl,
            fieldValues.imageHash,
            fieldValues.editionSize,
            fieldValues.royaltyBPS,
            fieldValues.tier,
            fieldValues.minimumStatus
        )
        const receipt = await tx.wait()
        console.log(receipt)
        receipt.events.forEach(event => {
            if (event.event == 'CreatedApprovingEdition') {
                console.log(event)
                const eventInfo = ethers.utils.defaultAbiCoder.decode(['uint256', 'address', 'address'], event.data)
                nftContract = eventInfo[2]
                nftWrapperContract = eventInfo[1]
                console.log(eventInfo)
            }
        })
        console.log(receipt)
    }
}

const handleClick = () => {
    deployPromise = deployNFTedition()
}
</script>
<div class="max-w-prose flex flex-col gap-y-4">
    <div class="flex flex-col gap-y-2 mb-2">
        <span class="text-2xl">
            Create a new gated edition.
        </span>
        <span class="text-gray-400">
            Fill out the details below to configure a new edition. These details will then be used to create a new contract specifically for your NFTs. These can then be minted by anyone who has the minimum tier status for the Tier contract you choose.
        </span>
    </div>
    <FormPanel heading="NFT Edition information">
        <Input type="text" bind:this={fields.name} validator={nameValidate}>
        <span slot="label">
            Name:
        </span>
        </Input>

        <Input type="text" bind:this={fields.symbol} validator={symbolValidate}>
        <span slot="label">
            Symbol:
        </span>
        </Input>

        <Input type="text" bind:this={fields.description} validator={descriptionValidate}>
        <span slot="label">
            Description:
        </span>
        </Input>

        <Input type="text" bind:this={fields.animationUrl} validator={animationUrlValidate}>
        <span slot="label">
            Animation URL:
        </span>
        <span slot="description">
            Optional: Add your media file here for the NFT: mp3 or wav audio file, mp4 or mov video file, 3d gltf file, and html webpages are supported.
        </span>
        </Input>

        <Input type="text" bind:this={fields.imageUrl} validator={imageUrlValidate}>
        <span slot="label">
            Image URL:
        </span>
        <span slot="description">
            An image or image preview of the NFT. Needs to be an image file type and will be used for all NFTs in this edition.
        </span>
        </Input>

        <Input type="number" bind:this={fields.royaltyPercent} validator={royaltyPercentValidate}>
        <span slot="label">
            Royalty Percent:
        </span>
        </Input>

        <Input type="text" bind:this={fields.tier} bind:value={tierAddress} validator={tierValidate}>
        <span slot="label">
            Tier:
        </span>
        <span slot="description">
            The address of a Tier contract to gate with.
        </span>
        </Input>

        <Input type="number" bind:this={fields.minimumStatus} validator={minimumStatusValidate}>
        <span slot="label">
            Minimum Status:
        </span>
        </Input>
        <Button shrink on:click={handleClick}>
            Mint NFT Edition
        </Button>
        {#if deployPromise}
        <div class="text-blue-300 flex flex-col gap-y-2">
            {#await deployPromise}
            ...deploying
            {:then}
            deployed
            <span>NFT contract: {nftContract}</span>
            <span>Wrapper contract: {nftWrapperContract}</span>
            {/await}
        </div>
        {/if}
    </FormPanel>
</div>
