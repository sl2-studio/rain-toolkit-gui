<script>
  import StepIcon from "./StepIcon.svelte";

  export let step;
  export let activeStep;
  export let name;
  export let classes;

  const [fulfilledTextClass, unfulfilledTextClass] = classes;

  let state;

  $: if (step == activeStep) {
    state = "active";
  }
  $: if (step < activeStep) {
    state = "fulfilled";
  }
  $: if (step > activeStep) {
    state = "unfulfilled";
  }
</script>

<div class="flex flex-shrink-0 flex-row items-center">
  <StepIcon {step} {state} />
  {#if state == "active"}
    <span class={`ml-2 text-sm ${fulfilledTextClass} leading-none`}>{name}</span
    >
  {:else if state == "fulfilled"}
    <span class={`ml-2 text-sm ${fulfilledTextClass} leading-none font-light`}
      >{name}</span
    >
  {:else if state == "unfulfilled"}
    <span class={`ml-2 text-sm ${unfulfilledTextClass} leading-none font-light`}
      >{name}</span
    >
  {/if}
</div>
