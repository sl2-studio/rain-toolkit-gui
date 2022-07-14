import { createClient } from "@urql/svelte";
import { AddressBook } from "rain-sdk";
import { derived, writable } from "svelte/store";
import { networks } from "./constants";


export const selectedNetwork = writable(networks[1]);
export const client = derived(
  selectedNetwork,
  $selectedNetwork => createClient({
    // url: AddressBook.getSubgraphEndpoint(Number($selectedNetwork.config.chainId))
    url: "https://api.thegraph.com/subgraphs/name/beehive-innovation/rain-protocol-mumbai-v3"
  })
)
export const transactionModal = writable(null)
