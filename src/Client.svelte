<script lang="ts">
  import { createClient, setClient } from "@urql/svelte";

  // import { selectedNetwork } from "./stores";

  import { AddressBook } from "rain-sdk";

  let client = createClient({
    // url: $selectedNetwork.graphUrl,
    url: AddressBook.getSubgraphEndpoint(80001),
  });

  setClient(client);
</script>

<slot />
