<script lang="ts">
  import { Contract, logger } from "ethers";
  import { Logger } from "ethers/lib/utils";
  import { selectedNetwork } from "src/stores";
  import NewAddress from "./NewAddress.svelte";
  import Ring from "./Ring.svelte";
  import { AddressBook } from "rain-sdk";

  const addresses = AddressBook.getAddressesForChainId(
    parseInt($selectedNetwork.config.chainId)
  );

  export let deployPromise: Promise<Contract>;
  export let type: string;
  let errorMsg,
    err = false,
    isReceipt = false;

  let contractAddress;

  deployPromise
    .then((receipt) => {
      isReceipt = true;
      contractAddress = receipt.address;
    })
    .catch(async (error) => {
      if (error.code === Logger.errors.TRANSACTION_REPLACED) {
        if (error.cancelled) {
          errorMsg = "Transaction Cancelled";
          err = true;
          return;
        } else {
          isReceipt = true;
          const eventObjs = error.receipt.logs.filter(
            (e) =>
              e.topics[0] ==
                "0x7da70c4e5387d7038610b79ca7d304caaef815826e51e67cf247135387a79bce" &&
              (e.address === addresses.saleFactory ||
                e.address === addresses.combineTierFactory ||
                e.address === addresses.emissionsERC20Factory ||
                e.address === addresses.erc20BalanceTierFactory ||
                e.address === addresses.erc20TransferTierFactory ||
                e.address === addresses.erc721BalanceTierFactory ||
                e.address === addresses.gatedNFTFactory ||
                e.address === addresses.noticeBoard ||
                e.address === addresses.redeemableERC20Factory ||
                e.address === addresses.verifyFactory ||
                e.address === addresses.verifyTierFactory)
          );

          contractAddress =
            "0x" +
            eventObjs[0].data.substring(2).substring(64).replace(/^0+/, "");
          // txReceipt = await error.replacement.wait();
        }
      } else {
        errorMsg = error.data?.message || error?.message;
        err = true;
        return;
      }
    });
</script>

<div class="flex flex-col gap-y-2">
  {#await deployPromise}
    <div class="flex flex-row gap-x-4 items-center">
      <Ring color="#FFFFFF" />
      <span class="text-lg">
        Deploying new {type}...
      </span>
    </div>
  {/await}
  {#if isReceipt}
    <span class="text-lg font-semibold">New {type} deployed!</span>
    <div class="flex flex-row items-center gap-x-2">
      <span>Save to library: </span><NewAddress
        address={contractAddress}
        {type}
      />
    </div>
    <span>
      <a
        target="_blank"
        class="underline"
        href={`${$selectedNetwork.blockExplorer}/address/${contractAddress}`}
      >
        View contract on block explorer
      </a>
    </span>
    <!-- <span>
      <a
        target="_blank"
        class="underline"
        href={`${$selectedNetwork.blockExplorer}/tx/${receipt.transactionHash}`}
      >
        View transaction on block explorer
      </a>
    </span> -->
  {/if}
  {#if err}
    <div class="text-red-400">{errorMsg}</div>
  {/if}
</div>
