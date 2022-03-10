<script lang="ts">
  import { OperationStore } from "@urql/svelte";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import { selectedNetwork } from "src/stores";
  import IconLibrary from "src/components/IconLibrary.svelte";
  import DisplayAddress from "src/components/DisplayAddress.svelte";
  export let verifyAddressQuery: OperationStore;

  $: console.log($verifyAddressQuery);
</script>

<DataTable>
  <Head>
    <Row>
      <Cell>Type</Cell>
      <Cell>Account</Cell>
      <Cell>Evidence</Cell>
      <Cell>Sender</Cell>
    </Row>
  </Head>
  <Body>
    {#each $verifyAddressQuery.data.verifyEvents as event}
      <Row>
        <Cell>
          {event.__typename}
        </Cell>
        <Cell>
          <DisplayAddress address={event.account} />
        </Cell>
        <Cell>
          {event.data}
        </Cell>
        <Cell>
          <DisplayAddress address={event.sender} />
        </Cell>
        <Cell>
          <a
            href={`${$selectedNetwork.blockExplorer}/tx/${event.transactionHash}`}
            target="_blank"
          >
            <IconLibrary icon="link" color="font-gray-100" width={10} />
          </a>
        </Cell>
      </Row>
    {/each}
  </Body>
</DataTable>
