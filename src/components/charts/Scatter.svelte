<!--
  @component
  Generates an SVG scatter plot. This component can also work if the x- or y-scale is ordinal, i.e. it has a `.bandwidth` method. See the [timeplot chart](https://layercake.graphics/example/Timeplot) for an example.
 -->
<script>
  import { getContext } from "svelte";

  const { data, xGet, yGet, xScale, yScale } = getContext("LayerCake");
  const hoverItem = getContext("found");

  /** @type {Number} [r=5] – The circle's radius. */
  export let r = 3;

  /** @type {String} [fill='#0cf'] – The circle's fill color. */
  export let fill = "#0cf";

  /** @type {String} [stroke='#000'] – The circle's stroke color. */
  export let stroke = "#FFFFFF";

  /** @type {Number} [strokeWidth=0] – The circle's stroke width. */
  export let strokeWidth = 1;
</script>

<g class="scatter-group">
  {#each $data as d}
    {#if d == $hoverItem}
      <circle
        cx={$xGet(d) + ($xScale.bandwidth ? $xScale.bandwidth() / 2 : 0)}
        cy={$yGet(d) + ($yScale.bandwidth ? $yScale.bandwidth() / 2 : 0)}
        {r}
        {fill}
        {stroke}
        stroke-width={strokeWidth}
      />
    {/if}
  {/each}
</g>
