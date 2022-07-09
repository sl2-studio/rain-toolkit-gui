<script lang="ts">
  import { formatAddress } from "src/utils";
  import { queryStore } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import IconLibrary from "../../../components/IconLibrary.svelte";
  import Switch from "src/components/Switch.svelte";
  import EscrowUndepositModal from "./EscrowUndepositModal.svelte";
  import { client } from "src/stores";

  const { open } = getContext("simple-modal");
  export let salesContract, saleData;

  let checked = true;
  let temp;

  let saleAddress = salesContract ? salesContract.address.toLowerCase() : undefined;
  let depositor = $signerAddress.toLowerCase();

  $: allUndepositQuery = queryStore({
      client: $client,
      query: `
        query ($saleAddress: Bytes!) {
          redeemableEscrowSupplyTokenDepositors (where: {iSaleAddress: $saleAddress}, orderBy: totalDeposited, orderDirection: asc) {
            id
            iSaleAddress
            iSale{
              saleStatus
            }
            escrowAddress
            depositorAddress
            token {
              id
              name
              symbol
              decimals
            }
            redeemableSupply
            totalDeposited
            totalRemaining
          }
        }`,
      variables: { saleAddress },
      requestPolicy: "network-only",
      pause: checked ? false : true
    }
  );

  $: myUndepositQuery = queryStore({
      client: $client,
      query: `
        query ($saleAddress: Bytes!, $depositor: Bytes!) {
          redeemableEscrowSupplyTokenDepositors (where: {iSaleAddress: $saleAddress, depositorAddress: $depositor}, orderBy: totalDeposited, orderDirection: asc) {
            id
            iSaleAddress
            iSale{
              saleStatus
            }
            escrowAddress
            depositorAddress
            token {
              id
              name
              symbol
              decimals
            }
            redeemableSupply
            totalDeposited
            totalRemaining
          }
        }`,
      variables: { saleAddress, depositor },
      requestPolicy: "network-only",
      pause: !checked ? false : true
    }
  );

  $: txQuery = checked ? allUndepositQuery : myUndepositQuery;

  // handling table refresh
  const refresh = async() => {
    if (!$txQuery.fetching) {
      temp = saleAddress;
      saleAddress = undefined;
      if (await !$txQuery.fetching) {
        saleAddress = temp;
      }
    }
  };
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Escrow Undeposit History</span>
    <div class="flex flex-row items-center gap-x-4">
      <span class="text-sm"
        >Showing {#if !checked}only mine{:else}all transactions{/if}</span
      >
      <Switch bind:checked />
      <span
        class:animate-spin={$txQuery.fetching}
        class="flex flex-col justify-center"
        on:click={refresh}><IconLibrary icon="reload" /></span
      >
    </div>
  </div>
  {#if $txQuery.fetching}
    Loading transactions...
  {:else if $txQuery.error}
    Something went wrong.
  {:else if $txQuery?.data?.redeemableEscrowSupplyTokenDepositors.length}
    <table class="table-auto w-full space-y-2 text-sm">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Depositor</th>
        <th class="text-gray-400 text-left pb-2 font-light">Token Address</th>
        <th class="text-gray-400 text-left pb-2 font-light">Symbol</th>
        <th class="text-gray-400 text-left pb-2 font-light">Total Deposited</th>
        <th class="text-gray-400 text-left pb-2 font-light"
          >Remaining Undeposit</th
        >
      </tr>
      {#each $txQuery.data.redeemableEscrowSupplyTokenDepositors as data}
        <tr>
          <td> {formatAddress(data.depositorAddress)} </td>
          <td>
            {formatAddress(data.token.id)}
          </td>
          <td>
            {data.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(data.totalDeposited, data.token.decimals)).toFixed(
                4
              )
            )}
            {data.token.symbol}
          </td>
          <td class="py-2">
            {Number(
              (+formatUnits(data.totalRemaining, data.token.decimals)).toFixed(
                4
              )
            )}
            {data.token.symbol}
          </td>
          <td class="py-2 text-right">
            {#if data.totalRemaining != "0"}
              <span
                class="underline cursor-pointer text-gray-400 mr-4"
                on:click={() => {
                  open(EscrowUndepositModal, {
                    data,
                    salesContract,
                    saleData,
                  });
                }}
              >
                Undeposit
              </span>
            {/if}
          </td>
        </tr>
      {/each}
    </table>
  {:else}
    You haven't made any transactions.
  {/if}
</div>
