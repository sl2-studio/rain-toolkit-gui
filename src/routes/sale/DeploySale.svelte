<script lang="ts">
import {
BigNumber,
    ethers
} from 'ethers';

import {
    concat,
    formatUnits,
    parseUnits
} from 'ethers/lib/utils';

import {
    signer
} from 'svelte-ethers-store';
import Button from "../../components/Button.svelte";

import FormPanel from "../../components/FormPanel.svelte";
import Input from "../../components/Input.svelte";
import {
    getERC20,
    op,
    validateFields
} from "../../utils";
import {
afterTimestampConfig,
    Opcode,
    saleDeploy
} from './sale';
import {DatePicker, CalendarStyle} from "@beyonk/svelte-datepicker"

let fields: any = {}
let deployPromise
let sale, token
let reserveErc20

// some default values for testing
let recipient = "0xf6CF014a3e92f214a3332F0d379aD32bf0Fae929"
let reserve = "0x25a4dd4cd97ed462eb5228de47822e636ec3e31a"
let startBlock = 24407548
let cooldownDuration = 100
let saleTimeout = 100
let minimumRaise = 1000
let price = 10
let name = "Raise token"
let symbol = "rTKN"
let initialSupply = 1000
let tier = "0xC064055DFf6De32f44bB7cCB0ca59Cbd8434B2de"
let minimumStatus = 0
let raiseRange

$: console.log(Math.floor(raiseRange?.[0].$d.getTime()/1000))

// @TODO write validators
const defaultValidator = () => {
    return true
}

const handleClick = async () => {
    deployPromise = deploy()
}

const deploy = async () => {
    const {
        validationResult,
        fieldValues
    } = validateFields(fields)
    console.log(fieldValues)
    const staticPrice = parseUnits(fieldValues.price.toString(), reserveErc20.erc20decimals)

    const constants = [staticPrice]
    const v10 = op(Opcode.VAL, 0)

    const sources = [concat([v10])];

    if (validationResult) {
        ([sale, token] = await saleDeploy(
            $signer, {
                canStartStateConfig: afterTimestampConfig(Math.floor(raiseRange?.[0].$d.getTime()/1000)),
                canEndStateConfig: afterTimestampConfig(Math.floor(raiseRange?.[1].$d.getTime()/1000)),
                calculatePriceStateConfig: {
                    sources,
                    constants,
                    stackLength: 1,
                    argumentsLength: 0,
                },
                recipient: fieldValues.recipient,
                reserve: fieldValues.reserve,
                cooldownDuration: parseInt(fieldValues.cooldownDuration),
                minimumRaise: parseUnits(fieldValues.minimumRaise.toString(), reserveErc20.erc20decimals),
                dustSize: 0,
            }, {
                erc20Config: {
                    name: fieldValues.name,
                    symbol: fieldValues.symbol,
                    distributor: ethers.constants.AddressZero,
                    initialSupply: parseUnits(fieldValues.initialSupply.toString(), reserveErc20.erc20decimals),
                },
                tier: fieldValues.tier,
                minimumTier: fieldValues.minimumStatus,
            }
        ))

        console.log(sale, token)
    }
}
const getReserveErc20 = async () => {
    if (fields.reserve.validate()) {
        reserveErc20 = await getERC20(reserve, $signer)
        console.log(reserveErc20)
    }
}

$: if (reserve && fields?.reserve) {
    getReserveErc20()
}
</script>

<div class="flex flex-col gap-y-4 w-3/4">
    <div class="flex flex-col gap-y-2 mb-2">
        <span class="text-2xl">
            Create a new Sale.
        </span>
        <span class="text-gray-400">
            ...
        </span>
    </div>
    <FormPanel heading="Sale config">
        <Input type="text" bind:this={fields.recipient} bind:value={recipient} validator={defaultValidator}>
        <span slot="label">
            Recipient:
        </span>
        </Input>

        <Input type="text" bind:this={fields.reserve} bind:value={reserve} validator={defaultValidator}>
        <span slot="label">
            Reserve token:
        </span>
        <span slot="description">
            {#if reserveErc20}
            <div class="flex flex-col gap-y-1">
                <span>Name: {reserveErc20.erc20name}</span>
                <span>Symbol: {reserveErc20.erc20symbol}</span>
                <span>Your balance: {formatUnits(reserveErc20.erc20balance, reserveErc20.erc20decimals.toString())}</span>
            </div>
            {/if}
        </span>
        </Input>

        <span class="w-full flex flex-col gap-y-3 z-20">
            <span>Raise start/end time</span>
            <DatePicker styling={new CalendarStyle({buttonWidth: "100%"})} bind:selected={raiseRange} time={true} range={true} placeholder="Select date/time" format="DD / MM / YYYY hh:mm"></DatePicker>
            <span></span>
        </span>

        <Input type="number" bind:this={fields.cooldownDuration} bind:value={cooldownDuration} validator={defaultValidator}>
        <span slot="label">
            Cool down duration (in blocks):
        </span>
        </Input>

        <Input type="number" bind:this={fields.minimumRaise} bind:value={minimumRaise} validator={defaultValidator}>
        <span slot="label">
            Minimum raise:
        </span>
        </Input>

        <Input type="number" bind:this={fields.price} bind:value={price} validator={defaultValidator}>
        <span slot="label">
            Price:
        </span>
        </Input>
    </FormPanel>

    <FormPanel heading="RedeemableERC20 config">
        <Input type="text" bind:this={fields.name} bind:value={name} validator={defaultValidator}>
        <span slot="label">
            Name:
        </span>
        </Input>

        <Input type="text" bind:this={fields.symbol} bind:value={symbol} validator={defaultValidator}>
        <span slot="label">
            Symbol:
        </span>
        </Input>

        <Input type="number" bind:this={fields.initialSupply} bind:value={initialSupply} validator={defaultValidator}>
        <span slot="label">
            Initial supply:
        </span>
        </Input>

        <Input type="text" bind:this={fields.tier} bind:value={tier} validator={defaultValidator}>
        <span slot="label">
            Tier:
        </span>
        <span slot="description">
            The address of a Tier contract to gate with.
        </span>
        </Input>

        <Input type="number" bind:this={fields.minimumStatus} bind:value={minimumStatus} validator={defaultValidator}>
        <span slot="label">
            Minimum Status:
        </span>
        </Input>
    </FormPanel>

    <FormPanel>
        <Button shrink on:click={handleClick}>
            Deploy Sale
        </Button>

        {#if deployPromise}
        <div class="text-blue-300 flex flex-col gap-y-2">
            {#await deployPromise}
            ...deploying
            {:then}
            deployed
            <span>Sale contract: {sale.address}</span>
            <span>RedeemableERC20 token address: {token.address}</span>
            {/await}
        </div>
        {/if}
    </FormPanel>

</div>
