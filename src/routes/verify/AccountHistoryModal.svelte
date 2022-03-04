<script lang="ts">
  import { OperationStore } from "@urql/svelte";

  export let verifyAddressQuery: OperationStore;

  $: console.log($verifyAddressQuery);
</script>

<div class="table">
  <div class="table-row">
    <div class="table-cell" />
  </div>
</div>
