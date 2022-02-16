<script>
import Step from './Step.svelte'
export let steps = []
export let activeStep
console.log(activeStep)
export let lineBorderClass = 'border-gray-200'
export let fulfilledTextClass = 'text-gray-800'
export let unfulfilledTextClass = 'text-gray-500'
</script>

<div class = "flex flex-row space-x-2 items-center">
    {#each steps as step, i}
        <Step name={step} step={i} activeStep={activeStep} classes={[fulfilledTextClass, unfulfilledTextClass]}/>
        {#if i !== steps.length - 1}
            <span class={`w-32 h-px border-t ${lineBorderClass}`}></span>
        {/if}
    {/each}
</div>