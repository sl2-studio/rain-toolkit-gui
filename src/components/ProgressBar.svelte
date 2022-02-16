<script>
export let progress = 0
export let total = 0
export let color = 'green'
export let height = 4

let raiseOverMin = 0

$: overMax = progress > total
$: progressMin = total ? progress / total * 100 : 0
$: if (overMax) {
    raiseOverMin = total ? total / progress * 100 : 0
}

let barHeight = ""

$: if (height == 4) {
    barHeight = "h-4"
} else if (height == 5) {
    barHeight = "h-5"
}

</script>
<div class="relative overflow-y-hidden w-full">
    <div class="w-full {barHeight} rounded-full bg-gray-300 overflow-hidden">
        <div 
            class="h-full {color}"
            style="width:{progressMin}%"
            >
        </div>
    </div>
    {#if overMax}
    <div class="border-l border-gray-500 scale-y-110 absolute" style="top:-5px; bottom:-5px; left:{raiseOverMin}%"></div>
    {/if} 
</div>


<style>
    .green {
        @apply bg-green-500
    }

    .blue {
        @apply bg-blue-500
    }
</style>