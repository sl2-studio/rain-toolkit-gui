<script lang="ts">
  import Button from "src/components/Button.svelte";
  import Input from "src/components/Input.svelte";
  import SimpleTransactionModal from "src/components/SimpleTransactionModal.svelte";
  import { validateFields } from "src/utils";
  import { defaultValidator } from "src/validation";
  import { getContext } from "svelte";

  const { open } = getContext("simple-modal");

  export let method: Function;
  export let action: string;
  export let account: string;
  export let confirmationMsg: string;

  let fields: any = {};
  let sendTransaction;
  let data;

  const encoder = new TextEncoder();

  const handleClick = () => {
    const { validationResult, fieldValues } = validateFields(fields);
    if (validationResult) {
      if (fieldValues.evidence) {
        data = encoder.encode(fieldValues.evidence);
      } else {
        data = encoder.encode("");
      }
    }
    sendTransaction = true;
  };
</script>

{#if !sendTransaction}
  <div class="flex max-w-md flex-col gap-y-4">
    <div class="flex flex-col gap-y-2">
      <div class="text-lg">{action} account</div>
      <div class="text-gray-400">{account}</div>
    </div>

    <Input bind:this={fields.evidence} validator={defaultValidator}>
      <div slot="label">Evidence</div>
      <div slot="description">
        Optionally provide "evidence" for this action. This will not be stored
        on-chain, but will be passed to the indexer and viewable by anyone.
      </div>
    </Input>

    <Button on:click={handleClick}>{action}</Button>
  </div>
{:else}
  <SimpleTransactionModal
    {confirmationMsg}
    {method}
    args={[[{ account, data }]]}
  />
{/if}
