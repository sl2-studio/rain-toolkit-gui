<script lang="ts">
  import { signer, signerAddress } from 'svelte-ethers-store'
  import Input from '../../components/Input.svelte'
  import { balanceTierFactory } from '../../stores'
  import ReserveToken from '../../abis/ReserveToken.json'
  import { ethers } from 'ethers'
import FormPanel from '../../components/FormPanel.svelte'
import Button from '../../components/Button.svelte'
import { getNewChildFromReceipt } from '../../utils';

  let erc20Address, erc20AddressError, erc20Contract, erc20name, erc20symbol, erc20balance, erc20decimals
  let balanceTierAddress, deployPromise
  let tiers = []
  $: console.log(tiers)

  $: if (erc20Address) {
    getERC20()
  }

  const getERC20 = async () => {
    if (ethers.utils.isAddress(erc20Address)) {
      erc20AddressError = null
      erc20Contract = new ethers.Contract(erc20Address, ReserveToken.abi)
      console.log($signer)
      erc20Contract = erc20Contract.connect($signer)
      console.log(erc20Contract)
      try {
        erc20name = await erc20Contract.name()
        erc20balance = await erc20Contract.balanceOf($signerAddress)
        erc20decimals = await erc20Contract.decimals()
      } catch {
        erc20AddressError = 'not a valid ERC20 token address'
      }
    } else {
      erc20AddressError = 'not a valid address'
    }
  }

  const deployBalanceTier = async () => {
    console.log(tiers)
    const parsedTiers = tiers.map(value => value ? ethers.utils.parseUnits(value.toString(), erc20decimals) : ethers.constants.MaxInt256)
    console.log(parsedTiers)
    console.log($balanceTierFactory)
    console.log(erc20Address)
    let tx = await $balanceTierFactory["createChild((address,uint256[8]))"]([erc20Contract.address, parsedTiers])
    const receipt = await tx.wait()
    console.log(receipt)
    receipt.events.forEach(event=>{
      if (event.event == 'NewChild') {
        balanceTierAddress = ethers.utils.defaultAbiCoder.decode(['address','address'], event.data)[1]
      }
    })
    // balanceTierAddress = getNewChildFromReceipt(receipt, $balanceTierFactory)
  }

  const handleClick = () => {
    deployPromise = deployBalanceTier()
  }
</script>

<FormPanel heading="Deploy a BalanceTier">
  <Input type="text" placeholder="address" bind:value={erc20Address}>
    <span slot="label">Choose an ERC20 token to check the balance of.</span>
    <span slot="description">
      {#if erc20AddressError}
      <span class="text-red-500">
        {erc20AddressError}
      </span>
      {:else if erc20name && erc20balance}
      <div class="flex flex-col gap-y-2 font-light text-gray-300">
        <span>Token name: {erc20name}</span>
        <span>Your balance: {erc20balance.toString()}</span>
      </div>
      {/if}
    </span>
  </Input>
  <div>
    <Input type="number" placeholder="Tier 1" bind:value={tiers[0]}>
      <span slot="label">Set the amount of token that must be held for each tiers.</span>
    </Input>
    <Input type="number" placeholder="Tier 2" bind:value={tiers[1]} />  
    <Input type="number" placeholder="Tier 3" bind:value={tiers[2]} />  
    <Input type="number" placeholder="Tier 4" bind:value={tiers[3]} />  
    <Input type="number" placeholder="Tier 5" bind:value={tiers[4]} />  
    <Input type="number" placeholder="Tier 6" bind:value={tiers[5]} />  
    <Input type="number" placeholder="Tier 7" bind:value={tiers[6]} />  
    <Input type="number" placeholder="Tier 8" bind:value={tiers[7]} />  
  </div>

  <Button shrink on:click={handleClick}>
    Deploy BalanceTier
  </Button>
  <div class="mt-1">
    {#if deployPromise}
    {#await deployPromise}
      ...deploying
    {:then}
      new BalanceTier deployed at {balanceTierAddress}
    {/await}
  {/if}
  </div>

  
</FormPanel>

