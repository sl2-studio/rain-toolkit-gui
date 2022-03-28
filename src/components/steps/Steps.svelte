<script>
  import Step from "./Step.svelte";
  export let steps = [];
  export let activeStep;
  export let lineBorderClass = "border-gray-200";
  export let fulfilledTextClass = "text-gray-800";
  export let unfulfilledTextClass = "text-gray-500";
</script>

<div class="flex flex-row items-center space-x-2">
  {#each steps as step, i}
    <Step
      name={step}
      step={i}
      {activeStep}
      classes={[fulfilledTextClass, unfulfilledTextClass]}
    />
    {#if i !== steps.length - 1}
      <span class={`w-32 h-px border-t ${lineBorderClass}`} />
    {/if}
  {/each}
</div>
