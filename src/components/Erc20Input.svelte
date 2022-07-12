<script lang="ts">
  import { formatUnits, isAddress } from "ethers/lib/utils";
  import { ERC20 } from "rain-sdk";

  import Input from "./Input.svelte";
  import Jazzicon from "./Jazzicon.svelte";

  let input;

  export let value, signer, contract, gotERC20;
  let name, symbol, decimals, balance;

  export const validate = () => {
    input?.validate();
  };

  const erc20validate = async (value) => {
    gotERC20 = null;
    if (value == "") {
      return { error: "Can't be blank" };
    }
    if (!isAddress(value)) {
      return { error: "Not a valid Ethereum address" };
    }

    if (!(await ERC20.isERC20(value, signer))) {
      return { error: "Not an ERC20 token for this chain" };
    }

    contract = new ERC20(value, signer);

    [name, symbol, decimals, balance] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(await signer.getAddress()),
    ]);

    balance = (+formatUnits(balance, decimals)).toFixed(4);

    gotERC20 = true;

    return true;
  };
</script>

<div class="w-full flex flex-col gap-y-2">
  <Input type="address" bind:value bind:this={input} validator={erc20validate}>
    <span slot="label"><slot name="label" /></span>
  </Input>
  {#if gotERC20}
    <div class="flex flex-row gap-x-2 items-center">
      <div
        class="flex flex-row gap-x-2 bg-gray-100 rounded-md p-1 text-sm border text-gray-800 items-center"
      >
        <Jazzicon address={contract.address} width={20} />
        {name} ({symbol})
      </div>
      <div>
        Balance: {balance}
      </div>
    </div>
  {/if}
</div>
