<script lang="ts">
  import { createClient, setClient } from "@urql/svelte";

  import { selectedNetwork } from "./stores";

  let client = createClient({
    url: $selectedNetwork.graphUrl,
  });

  setClient(client);
</script>

<slot />
