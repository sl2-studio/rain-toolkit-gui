<script>
  import { onMount } from "svelte";
  import { formatAddress } from "../utils";
  import GenericSkeletonLoader from "./GenericSkeletonLoader.svelte";

  export let address;

  $: displayAddress = address ? formatAddress(address) : "XXXX....XXXX";
</script>

<GenericSkeletonLoader show={address}>
  <span class="text-sm">{displayAddress}</span>
</GenericSkeletonLoader>
