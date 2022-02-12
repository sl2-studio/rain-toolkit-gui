<script lang="ts" type="module">
  import { signer } from 'svelte-ethers-store'
  import Button from '../../components/Button.svelte'
  import CombineTierFactoryArtifact from '../../abis/CombineTierFactory.json'
  import FormPanel from '../../components/FormPanel.svelte'
  import Input from '../../components/Input.svelte'
  import { BLOCK_EXPLORER, COMBINE_TIER_FACTORY_ADDRESS } from '../../constants'
  import { concat } from 'ethers/lib/utils'
  import { op, selectLte, selectLteLogic, selectLteMode } from '../../utils'
  import { ContractReceipt, ethers } from 'ethers'
  import { addressValidate } from '../../validation'
  import Select from '../../components/Select.svelte'

  let tierContractOne: string,
    tierContractTwo: string,
    combineTierFactory,
    deployPromise: any,
    combineTierAddress: string

  const enum Opcode {
    END,
    VAL,
    DUP,
    ZIPMAP,
    BLOCK_NUMBER,
    BLOCK_TIMESTAMP,
    REPORT,
    NEVER,
    ALWAYS,
    DIFF,
    UPDATE_BLOCKS_FOR_TIER_RANGE,
    SELECT_LTE,
    ACCOUNT,
  }

  const logicOptions = [
    { value: selectLteLogic.any, label: 'Any' },
    { value: selectLteLogic.every, label: 'Every' },
  ]
  const modeOptions = [
    { value: selectLteMode.min, label: 'Min' },
    { value: selectLteMode.max, label: 'Max' },
    { value: selectLteMode.first, label: 'First' },
  ]

  let logicValue: { value: selectLteLogic; label: string },
    modeValue: { value: selectLteLogic; label: string }

  $: console.log(logicValue, modeValue)
  $: console.log(tierContractOne, tierContractTwo)

  const deployCombineTier = async () => {
    combineTierFactory = new ethers.Contract(COMBINE_TIER_FACTORY_ADDRESS, CombineTierFactoryArtifact.abi, $signer)

    // the tier contracts to combine
    const constants = [
      ethers.BigNumber.from(tierContractOne), // right report
      ethers.BigNumber.from(tierContractTwo), // left report
    ]

    const source = concat([
      op(Opcode.VAL, 1),
      op(Opcode.ACCOUNT),
      op(Opcode.REPORT),
      op(Opcode.VAL, 0),
      op(Opcode.ACCOUNT),
      op(Opcode.REPORT),
      op(Opcode.BLOCK_NUMBER),
      op(
        Opcode.SELECT_LTE,
        selectLte(logicValue.value, modeValue.value, 2)
      ),
    ]);

    const tx = await combineTierFactory.createChildTyped({
      sources: [source],
      constants,
      stackLength: 8,
      argumentsLength: 0,
    })

    const receipt = await tx.wait() as ContractReceipt

    receipt.events.forEach((event) => {
      if (event.event == 'NewChild') {
        combineTierAddress = ethers.utils.defaultAbiCoder.decode(
          ['address', 'address'],
          event.data,
        )[1]
      }
    })

    return receipt
  }

  const handleClick = () => {
    deployPromise = deployCombineTier()
  }
</script>

<div class="max-w-prose flex flex-col gap-y-4">
  <div class="flex flex-col gap-y-2 mb-2">
    <span class="text-2xl">Deploy a new CombineTier.</span>
    <span class="text-gray-400">
      Choose two Tier contracts and combine them to produce a new Tier contract.
    </span>
  </div>
  <FormPanel heading="CombineTier settings">
    <Input
      type="text"
      placeholder="Tier address"
      bind:value={tierContractOne}
      validator={addressValidate}>
      <span slot="label">Tier contract #1</span>
    </Input>

    <Input
      type="text"
      placeholder="Tier address"
      bind:value={tierContractTwo}
      validator={addressValidate}>
      <span slot="label">Tier contract #2</span>
    </Input>

    <Select items={logicOptions} bind:value={logicValue}>
      <span slot="label">
        To qualify for a certain status, does an address need to have that
        status in both tiers, or either tier?
      </span>
      <span slot="description">
        i.e. Tier 1 AND Tier 2, or Tier 1 OR Tier 2.
      </span>
    </Select>

    <Select items={modeOptions} bind:value={modeValue}>
      <span slot="label">
        If an address qualifies for a status, which block should be used for the
        new report?
      </span>
      <span slot="description">
        Some Tiers store the block that an address gained a certain status. Here
        you can select which Tiers blocks should be used, the earliest block
        they qualified, the latest block, or the block from the first of the two
        Tiers specified.
      </span>
    </Select>

    <Button shrink on:click={handleClick}>Deploy CombineTier</Button>
    <div class="mt-1 text-blue-400 flex flex-col gap-y-2">
      {#if deployPromise}
        {#await deployPromise}
          <span>Deploying...</span>
        {:then receipt}
          <span>
            New CombineTier deployed at:
            <a
              target="_blank"
              href={`${BLOCK_EXPLORER}/address/${combineTierAddress}`}>
              {combineTierAddress}
            </a>
          </span>
          <span>
            <a
              target="_blank"
              class="underline"
              href={`${BLOCK_EXPLORER}/tx/${receipt.transactionHash}`}>
              See transaction.
            </a>
          </span>
        {/await}
      {/if}
    </div>

  </FormPanel>
</div>
