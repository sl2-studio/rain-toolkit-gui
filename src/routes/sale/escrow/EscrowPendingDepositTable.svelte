<script lang="ts">
  import { formatAddress } from "src/utils";
  import { queryStore } from "@urql/svelte";
  import { formatUnits } from "ethers/lib/utils";
  import { signerAddress } from "svelte-ethers-store";
  import { getContext } from "svelte";
  import IconLibrary from "../../../components/IconLibrary.svelte";
  import Switch from "src/components/Switch.svelte";
  import { saleStatuses } from "../sale";
  import EscrowSweepPendingModal from "./EscrowSweepPendingModal.svelte";
  import { client } from "src/stores";

  const { open } = getContext("simple-modal");

  export let salesContract;

  let checked = true;
  let temp;

  let saleAddress = salesContract ? salesContract.address.toLowerCase() : undefined;
  let depositor = $signerAddress.toLowerCase();

  $: allPendingDepositQuery = queryStore({
      client: $client,
      query: `
        query ($saleAddress: Bytes!) {
          redeemableEscrowPendingDepositorTokens (where: {iSaleAddress: $saleAddress}, orderBy: totalDeposited, orderDirection: asc) {
            id
            depositorAddress
            escrowAddress
            iSale{
              saleStatus
            }
            iSaleAddress
            token {
              id
              name
              symbol
              decimals
            }
            totalDeposited
            swept
          }
        }`,
      variables: { saleAddress },
      requestPolicy: "network-only",
      pause: checked ? false : true
    }
  );

  $: myPendingDepositQuery = queryStore({
      client: $client,
      query: `
        query ($saleAddress: Bytes!, $depositor: Bytes!) {
          redeemableEscrowPendingDepositorTokens (where: {iSaleAddress: $saleAddress, depositorAddress: $depositor}, orderBy: totalDeposited, orderDirection: asc) {
            id
            depositorAddress
            escrowAddress
            iSale{
              saleStatus
            }
            iSaleAddress
            token {
              id
              name
              symbol
              decimals
            }
            totalDeposited
            swept
          }
        }`,
      variables: { saleAddress, depositor },
      requestPolicy: "network-only",
      pause: !checked ? false : true
    }
  );

  $: txQuery = checked ? allPendingDepositQuery : myPendingDepositQuery;

  // handling table refresh
  const refresh = async() => {
    temp = saleAddress;
    saleAddress = undefined;
    if (await !$txQuery.fetching) {
      saleAddress = temp;
    }
  };

  // aliases for convenience
  $: saleStatus =
    saleStatuses[
      $txQuery?.data?.redeemableEscrowPendingDepositorTokens[0]?.iSale
        ?.saleStatus
    ];
  $: token = $txQuery?.data?.redeemableEscrowPendingDepositorTokens[0]?.token;
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-row justify-between">
    <span class="text-lg font-semibold">Escrow Pending Deposit History</span>
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
  {:else if $txQuery?.data?.redeemableEscrowPendingDepositorTokens.length}
    <table class="table-auto w-full space-y-2 text-sm">
      <tr class="border-b border-gray-600 uppercase text-sm">
        <th class="text-gray-400 text-left pb-2 font-light">Depositor</th>
        <th class="text-gray-400 text-left pb-2 font-light">Token Address</th>
        <th class="text-gray-400 text-left pb-2 font-light">Symbol</th>
        <th class="text-gray-400 text-left pb-2 font-light">Deposited Amount</th
        >
      </tr>
      {#each $txQuery.data.redeemableEscrowPendingDepositorTokens as data}
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
          <td class="py-2 text-right">
            {#if (saleStatus == "Success" || saleStatus == "Fail") && data.swept == false}
              <span
                class="underline cursor-pointer text-gray-400 mr-4"
                on:click={() => {
                  open(EscrowSweepPendingModal, {
                    data,
                    salesContract,
                  });
                }}
              >
                Sweep
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
