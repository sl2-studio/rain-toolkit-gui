<script lang="ts">
  import { createClient, setClient } from "@urql/svelte";

  import { AddressBook } from "rain-sdk";
  import { chainId } from "svelte-ethers-store";

  let ChainId = typeof $chainId == "number" ? $chainId : parseInt($chainId, 16);
  let client = createClient({
    // url: $selectedNetwork.graphUrl, selectedNetwork.config.
    url: AddressBook.getSubgraphEndpoint(ChainId),
  });

  setClient(client);
</script>

<slot />
