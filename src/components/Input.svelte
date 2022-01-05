<script>
export let type = 'text'
export let value = null
export let placeholder = ""

const handleInput = e => {
    value = type.match(/^(number|range)$/)
      ? +e.target.value
      : e.target.value;
  };

</script>

<div class="space-y-3 flex flex-col">
    <div class="font-light text-gray-100">
        <slot name="label">
        </slot>
    </div>


    <input
        {type}
        {value}
        {placeholder}
        on:input={handleInput}
        class="p-4 border border-gray-200 bg-transparent font-light text-gray-200"
    />

    <slot name="description">
    </slot>
</div>