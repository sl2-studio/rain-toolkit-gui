<script lang="ts">
export let type = 'text'
export let value = ''
export let placeholder = ''
export let validator = (value:any) => null
let error

const handleInput = (e) => {
    value = type.match(/^(number|range)$/) ? +e.target.value : e.target.value
}

export const validate = () => {
    console.log(validator)
    console.log(validator(value))
    const validation = validator(value)
    if (validator(value)?.error) {
        ({
            error
        } = validation)
        return {
            ok: false
        }
    } else {
        error = null
        return {
            ok: true,
            value
        }
    }
}
</script>

<div class="gap-y-2 flex flex-col w-full">
    {#if $$slots.label}
    <div class="font-light text-gray-100">
        <slot name="label" />
    </div>
    {/if}
    {#if $$slots.description}
    <span class="text-gray-400">
        <slot name="description" />
    </span>
    {/if}
    <input
        {type}
        {value}
        {placeholder}
        on:input={handleInput}
        on:blur={validate}
        class="p-2 border border-gray-500 bg-transparent rounded-md font-light text-gray-200" />
    {#if error}
    <span class="text-red-400">{error}</span>
    {/if}
</div>
