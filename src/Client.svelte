<script lang="ts">
  import { createClient, initClient, setClient } from "@urql/svelte";
  import { onMount } from "svelte";

  import { selectedNetwork } from "./stores";

  console.log("reinit");

  let client = createClient({
    url: $selectedNetwork.graphUrl,
  });

  setClient(client);

  onMount(() => {
    console.log("in onmount");
  });
</script>

<slot />
